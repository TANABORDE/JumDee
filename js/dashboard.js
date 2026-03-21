/* ==========================================================================
   Dashboard — Progress Tracking (js/dashboard.js)
   7-day score chart (Canvas), category progress, today-vs-yesterday
   ========================================================================== */

window.JumDeeDashboard = (function () {
  let container = null;

  function render(targetContainer) {
    container = targetContainer;

    const comparison = window.JumDeeData.getTodayVsYesterday();
    const checkin = window.JumDeeData.getCheckinData();

    const changeIcon =
      comparison.change > 0
        ? "↑"
        : comparison.change < 0
          ? "↓"
          : "→";
    const changeColor =
      comparison.change > 0
        ? "var(--success)"
        : comparison.change < 0
          ? "var(--error)"
          : "var(--text-muted)";
    const changeText =
      comparison.change !== 0
        ? `${Math.abs(comparison.change)}%`
        : "เท่าเดิม";

    container.innerHTML = `
      <div class="dashboard">
        <!-- Today vs Yesterday -->
        <div class="dash-comparison">
          <div class="dash-card dash-today">
            <div class="dash-card-label">วันนี้</div>
            <div class="dash-card-score">${comparison.todayAvg}</div>
            <div class="dash-card-sub">เฉลี่ย ${comparison.todayCount} เกม</div>
          </div>
          <div class="dash-vs">
            <div class="dash-change-arrow" style="color: ${changeColor};">
              ${changeIcon}
            </div>
            <div class="dash-change-text" style="color: ${changeColor};">
              ${changeText}
            </div>
          </div>
          <div class="dash-card dash-yesterday">
            <div class="dash-card-label">เมื่อวาน</div>
            <div class="dash-card-score">${comparison.yesterdayAvg}</div>
            <div class="dash-card-sub">เฉลี่ย ${comparison.yesterdayCount} เกม</div>
          </div>
        </div>

        <!-- 7-day chart -->
        <div class="dash-section">
          <h3>คะแนนรวม 7 วัน</h3>
          <div class="dash-chart-container">
            <canvas id="dashChart" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Skill Analysis -->
        <div class="dash-section">
          <h3>วิเคราะห์ทักษะ</h3>
          <div id="dashSkillCards"></div>
        </div>

        <!-- Stats summary -->
        <div class="dash-section">
          <h3>สถิติรวม</h3>
          <div class="dash-stats-grid">
            <div class="dash-stat-item">
              <div class="dash-stat-value">${window.JumDeeData.getGameHistory().length}</div>
              <div class="dash-stat-label">เกมที่เล่น</div>
            </div>
            <div class="dash-stat-item">
              <div class="dash-stat-value">${checkin.currentStreak}</div>
              <div class="dash-stat-label">วันต่อเนื่อง</div>
            </div>
            <div class="dash-stat-item">
              <div class="dash-stat-value">${checkin.longestStreak}</div>
              <div class="dash-stat-label">สถิติสูงสุด</div>
            </div>
            <div class="dash-stat-item">
              <div class="dash-stat-value">${_calcOverallAvg()}</div>
              <div class="dash-stat-label">คะแนนเฉลี่ย</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Draw chart
    setTimeout(() => _drawChart(), 100);

    // Render skill analysis from analytics module
    const skillEl = document.getElementById("dashSkillCards");
    if (window.JumDeeAnalytics && skillEl) {
      window.JumDeeAnalytics.renderSkillCards(skillEl);
    }
  }

  function _calcOverallAvg() {
    const history = window.JumDeeData.getGameHistory();
    if (history.length === 0) return 0;
    return Math.round(
      history.reduce((s, e) => s + e.score, 0) / history.length
    );
  }

  // ── Canvas Line Chart ────────────────────────────────────────

  function _drawChart() {
    const canvas = document.getElementById("dashChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // High-DPI canvas
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = "200px";
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = 200;
    const padding = { top: 20, right: 20, bottom: 35, left: 40 };

    const grouped = window.JumDeeData.getScoresGroupedByDay(7);
    const days = Object.keys(grouped).sort();
    const values = days.map((d) => {
      const scores = grouped[d];
      return scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    });

    const maxVal = Math.max(100, ...values);

    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Kanit";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 5, y + 4);
    }

    // Plot data
    if (values.length > 0) {
      const points = values.map((v, i) => ({
        x: padding.left + (chartW / (values.length - 1 || 1)) * i,
        y: padding.top + chartH - (v / maxVal) * chartH,
      }));

      // Area fill
      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, padding.top, 0, H);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.02)");
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Dots
      points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Value on dot
        if (values[i] > 0) {
          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 11px Kanit";
          ctx.textAlign = "center";
          ctx.fillText(values[i], p.x, p.y - 12);
        }
      });

      // X-axis labels (date)
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Kanit";
      ctx.textAlign = "center";
      const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
      points.forEach((p, i) => {
        const d = new Date(days[i]);
        ctx.fillText(dayNames[d.getDay()], p.x, H - 5);
      });
    }
  }

  return { render };
})();
