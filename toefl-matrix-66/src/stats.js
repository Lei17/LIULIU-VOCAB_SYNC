/**
 * stats.js - 统计仪表盘
 */
const Stats = (() => {
  function update() {
    const allWords = Matrix.getAllWords();
    const currentList = Matrix.getWords();
    const statuses = Storage.getAllStatuses();

    // Current list stats
    let listFamiliar = 0, listUnfamiliar = 0;
    currentList.forEach(w => {
      const s = statuses[w.id];
      if (s === 'familiar') listFamiliar++;
      else if (s === 'unfamiliar') listUnfamiliar++;
    });
    const listTotal = listFamiliar + listUnfamiliar;
    const listRate = listTotal > 0 ? Math.round((listFamiliar / listTotal) * 100) : 0;

    document.getElementById('stat-list-rate').textContent = listRate + '%';
    document.getElementById('stat-list-bar').style.width = listRate + '%';

    // Total stats
    let totalFamiliar = 0, totalUnfamiliar = 0;
    allWords.forEach(w => {
      const s = statuses[w.id];
      if (s === 'familiar') totalFamiliar++;
      else if (s === 'unfamiliar') totalUnfamiliar++;
    });
    const totalMarked = totalFamiliar + totalUnfamiliar;
    const totalRate = totalMarked > 0 ? Math.round((totalFamiliar / totalMarked) * 100) : 0;

    document.getElementById('stat-total-rate').textContent = totalRate + '%';
    document.getElementById('stat-total-bar').style.width = totalRate + '%';
    document.getElementById('stat-today-count').textContent = Storage.getTodayCount();
    document.getElementById('stat-streak').textContent = Storage.getStreak();
    document.getElementById('stat-familiar-total').textContent = totalFamiliar;
    document.getElementById('stat-unfamiliar-total').textContent = totalUnfamiliar;
  }

  return { update };
})();
