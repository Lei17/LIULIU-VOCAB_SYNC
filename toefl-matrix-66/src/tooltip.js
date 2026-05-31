/**
 * tooltip.js - Hover释义组件
 * 80ms防抖，智能定位
 */
const Tooltip = (() => {
  let _el, _wordEl, _phoneticEl, _posEl, _defEl;
  let _showTimer = null;
  let _currentWord = null;
  const SHOW_DELAY = 80; // ms

  function init() {
    _el = document.getElementById('word-tooltip');
    _wordEl = document.getElementById('tooltip-word');
    _phoneticEl = document.getElementById('tooltip-phonetic');
    _posEl = document.getElementById('tooltip-pos');
    _defEl = document.getElementById('tooltip-def');
  }

  function show(word, cardEl) {
    if (_showTimer) clearTimeout(_showTimer);
    _currentWord = word;

    _showTimer = setTimeout(() => {
      if (!_el || _currentWord !== word) return;

      _wordEl.textContent = word.word;
      const ph = word.phonetic_us || word.phonetic_uk || '';
      if (ph) {
        _phoneticEl.textContent = ph;
        _phoneticEl.classList.remove('phonetic-empty');
      } else {
        _phoneticEl.innerHTML = '<span class="phonetic-hint">🔊 点击单词发音</span>';
        _phoneticEl.classList.add('phonetic-empty');
      }
      _posEl.textContent = word.pos || '';
      _defEl.textContent = word.definition || '暂无释义';

      _el.classList.remove('hidden');

      // Smart positioning
      requestAnimationFrame(() => {
        const cardRect = cardEl.getBoundingClientRect();
        const tipRect = _el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = cardRect.left + (cardRect.width - tipRect.width) / 2;
        let top = cardRect.bottom + 8;

        // Avoid going off right edge
        if (left + tipRect.width > vw - 10) {
          left = vw - tipRect.width - 10;
        }
        // Avoid going off left edge
        if (left < 10) left = 10;
        // If would go below viewport, show above
        if (top + tipRect.height > vh - 40) {
          top = cardRect.top - tipRect.height - 8;
        }
        if (top < 10) top = 10;

        _el.style.left = left + 'px';
        _el.style.top = top + 'px';
        _el.classList.add('visible');
      });
    }, SHOW_DELAY);
  }

  function hide() {
    if (_showTimer) {
      clearTimeout(_showTimer);
      _showTimer = null;
    }
    _currentWord = null;
    if (_el) {
      _el.classList.remove('visible');
      setTimeout(() => {
        if (!_el.classList.contains('visible')) {
          _el.classList.add('hidden');
        }
      }, 150);
    }
  }

  return { init, show, hide };
})();
