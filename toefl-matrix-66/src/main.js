/**
 * main.js - 前端主逻辑，初始化所有模块
 */
(async function main() {
  // Load stored data first
  await Storage.load();
  const settings = Storage.get().settings;

  // Init modules
  Audio.init();
  Tooltip.init();
  Matrix.init();
  Keyboard.init();

  // Apply saved settings to UI
  applySettings(settings);

  // Init Importer and load word lists
  await Importer.init();
  Importer.onImport(onImportComplete);

  // Load active word list
  const wordData = await loadActiveWordList();

  if (wordData.length > 0) {
    Matrix.setDensity(settings.matrixDensity || 66);
    Matrix.loadWords(wordData);
    showEmptyState(false);
  } else {
    Matrix.setDensity(settings.matrixDensity || 66);
    Matrix.loadWords([]);
    showEmptyState(true);
  }

  // Restore last session list
  const lastList = Storage.get().currentListIndex || 0;
  if (lastList < Matrix.getLists().length) {
    Matrix.setList(lastList);
  }

  // Record today's study day
  Storage.recordStudyDay();
  Matrix.updateStatusBar();

  // Render word list manager
  renderWordListManager();

  // Bind UI events
  bindEvents();
})();

/** Load the currently active word list */
async function loadActiveWordList() {
  const lists = Importer.getLists();
  const activeId = Importer.getActiveListId();

  if (lists.length === 0) return [];

  // If active ID not set or not found, use first list
  let targetId = activeId;
  if (!targetId || !lists.find(l => l.id === targetId)) {
    targetId = lists[0].id;
    Storage.updateSettings({ activeListId: targetId });
  }

  try {
    return await Importer.loadList(targetId);
  } catch (e) {
    console.error('Failed to load word list:', e);
    return [];
  }
}

/** Handle import completion */
async function onImportComplete(result) {
  showToast(`导入成功: ${result.name} (${result.word_count || result.wordCount} 词)`);
  showEmptyState(false);

  // Load the newly imported list
  const lists = await Importer.refresh();
  const newId = result.listId || result.id;
  if (newId) {
    Storage.updateSettings({ activeListId: newId });
    const words = await Importer.loadList(newId);
    Matrix.loadWords(words);
    Matrix.setList(0);
    Matrix.updateStatusBar();
  }

  renderWordListManager();
}

/** Show/hide empty state overlay */
function showEmptyState(show) {
  const el = document.getElementById('empty-state');
  if (show) {
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

/** Show toast notification */
function showToast(msg, duration) {
  duration = duration || 3000;
  const toast = document.getElementById('import-toast');
  document.getElementById('import-toast-msg').textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, duration);
}

/** Render the word list manager in settings panel */
function renderWordListManager() {
  const lists = Importer.getLists();
  const container = document.getElementById('wordlist-items');
  const emptyEl = document.getElementById('wordlist-empty');
  const activeId = Importer.getActiveListId();

  container.innerHTML = '';

  if (lists.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';

  lists.forEach(list => {
    const item = document.createElement('div');
    item.className = 'wordlist-item' + (list.id === activeId ? ' active' : '');

    const info = document.createElement('div');
    info.className = 'wordlist-info';
    info.innerHTML = `
      <span class="wl-name">${escapeHtml(list.name)}</span>
      <span class="wl-meta">${list.word_count || list.wordCount} 词 · ${formatDate(list.import_date)}</span>
    `;

    const actions = document.createElement('div');
    actions.className = 'wordlist-actions';

    if (list.id !== activeId) {
      const switchBtn = document.createElement('button');
      switchBtn.className = 'wl-btn';
      switchBtn.textContent = '切换';
      switchBtn.onclick = () => switchWordList(list.id);
      actions.appendChild(switchBtn);
    } else {
      const activeTag = document.createElement('span');
      activeTag.className = 'wl-active-tag';
      activeTag.textContent = '当前';
      actions.appendChild(activeTag);
    }

    const delBtn = document.createElement('button');
    delBtn.className = 'wl-btn wl-btn-danger';
    delBtn.textContent = '删除';
    delBtn.onclick = () => deleteWordList(list.id, list.name);
    actions.appendChild(delBtn);

    item.appendChild(info);
    item.appendChild(actions);
    container.appendChild(item);
  });
}

/** Switch to a different word list */
async function switchWordList(listId) {
  try {
    const words = await Importer.loadList(listId);
    if (words.length > 0) {
      Matrix.loadWords(words);
      Matrix.setList(0);
      Matrix.updateStatusBar();
      showEmptyState(false);
      renderWordListManager();
      showToast(`已切换词库 (${words.length} 词)`);
    }
  } catch (e) {
    showToast('切换失败: ' + e.message);
  }
}

/** Delete a word list with confirmation */
async function deleteWordList(listId, name) {
  if (!confirm(`确定删除词库 "${name}" 吗？此操作不可恢复。`)) return;

  try {
    await Importer.deleteList(listId);
    const lists = Importer.getLists();

    if (lists.length > 0) {
      const newId = lists[0].id;
      const words = await Importer.loadList(newId);
      Matrix.loadWords(words);
      Matrix.setList(0);
      Matrix.updateStatusBar();
      showEmptyState(false);
    } else {
      Matrix.loadWords([]);
      showEmptyState(true);
    }

    renderWordListManager();
    showToast(`已删除词库: ${name}`);
  } catch (e) {
    showToast('删除失败: ' + e.message);
  }
}

/** Utility: escape HTML */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/** Utility: format date */
function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    return new Date(isoStr).toLocaleDateString('zh-CN');
  } catch (e) {
    return '-';
  }
}

