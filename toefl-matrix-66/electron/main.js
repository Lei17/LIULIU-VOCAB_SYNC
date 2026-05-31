const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const USER_DATA_FILE = path.join(app.getPath('userData'), 'user-data.json');
const DB_PATH = path.join(app.getPath('userData'), 'wordlists.db');

let db = null;

// ========== SQLite Initialization ==========

function initDatabase() {
  try {
    const Database = require('better-sqlite3');
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS word_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        source TEXT DEFAULT 'import',
        word_count INTEGER DEFAULT 0,
        import_date TEXT,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL,
        word TEXT NOT NULL,
        phonetic_us TEXT DEFAULT '',
        pos TEXT DEFAULT '',
        definition TEXT DEFAULT '',
        FOREIGN KEY (list_id) REFERENCES word_lists(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_words_list ON words(list_id);
    `);
    console.log('SQLite database initialized:', DB_PATH);
  } catch (e) {
    console.error('Failed to initialize SQLite:', e);
    // Write error to log file for debugging packaged app
    try {
      const logPath = path.join(app.getPath('userData'), 'sqlite-error.log');
      fs.writeFileSync(logPath, `Error: ${e.message}\nStack: ${e.stack}\nNode version: ${process.version}\nElectron: ${process.versions.electron || 'N/A'}\nNODE_MODULE_VERSION: ${process.versions.modules}\n`, 'utf8');
    } catch (le) { /* ignore */ }
    // Store error for IPC reporting
    global.__dbInitError = e.message;
  }
}

// ========== File Parsing ==========

function mapField(header) {
  const h = header.toLowerCase().trim();
  if (/^(word|词汇|单词|term|vocabulary)$/.test(h)) return 'word';
  if (/^(phonetic|pronunciation|音标|phonetic_us|发音)$/.test(h)) return 'phonetic_us';
  if (/^(pos|part_of_speech|词性|speech_part)$/.test(h)) return 'pos';
  if (/^(definition|meaning|释义|中文|def|translate|翻译)$/.test(h)) return 'definition';
  return null;
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseDelimited(content, delimiter) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const fieldMap = headers.map(h => mapField(h));

  // Must have at least a 'word' column
  if (!fieldMap.includes('word')) {
    // Fallback: assume first col is word, second is definition
    fieldMap[0] = 'word';
    if (headers.length > 1 && !fieldMap.includes('definition')) fieldMap[1] = 'definition';
  }

  const words = [];
  for (let i = 1; i < lines.length; i++) {
    const values = delimiter === ','
      ? parseCSVLine(lines[i])
      : lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));

    const entry = { word: '', phonetic_us: '', pos: '', definition: '' };
    let hasWord = false;
    for (let j = 0; j < fieldMap.length && j < values.length; j++) {
      if (fieldMap[j]) {
        entry[fieldMap[j]] = values[j] || '';
        if (fieldMap[j] === 'word' && values[j]) hasWord = true;
      }
    }
    if (hasWord && entry.word) {
      words.push(entry);
    }
  }
  return words;
}

function parseJSON(content) {
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    return [];
  }

  // Handle array of objects
  if (!Array.isArray(data)) {
    // Try to find array in common wrapper keys
    if (data.words && Array.isArray(data.words)) data = data.words;
    else if (data.data && Array.isArray(data.data)) data = data.data;
    else return [];
  }

  return data.map(item => {
    const entry = {
      word: item.word || item['词汇'] || item['单词'] || item.term || '',
      phonetic_us: item.phonetic_us || item.phonetic || item['音标'] || item.pronunciation || '',
      pos: item.pos || item['词性'] || item.part_of_speech || '',
      definition: item.definition || item['释义'] || item.meaning || item['中文'] || ''
    };
    return entry.word ? entry : null;
  }).filter(Boolean);
}

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    return parseJSON(content);
  } else if (ext === '.tsv') {
    return parseDelimited(content, '\t');
  } else {
    // CSV or auto-detect
    // Check if it looks like TSV (more tabs than commas in first line)
    const firstLine = content.split(/\r?\n/)[0] || '';
    if (firstLine.split('\t').length > firstLine.split(',').length) {
      return parseDelimited(content, '\t');
    }
    return parseDelimited(content, ',');
  }
}

// ========== IPC Handlers ==========

function setupIPC() {
  // --- User data (existing) ---
  ipcMain.handle('load-user-data', () => {
    try {
      if (fs.existsSync(USER_DATA_FILE)) {
        return JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
    return null;
  });

  ipcMain.handle('save-user-data', (event, data) => {
    try {
      fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Failed to save user data:', e);
      return false;
    }
  });

  // --- Word list import ---
  ipcMain.handle('import-wordlist', async () => {
    if (!db) return { success: false, error: 'Database not initialized: ' + (global.__dbInitError || 'unknown') };

    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win, {
      title: '导入词库文件',
      filters: [
        { name: 'Word Lists', extensions: ['csv', 'tsv', 'json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'cancelled' };
    }

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath, path.extname(filePath));

    try {
      const words = parseFile(filePath);
      if (words.length === 0) {
        return { success: false, error: 'No valid words found in file' };
      }

      // Insert word list
      const insertList = db.prepare(
        'INSERT INTO word_lists (name, source, word_count, import_date, description) VALUES (?, ?, ?, ?, ?)'
      );
      const info = insertList.run(
        fileName, 'import', words.length,
        new Date().toISOString(), `Imported from ${path.basename(filePath)}`
      );
      const listId = info.lastInsertRowid;

      // Batch insert words
      const insertWord = db.prepare(
        'INSERT INTO words (list_id, word, phonetic_us, pos, definition) VALUES (?, ?, ?, ?, ?)'
      );
      const batchInsert = db.transaction((wordList) => {
        for (const w of wordList) {
          insertWord.run(listId, w.word, w.phonetic_us || '', w.pos || '', w.definition || '');
        }
      });
      batchInsert(words);

      return {
        success: true,
        listId: Number(listId),
        name: fileName,
        wordCount: words.length
      };
    } catch (e) {
      console.error('Import failed:', e);
      return { success: false, error: e.message };
    }
  });

  // --- Get all word lists ---
  ipcMain.handle('get-wordlists', () => {
    if (!db) return [];
    try {
      return db.prepare('SELECT * FROM word_lists ORDER BY import_date DESC').all();
    } catch (e) {
      console.error('Failed to get word lists:', e);
      return [];
    }
  });

  // --- Load a specific word list ---
  ipcMain.handle('load-wordlist', (event, listId) => {
    if (!db) return [];
    try {
      const words = db.prepare(
        `SELECT id, word, phonetic_us, pos, definition FROM words WHERE list_id = ? ORDER BY id`
      ).all(listId);

      // Transform to app format with prefixed IDs
      return words.map((w, i) => ({
        id: `wl${listId}_t${String(i + 1).padStart(5, '0')}`,
        word: w.word,
        phonetic_us: w.phonetic_us || '',
        pos: w.pos || '',
        definition: w.definition || ''
      }));
    } catch (e) {
      console.error('Failed to load word list:', e);
      return [];
    }
  });

  // --- Delete a word list ---
  ipcMain.handle('delete-wordlist', (event, listId) => {
    if (!db) return false;
    try {
      db.prepare('DELETE FROM words WHERE list_id = ?').run(listId);
      db.prepare('DELETE FROM word_lists WHERE id = ?').run(listId);
      return true;
    } catch (e) {
      console.error('Failed to delete word list:', e);
      return false;
    }
  });
}

// ========== Window ==========

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: '66背词看板',
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0a0a0f',
    show: false
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    win.loadFile(indexPath);
  } else {
    win.loadURL('http://localhost:5173');
  }

  win.once('ready-to-show', () => {
    win.show();
  });
}

// ========== App Lifecycle ==========

app.whenReady().then(() => {
  initDatabase();
  setupIPC();
  createWindow();
});

app.on('window-all-closed', () => {
  if (db) {
    try { db.close(); } catch (e) { /* ignore */ }
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
