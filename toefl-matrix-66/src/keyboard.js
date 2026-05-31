/**
 * keyboard.js - 键盘导航模块
 */
const Keyboard = (() => {
  function init() {
    document.addEventListener('keydown', handleKey);
  }

  function handleKey(e) {
    // Don't capture when typing in inputs/selects
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        Matrix.moveFocus(1, 0);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        Matrix.moveFocus(-1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        Matrix.moveFocus(0, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        Matrix.moveFocus(0, -1);
        break;
      case 'Enter':
        e.preventDefault();
        Matrix.activateFocus();
        break;
      case ' ':
        e.preventDefault();
        Matrix.toggleFocusStatus();
        break;
      case 'PageDown':
        e.preventDefault();
        Matrix.nextList();
        break;
      case 'PageUp':
        e.preventDefault();
        Matrix.prevList();
        break;
    }
  }

  return { init };
})();