function applySettings(s) {
  document.getElementById('setting-voice-type').value = s.voiceType || 'us';
  document.getElementById('setting-speech-rate').value = s.speechRate || 1.0;
  document.getElementById('speech-rate-display').textContent = (s.speechRate || 1.0).toFixed(1) + 'x';
  document.getElementById('setting-matrix-density').value = s.matrixDensity || 66;
  document.getElementById('setting-font-size').value = s.fontSize || 16;
  document.getElementById('font-size-display').textContent = (s.fontSize || 16) + 'px';
  document.documentElement.style.setProperty('--matrix-font-size', (s.fontSize || 16) + 'px');
  applyTheme(s.theme || 'cyberpunk');
}

/** Apply UI theme */
function applyTheme(themeId) {
  if (!themeId || themeId === 'cyberpunk') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
  // Update theme selector active state
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === (themeId || 'cyberpunk'));
  });
}

/** Trigger import (shared handler for all import buttons) */
async function handleImport() {
  try {
    await Importer.importFile();
  } catch (e) {
    showToast('导入失败: ' + e.message);
  }
}

function bindEvents() {
  // Import buttons (3 entry points)
  document.getElementById('btn-import').addEventListener('click', handleImport);
  document.getElementById('btn-import-settings').addEventListener('click', handleImport);
  document.getElementById('btn-import-empty').addEventListener('click', handleImport);

  // List navigation
  document.getElementById('btn-prev-list').addEventListener('click', () => Matrix.prevList());
  document.getElementById('btn-next-list').addEventListener('click', () => Matrix.nextList());
  document.getElementById('list-select').addEventListener('change', (e) => {
    Matrix.setList(parseInt(e.target.value));
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => Matrix.setFilter(btn.dataset.filter));
  });

  // Stats panel toggle
  document.getElementById('btn-stats').addEventListener('click', () => {
    const panel = document.getElementById('stats-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) Stats.update();
  });
  document.getElementById('btn-close-stats').addEventListener('click', () => {
    document.getElementById('stats-panel').classList.add('hidden');
  });

  // Settings panel toggle
  document.getElementById('btn-settings').addEventListener('click', () => {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderWordListManager();
  });
  document.getElementById('btn-close-settings').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.add('hidden');
  });

  // Settings changes
  document.getElementById('setting-voice-type').addEventListener('change', (e) => {
    Storage.updateSettings({ voiceType: e.target.value });
  });

  document.getElementById('setting-speech-rate').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('speech-rate-display').textContent = val.toFixed(1) + 'x';
    Storage.updateSettings({ speechRate: val });
  });

  document.getElementById('setting-matrix-density').addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    Storage.updateSettings({ matrixDensity: val });
    Matrix.setDensity(val);
  });

  document.getElementById('setting-font-size').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    document.getElementById('font-size-display').textContent = val + 'px';
    document.documentElement.style.setProperty('--matrix-font-size', val + 'px');
    Storage.updateSettings({ fontSize: val });
  });

  document.getElementById('setting-dark-mode')?.addEventListener('change', (e) => {
    Storage.updateSettings({ darkMode: e.target.checked });
    document.body.style.filter = e.target.checked ? '' : 'invert(0.85) hue-rotate(180deg)';
  });

  // Theme selector
  document.querySelectorAll('#theme-selector .theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.theme;
      applyTheme(themeId);
      Storage.updateSettings({ theme: themeId });
    });
  });

  // Export CSV
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    const csv = Storage.exportCSV(Matrix.getAllWords());
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `学习报告_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Reset data
  document.getElementById('btn-reset-data').addEventListener('click', async () => {
    if (confirm('确定要重置所有学习数据吗？此操作不可恢复。')) {
      await Storage.resetAll();
      Matrix.render();
      Stats.update();
      Matrix.updateStatusBar();
      alert('数据已重置。');
    }
  });

  // Sponsor modal
  document.getElementById('btn-sponsor').addEventListener('click', () => {
    document.getElementById('sponsor-modal').classList.remove('hidden');
  });
  document.getElementById('btn-sponsor-close').addEventListener('click', () => {
    document.getElementById('sponsor-modal').classList.add('hidden');
  });
  document.getElementById('sponsor-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
}
