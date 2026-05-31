/**
 * matrix.js - 66词矩阵渲染与交互
 */
const Matrix = (() => {
  let _container, _grid;
  let _words = [];        // current display words
  let _allWords = [];     // all loaded words
  let _lists = [];        // list groups
  let _currentListIdx = 0;
  let _filter = 'all';
  let _focusIdx = -1;
  let _density = 66;

  function init() {
    _container = document.getElementById('matrix-container');
    _grid = document.getElementById('word-matrix');
  }

  function loadWords(wordData) {
    _allWords = wordData;
    _lists = [];
    // Split into lists of _density words
    for (let i = 0; i < _allWords.length; i += _density) {
      _lists.push(_allWords.slice(i, i + _density));
    }
    if (_lists.length === 0) _lists = [[]];
    populateListSelector();
    setList(_currentListIdx);
  }

  function setDensity(d) {
    _density = d;
    _grid.className = 'matrix-grid density-' + d;
    // Re-split lists
    _lists = [];
    for (let i = 0; i < _allWords.length; i += d) {
      _lists.push(_allWords.slice(i, i + d));
    }
    if (_lists.length === 0) _lists = [[]];
    populateListSelector();
    if (_currentListIdx >= _lists.length) _currentListIdx = 0;
    setList(_currentListIdx);
    document.documentElement.style.setProperty('--matrix-font-size', (Storage.get().settings.fontSize || 16) + 'px');
  }

  function populateListSelector() {
    const sel = document.getElementById('list-select');
    sel.innerHTML = '';
    _lists.forEach((_, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `List ${i + 1}`;
      sel.appendChild(opt);
    });
    sel.value = _currentListIdx;
  }

  function setList(idx) {
    if (idx < 0 || idx >= _lists.length) return;
    _currentListIdx = idx;
    Storage.setCurrentListIndex(idx);
    document.getElementById('list-select').value = idx;
    document.getElementById('list-info').textContent = `List ${idx + 1} / ${_lists[idx].length}词`;
    _focusIdx = -1;
    render();
    Stats.update();
    updateStatusBar();
  }

  function nextList() { setList((_currentListIdx + 1) % _lists.length); }
  function prevList() { setList((_currentListIdx - 1 + _lists.length) % _lists.length); }

  function setFilter(f) {
    _filter = f;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === f);
    });
    render();
  }

  function render() {
    const listWords = _lists[_currentListIdx] || [];
    _words = listWords;
    _grid.innerHTML = '';

    listWords.forEach((word, i) => {
      const card = document.createElement('div');
      card.className = 'word-card';
      card.dataset.index = i;
      card.dataset.wordId = word.id;
      card.style.setProperty('--delay', (i * 8) + 'ms');

      // Apply status
      const status = Storage.getWordStatus(word.id);
      if (status === 'familiar') card.classList.add('status-familiar');
      else if (status === 'unfamiliar') card.classList.add('status-unfamiliar');

      // Filter
      if (_filter === 'familiar' && status !== 'familiar') card.classList.add('hidden-card');
      else if (_filter === 'unfamiliar' && status !== 'unfamiliar') card.classList.add('hidden-card');

      const textSpan = document.createElement('span');
      textSpan.className = 'word-text';
      textSpan.textContent = word.word;
      card.appendChild(textSpan);

      // Event: hover
      card.addEventListener('mouseenter', () => Tooltip.show(word, card));
      card.addEventListener('mouseleave', () => Tooltip.hide());

      // Event: left click = speak
      card.addEventListener('click', (e) => {
        e.preventDefault();
        speakWord(word, card);
      });

      // Event: right click = toggle status
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleStatus(word, card);
      });

      _grid.appendChild(card);
    });

    if (_focusIdx >= 0 && _focusIdx < _words.length) {
      highlightFocus();
    }
  }

  function speakWord(word, cardEl) {
    if (!cardEl) {
      cardEl = _grid.querySelector(`[data-index="${_focusIdx}"]`);
    }
    if (cardEl) {
      cardEl.classList.add('speaking');
      setTimeout(() => cardEl.classList.remove('speaking'), 600);
    }
    Audio.speak(word.word);
    Storage.recordStudyDay();
  }

  function toggleStatus(word, cardEl) {
    const current = Storage.getWordStatus(word.id);
    let next;
    if (current === null) next = 'familiar';
    else if (current === 'familiar') next = 'unfamiliar';
    else next = null;

    Storage.setWordStatus(word.id, next);

    if (!cardEl) {
      cardEl = _grid.querySelector(`[data-word-id="${word.id}"]`);
    }
    if (cardEl) {
      cardEl.classList.remove('status-familiar', 'status-unfamiliar');
      if (next === 'familiar') cardEl.classList.add('status-familiar');
      else if (next === 'unfamiliar') cardEl.classList.add('status-unfamiliar');
    }

    // Re-render if filter active
    if (_filter !== 'all') {
      setTimeout(() => render(), 300);
    }

    Storage.recordStudyDay();
    Stats.update();
    updateStatusBar();
  }

  function highlightFocus() {
    _grid.querySelectorAll('.word-card.focused').forEach(el => el.classList.remove('focused'));
    const card = _grid.querySelector(`[data-index="${_focusIdx}"]`);
    if (card) {
      card.classList.add('focused');
      card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      // Update status bar
      const word = _words[_focusIdx];
      document.getElementById('status-focus').textContent = word ? word.word : '-';
    }
  }

  function moveFocus(dx, dy) {
    const cols = getGridCols();
    const total = _words.length;
    if (total === 0) return;

    if (_focusIdx < 0) _focusIdx = 0;
    else {
      let newIdx = _focusIdx;
      if (dx !== 0) newIdx += dx;
      if (dy !== 0) newIdx += dy * cols;
      newIdx = Math.max(0, Math.min(total - 1, newIdx));
      _focusIdx = newIdx;
    }
    highlightFocus();
  }

  function getGridCols() {
    if (_density === 36) return 6;
    if (_density === 48) return 8;
    if (_density === 80) return 10;
    return 11;
  }

  function activateFocus() {
    if (_focusIdx < 0 || _focusIdx >= _words.length) return;
    speakWord(_words[_focusIdx]);
  }

  function toggleFocusStatus() {
    if (_focusIdx < 0 || _focusIdx >= _words.length) return;
    toggleStatus(_words[_focusIdx]);
  }

  function getFocusIdx() { return _focusIdx; }
  function getWords() { return _words; }
  function getAllWords() { return _allWords; }
  function getLists() { return _lists; }
  function getCurrentListIdx() { return _currentListIdx; }
  function getDensity() { return _density; }

  function updateStatusBar() {
    const allStatuses = Storage.getAllStatuses();
    const familiarCount = Object.values(allStatuses).filter(s => s === 'familiar').length;
    const total = _allWords.length;
    document.getElementById('status-progress').textContent = `掌握: ${familiarCount} / ${total}`;
  }

  return {
    init, loadWords, setList, nextList, prevList, setFilter, setDensity, render,
    moveFocus, activateFocus, toggleFocusStatus, getFocusIdx,
    getWords, getAllWords, getLists, getCurrentListIdx, getDensity, updateStatusBar
  };
})();
