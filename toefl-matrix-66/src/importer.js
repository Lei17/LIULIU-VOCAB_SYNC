/**
 * importer.js - 词库导入管理模块
 * 支持 Electron IPC (SQLite) 和浏览器降级 (File API + localStorage)
 */
const Importer = (() => {
  const CACHE_KEY = 'toefl_matrix66_active_wordlist';
  const LISTS_KEY = 'toefl_matrix66_wordlists_meta';
  let _lists = [];
  let _activeListId = null;
  let _onImportCallback = null;

  function isElectron() {
    return !!(window.electronAPI && window.electronAPI.importWordList);
  }

  /** Initialize: load word list metadata */
  async function init() {
    if (isElectron()) {
      _lists = await window.electronAPI.getWordLists();
    } else {
      try {
        _lists = JSON.parse(localStorage.getItem(LISTS_KEY) || '[]');
      } catch (e) {
        _lists = [];
      }
    }
    // Restore active list ID
    const stored = Storage.get();
    _activeListId = stored.activeListId || null;
    return _lists;
  }

  /** Get all imported word lists */
  function getLists() {
    return _lists;
  }

  /** Get active list ID */
  function getActiveListId() {
    return _activeListId;
  }

  /** Set callback for after import */
  function onImport(cb) {
    _onImportCallback = cb;
  }

  /** Trigger file import dialog */
  async function importFile() {
    if (isElectron()) {
      return await _importElectron();
    } else {
      return await _importBrowser();
    }
  }

  /** Electron import via IPC */
  async function _importElectron() {
    const result = await window.electronAPI.importWordList();
    if (!result || !result.success) {
      if (result && result.error === 'cancelled') return null;
      throw new Error(result ? result.error : 'Import failed');
    }

    // Refresh list
    _lists = await window.electronAPI.getWordLists();
    _activeListId = result.listId;
    Storage.updateSettings({ activeListId: _activeListId });

    if (_onImportCallback) _onImportCallback(result);
    return result;
  }

  /** Browser fallback: file input + localStorage */
  async function _importBrowser() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.tsv,.json';
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) { resolve(null); return; }

        try {
          const text = await file.text();
          const words = _parseText(text, file.name);
          if (words.length === 0) {
            reject(new Error('文件中未找到有效词汇'));
            return;
          }

          const listId = Date.now();
          const listMeta = {
            id: listId,
            name: file.name.replace(/\.[^.]+$/, ''),
            source: 'import',
            word_count: words.length,
            import_date: new Date().toISOString(),
            description: `Browser import from ${file.name}`
          };

          // Store words in localStorage
          localStorage.setItem(`wl_${listId}`, JSON.stringify(words));
          _lists.unshift(listMeta);
          localStorage.setItem(LISTS_KEY, JSON.stringify(_lists));

          _activeListId = listId;
          Storage.updateSettings({ activeListId: _activeListId });

          if (_onImportCallback) _onImportCallback(listMeta);
          resolve(listMeta);
        } catch (e) {
          reject(e);
        }
      };
      input.click();
    });
  }

  /** Browser-side file parser */
  function _parseText(content, fileName) {
    const ext = fileName.split('.').pop().toLowerCase();

    if (ext === 'json') {
      let data = JSON.parse(content);
      if (!Array.isArray(data)) {
        if (data.words) data = data.words;
        else if (data.data) data = data.data;
        else return [];
      }
      return data.map(item => ({
        id: `br_t${Math.random().toString(36).slice(2, 8)}`,
        word: item.word || item['词汇'] || item['单词'] || '',
        phonetic_us: item.phonetic_us || item.phonetic || item['音标'] || '',
        pos: item.pos || item['词性'] || '',
        definition: item.definition || item['释义'] || item.meaning || ''
      })).filter(w => w.word);
    }

    // CSV or TSV
    const delimiter = ext === 'tsv' ? '\t' : ',';
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    const fieldMap = headers.map(h => _mapField(h));
    if (!fieldMap.includes('word')) {
      fieldMap[0] = 'word';
      if (headers.length > 1 && !fieldMap.includes('definition')) fieldMap[1] = 'definition';
    }

    const words = [];
    for (let i = 1; i < lines.length; i++) {
      const values = delimiter === ','
        ? _parseCSVLine(lines[i])
        : lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      const entry = { word: '', phonetic_us: '', pos: '', definition: '' };
      let hasWord = false;
      for (let j = 0; j < fieldMap.length && j < values.length; j++) {
        if (fieldMap[j]) {
          entry[fieldMap[j]] = values[j] || '';
          if (fieldMap[j] === 'word' && values[j]) hasWord = true;
        }
      }
      if (hasWord) {
        entry.id = `br_t${String(i).padStart(5, '0')}`;
        words.push(entry);
      }
    }
    return words;
  }

  function _mapField(header) {
    const h = header.toLowerCase().trim();
    if (/^(word|词汇|单词|term)$/.test(h)) return 'word';
    if (/^(phonetic|pronunciation|音标|phonetic_us)$/.test(h)) return 'phonetic_us';
    if (/^(pos|part_of_speech|词性)$/.test(h)) return 'pos';
    if (/^(definition|meaning|释义|中文|def)$/.test(h)) return 'definition';
    return null;
  }

  function _parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; }
      else current += ch;
    }
    fields.push(current.trim());
    return fields;
  }

  /** Load words from a specific list */
  async function loadList(listId) {
    _activeListId = listId;
    Storage.updateSettings({ activeListId: listId });

    if (isElectron()) {
      return await window.electronAPI.loadWordList(listId);
    } else {
      try {
        return JSON.parse(localStorage.getItem(`wl_${listId}`) || '[]');
      } catch (e) {
        return [];
      }
    }
  }

  /** Delete a word list */
  async function deleteList(listId) {
    if (isElectron()) {
      await window.electronAPI.deleteWordList(listId);
    } else {
      localStorage.removeItem(`wl_${listId}`);
    }

    _lists = _lists.filter(l => l.id !== listId);
    if (!isElectron()) {
      localStorage.setItem(LISTS_KEY, JSON.stringify(_lists));
    }

    if (_activeListId === listId) {
      _activeListId = _lists.length > 0 ? _lists[0].id : null;
      Storage.updateSettings({ activeListId: _activeListId });
    }
  }

  /** Refresh word lists from backend */
  async function refresh() {
    if (isElectron()) {
      _lists = await window.electronAPI.getWordLists();
    } else {
      try {
        _lists = JSON.parse(localStorage.getItem(LISTS_KEY) || '[]');
      } catch (e) {
        _lists = [];
      }
    }
    return _lists;
  }

  return {
    init, getLists, getActiveListId, onImport,
    importFile, loadList, deleteList, refresh,
    isElectron
  };
})();
