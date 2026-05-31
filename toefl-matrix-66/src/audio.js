/**
 * audio.js - TTS发音模块
 * 使用 Web Speech API SpeechSynthesis
 */
const Audio = (() => {
  let _voices = [];
  let _ready = false;

  function init() {
    if (!window.speechSynthesis) return;
    
    function loadVoices() {
      _voices = speechSynthesis.getVoices();
      _ready = true;
    }
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function getVoice(type) {
    if (!_ready) return null;
    const lang = type === 'uk' ? 'en-GB' : 'en-US';
    // Prefer high-quality voices
    const preferred = _voices.find(v => v.lang === lang && v.name.includes('Google'));
    if (preferred) return preferred;
    return _voices.find(v => v.lang === lang) || _voices.find(v => v.lang.startsWith('en')) || null;
  }

  function speak(word, options = {}) {
    if (!window.speechSynthesis) return;
    
    const settings = Storage.get().settings || {};
    const rate = options.rate || settings.speechRate || 1.0;
    const type = options.type || settings.voiceType || 'us';

    // Cancel any ongoing speech for rapid clicks
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voice = getVoice(type);
    if (voice) utterance.voice = voice;
    utterance.lang = type === 'uk' ? 'en-GB' : 'en-US';

    speechSynthesis.speak(utterance);
    return utterance;
  }

  function stop() {
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
    }
  }

  return { init, speak, stop };
})();
