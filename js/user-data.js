/* ==========================================================================
   User Data Manager (js/user-data.js)
   Centralized localStorage management for all user data
   ========================================================================== */

window.JumDeeData = (function () {
  const KEYS = {
    GAME_HISTORY: "jumDeeGameHistory",
    CHECKIN: "jumDeeCheckin",
    SCORE: "jumDeeScore",
  };

  // ── Game History ──────────────────────────────────────────────

  function getGameHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.GAME_HISTORY)) || [];
    } catch {
      return [];
    }
  }

  function saveGameResult(gameId, category, score, timeSpent) {
    const history = getGameHistory();
    history.push({
      gameId,
      category,
      score,
      timeSpent: timeSpent || 0,
      date: new Date().toISOString(),
    });
    // Keep last 200 entries
    if (history.length > 200) history.splice(0, history.length - 200);
    localStorage.setItem(KEYS.GAME_HISTORY, JSON.stringify(history));
  }

  // ── Check-in / Streak ────────────────────────────────────────

  function getCheckinData() {
    try {
      return (
        JSON.parse(localStorage.getItem(KEYS.CHECKIN)) || {
          dates: [],
          currentStreak: 0,
          longestStreak: 0,
        }
      );
    } catch {
      return { dates: [], currentStreak: 0, longestStreak: 0 };
    }
  }

  function saveCheckinData(data) {
    localStorage.setItem(KEYS.CHECKIN, JSON.stringify(data));
  }

  function checkinToday() {
    const data = getCheckinData();
    const today = _dateStr(new Date());

    if (data.dates.includes(today)) return { alreadyDone: true, ...data };

    data.dates.push(today);
    // Keep only last 90 days
    if (data.dates.length > 90) data.dates.splice(0, data.dates.length - 90);

    // Calculate streak
    const yesterday = _dateStr(_addDays(new Date(), -1));
    if (data.dates.includes(yesterday)) {
      data.currentStreak += 1;
    } else {
      data.currentStreak = 1;
    }
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    saveCheckinData(data);
    return { alreadyDone: false, ...data };
  }

  function hasCheckedInToday() {
    const data = getCheckinData();
    return data.dates.includes(_dateStr(new Date()));
  }

  // ── Analytics helpers ────────────────────────────────────────

  function getScoresByCategory(category, days) {
    const history = getGameHistory();
    const cutoff = days
      ? _addDays(new Date(), -days).toISOString()
      : "1970-01-01";
    return history.filter((h) => h.category === category && h.date >= cutoff);
  }

  function getAverageScore(category, days) {
    const entries = getScoresByCategory(category, days);
    if (entries.length === 0) return 0;
    return Math.round(
      entries.reduce((s, e) => s + e.score, 0) / entries.length
    );
  }

  function getScoresGroupedByDay(days) {
    const history = getGameHistory();
    const cutoff = _addDays(new Date(), -(days || 7));
    const grouped = {};
    for (let i = 0; i < (days || 7); i++) {
      const d = _dateStr(_addDays(new Date(), -i));
      grouped[d] = [];
    }
    history.forEach((h) => {
      const d = h.date.substring(0, 10);
      if (new Date(d) >= cutoff && grouped[d] !== undefined) {
        grouped[d].push(h.score);
      }
    });
    return grouped;
  }

  function getTodayVsYesterday() {
    const today = _dateStr(new Date());
    const yesterday = _dateStr(_addDays(new Date(), -1));
    const history = getGameHistory();

    const todayScores = history.filter((h) => h.date.startsWith(today));
    const yesterdayScores = history.filter((h) =>
      h.date.startsWith(yesterday)
    );

    const todayAvg =
      todayScores.length > 0
        ? Math.round(
            todayScores.reduce((s, e) => s + e.score, 0) / todayScores.length
          )
        : 0;
    const yesterdayAvg =
      yesterdayScores.length > 0
        ? Math.round(
            yesterdayScores.reduce((s, e) => s + e.score, 0) /
              yesterdayScores.length
          )
        : 0;

    let change = 0;
    if (yesterdayAvg > 0) {
      change = Math.round(((todayAvg - yesterdayAvg) / yesterdayAvg) * 100);
    }

    return {
      todayAvg,
      yesterdayAvg,
      change,
      todayCount: todayScores.length,
      yesterdayCount: yesterdayScores.length,
    };
  }

  // ── Private helpers ──────────────────────────────────────────

  function _dateStr(d) {
    return d.toISOString().substring(0, 10);
  }

  function _addDays(d, n) {
    const result = new Date(d);
    result.setDate(result.getDate() + n);
    return result;
  }

  // ── Public API ───────────────────────────────────────────────

  return {
    getGameHistory,
    saveGameResult,
    getCheckinData,
    checkinToday,
    hasCheckedInToday,
    getScoresByCategory,
    getAverageScore,
    getScoresGroupedByDay,
    getTodayVsYesterday,
  };
})();
