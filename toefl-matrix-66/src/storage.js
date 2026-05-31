/**
 * storage.js - 本地数据持久化模块
 * 支持 Electron IPC 存储和 localStorage 回退
 */
const Storage = (() => {
  const STORAGE_KEY = 'toefl_matrix66_data';
  let _cache = null;

  const DEFAULT_DATA = {
    // wordId -> 'familiar' | 'unfamiliar' | null
    wordStatus: {},
    // timestamps of study sessions (ISO date strings)
    studyDays: [],
    // current active list index
    currentListIndex: 0,
    // settings
    settings: {
      voiceType: 'us',
      speechRate: 1.0,
      matrixDensity: 66,
      fontSize: 16,
      theme: 'cyberpunk'
    },
    // today's studied word IDs
    todayStudied: [],
    todayDate: null,
    // total interactions count
    totalInteractions: 0
  };

  async function load() {
    if (_cache) return _cache;
    let data = null;
    // Try Electron IPC
    if (window.electronAPI) {
      try {
        data = await window.electronAPI.loadUserData();
      } catch (e) { /* fallback */ }
    }
    // Fallback to localStorage
    if (!data) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) data = JSON.parse(raw);
      } catch (e) { /* ignore */ }
    }
    _cache = Object.assign({}, DEFAULT_DATA, data || {});
    _cache.settings = Object.assign({}, DEFAULT_DATA.settings, (_cache.settings || {}));
    // Backward compat: migrate darkMode -> theme
    if (_cache.settings.darkMode !== undefined && !_cache.settings.theme) {
      _cache.settings.theme = 'cyberpunk';
      delete _cache.settings.darkMode;
    }
    return _cache;
  }

  async function save() {
    if (!_cache) return;
    const json = JSON.stringify(_cache, null, 2);
    // Try Electron IPC
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveUserData(_cache);
      } catch (e) { /* fallback */ }
    }
    // Always save to localStorage as backup
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) { /* ignore */ }
  }

  function get() {
    return _cache || DEFAULT_DATA;
  }

  function getWordStatus(wordId) {
    return (_cache && _cache.wordStatus[wordId]) || null;
  }

  function setWordStatus(wordId, status) {
    if (!_cache) return;
    if (status === null) {
      delete _cache.wordStatus[wordId];
    } else {
      _cache.wordStatus[wordId] = status;
    }
    // Record today's study
    const today = new Date().toISOString().slice(0, 10);
    if (_cache.todayDate !== today) {
      _cache.todayDate = today;
      _cache.todayStudied = [];
    }
    if (!_cache.todayStudied.includes(wordId)) {
      _cache.todayStudied.push(wordId);
    }
    _cache.totalInteractions = (_cache.totalInteractions || 0) + 1;
    save();
  }

  function setCurrentListIndex(idx) {
    if (!_cache) return;
    _cache.currentListIndex = idx;
    save();
  }

  function updateSettings(partial) {
    if (!_cache) return;
    Object.assign(_cache.settings, partial);
    save();
  }

  function recordStudyDay() {
    if (!_cache) return;
    const today = new Date().toISOString().slice(0, 10);
    if (!_cache.studyDays.includes(today)) {
      _cache.studyDays.push(today);
      save();
    }
  }

  function getStreak() {
    if (!_cache) return 0;
    const days = [..._cache.studyDays].sort();
    if (days.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = days.length - 1; i >= 0; i--) {
      const d = new Date(days[i]);
      const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
      if (diff === streak || diff === streak + 1) {
        if (diff === streak + 1) streak++;
        // diff === streak means same day counted
      } else {
        break;
      }
    }
    // Count today
    const todayStr = today.toISOString().slice(0, 10);
    if (days.includes(todayStr) && streak === 0) streak = 1;
    return Math.max(streak, days.includes(todayStr) ? 1 : 0);
  }

  function getTodayCount() {
    if (!_cache) return 0;
    const today = new Date().toISOString().slice(0, 10);
    if (_cache.todayDate !== today) return 0;
    return (_cache.todayStudied || []).length;
  }

  function getAllStatuses() {
    return (_cache && _cache.wordStatus) || {};
  }

  async function resetAll() {
    _cache = JSON.parse(JSON.stringify(DEFAULT_DATA));
    await save();
  }

  function exportCSV(allWords) {
    const statuses = getAllStatuses();
    let csv = 'word,phonetic,pos,definition,status\n';
    allWords.forEach(w => {
      const st = statuses[w.id] || 'unmarked';
      csv += `"${w.word}","${w.phonetic_us || ''}","${w.pos || ''}","${(w.definition || '').replace(/"/g, '""')}","${st}"\n`;
    });
    return csv;
  }

  return {
    load, save, get, getWordStatus, setWordStatus,
    setCurrentListIndex, updateSettings, recordStudyDay,
    getStreak, getTodayCount, getAllStatuses, resetAll, exportCSV
  };
})();
