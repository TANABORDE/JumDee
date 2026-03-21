/* ==========================================================================
   Analytics / Personalized Training (js/analytics.js)
   Analyze user strengths/weaknesses and recommend games
   ========================================================================== */

window.JumDeeAnalytics = (function () {
  const categoryMeta = {
    memory: {
      title: "ความจำ",
      icon: "🧠",
      color: "#3b82f6",
      games: ["memory-matching", "grid-memory", "sequence-simon"],
    },
    puzzle: {
      title: "ปริศนา ตรรกะ",
      icon: "🧩",
      color: "#8b5cf6",
      games: ["sudoku", "word-matching", "jigsaw"],
    },
    training: {
      title: "ฝึกสมองฉับไว",
      icon: "⚡",
      color: "#f59e0b",
      games: ["math-speed", "reaction-game"],
    },
  };

  function analyze() {
    const data = window.JumDeeData;
    if (!data) return null;

    const result = {};
    let maxAvg = -1,
      minAvg = Infinity;
    let strongCat = null,
      weakCat = null;

    Object.entries(categoryMeta).forEach(([catId, meta]) => {
      const avg = data.getAverageScore(catId, 30);
      const entries = data.getScoresByCategory(catId, 30);
      const recentAvg = data.getAverageScore(catId, 7);
      const olderAvg = data.getAverageScore(catId, 30);

      let trend = "stable";
      if (entries.length >= 3) {
        if (recentAvg > olderAvg * 1.1) trend = "improving";
        else if (recentAvg < olderAvg * 0.9) trend = "declining";
      }

      let level = "ควรฝึกเพิ่ม";
      let levelClass = "level-weak";
      if (avg >= 80) {
        level = "เก่งมาก";
        levelClass = "level-strong";
      } else if (avg >= 50) {
        level = "ปานกลาง";
        levelClass = "level-medium";
      }

      result[catId] = {
        ...meta,
        avg,
        entries: entries.length,
        level,
        levelClass,
        trend,
        recentAvg,
      };

      if (entries.length > 0) {
        if (avg > maxAvg) {
          maxAvg = avg;
          strongCat = catId;
        }
        if (avg < minAvg) {
          minAvg = avg;
          weakCat = catId;
        }
      }
    });

    return {
      categories: result,
      strongCat,
      weakCat,
      hasData: Object.values(result).some((r) => r.entries > 0),
    };
  }

  function getRecommendations() {
    const analysis = analyze();
    if (!analysis || !analysis.hasData) {
      return {
        message: "ลองเล่นเกมสักหน่อยเพื่อให้ระบบวิเคราะห์ได้ดีขึ้นนะครับ",
        games: [],
      };
    }

    const recs = [];

    // Recommend from weakest category first
    if (analysis.weakCat && analysis.categories[analysis.weakCat]) {
      const weak = analysis.categories[analysis.weakCat];
      recs.push({
        reason: `ฝึก${weak.title}เพิ่มเพื่อพัฒนาให้ดีขึ้น`,
        category: analysis.weakCat,
        icon: weak.icon,
      });
    }

    // Then moderate categories
    Object.entries(analysis.categories).forEach(([catId, info]) => {
      if (catId !== analysis.strongCat && catId !== analysis.weakCat) {
        recs.push({
          reason: `เล่น${info.title}เพื่อรักษาระดับ`,
          category: catId,
          icon: info.icon,
        });
      }
    });

    return {
      message:
        analysis.strongCat && analysis.categories[analysis.strongCat]
          ? `คุณเก่ง${analysis.categories[analysis.strongCat].title}มากเลยครับ! 🌟`
          : "มาฝึกสมองกันต่อนะครับ!",
      games: recs,
    };
  }

  function renderSkillCards(targetEl) {
    const analysis = analyze();
    if (!targetEl) return;

    if (!analysis || !analysis.hasData) {
      targetEl.innerHTML = `
        <div class="analytics-empty">
          <div class="analytics-empty-icon">📊</div>
          <p>เล่นเกมอย่างน้อย 1 เกมเพื่อดูการวิเคราะห์</p>
        </div>
      `;
      return;
    }

    let html = `<div class="skill-cards">`;

    Object.entries(analysis.categories).forEach(([catId, info]) => {
      const trendIcon =
        info.trend === "improving"
          ? "📈"
          : info.trend === "declining"
            ? "📉"
            : "➡️";
      const trendText =
        info.trend === "improving"
          ? "กำลังดีขึ้น"
          : info.trend === "declining"
            ? "ควรฝึกเพิ่ม"
            : "คงที่";

      const progressPct = Math.min(100, info.avg);

      html += `
        <div class="skill-card">
          <div class="skill-card-header">
            <span class="skill-icon" style="background: ${info.color}15; color: ${info.color};">${info.icon}</span>
            <div class="skill-info">
              <h4>${info.title}</h4>
              <span class="skill-level ${info.levelClass}">${info.level}</span>
            </div>
            <div class="skill-avg">${info.avg}</div>
          </div>
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" style="width: ${progressPct}%; background: ${info.color};"></div>
          </div>
          <div class="skill-footer">
            <span>${trendIcon} ${trendText}</span>
            <span>เล่น ${info.entries} ครั้ง</span>
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // Recommendations
    const recs = getRecommendations();
    html += `
      <div class="analytics-recommendation">
        <h3>💡 แนะนำสำหรับคุณ</h3>
        <p class="rec-message">${recs.message}</p>
        ${recs.games
          .map(
            (r) => `
          <div class="rec-item">
            <span class="rec-icon">${r.icon}</span>
            <span>${r.reason}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    targetEl.innerHTML = html;
  }

  return { analyze, getRecommendations, renderSkillCards };
})();
