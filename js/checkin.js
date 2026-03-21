/* ==========================================================================
   Daily Check-in System (js/checkin.js)
   Fire streak widget + daily check-in with confetti
   ========================================================================== */

window.JumDeeCheckin = (function () {
  function render(targetEl) {
    if (!targetEl) return;

    const data = window.JumDeeData.getCheckinData();
    const checkedToday = window.JumDeeData.hasCheckedInToday();

    // Build 7-day fire icons
    const today = new Date();
    let fireIcons = "";
    const dayLabels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      const isChecked = data.dates && data.dates.includes(dateStr);
      const dayLabel = dayLabels[d.getDay()];
      const isToday = i === 0;

      fireIcons += `
        <div class="checkin-day ${isChecked ? "checked" : ""} ${isToday ? "today" : ""}">
          <div class="fire-icon">${isChecked ? "🔥" : "⚪"}</div>
          <span class="day-label">${dayLabel}</span>
        </div>
      `;
    }

    // Motivational messages
    const messages = [
      "มาฝึกสมองทุกวันกันนะครับ! 💪",
      "สุดยอดเลย! เข้ามาต่อเนื่องดีมากครับ 🌟",
      "ไฟแรงมาก! ฝึกสมองทุกวันสมองแข็งแรง 🧠",
      "เยี่ยมมาก! อย่าลืมมาเช็คอินนะครับ 🎯",
      "สุขภาพดีเริ่มที่สมอง มาออกกำลังสมองกัน! 🏆",
    ];
    const msgIdx = data.currentStreak % messages.length;

    targetEl.innerHTML = `
      <div class="checkin-widget">
        <div class="checkin-header">
          <div class="checkin-title">
            <span class="fire-emoji">🔥</span>
            <h3>มาเติมไฟกันนะ</h3>
          </div>
          <div class="streak-badge ${data.currentStreak > 0 ? "active" : ""}">
            ${data.currentStreak} วันต่อเนื่อง
          </div>
        </div>
        
        <div class="checkin-fires">
          ${fireIcons}
        </div>

        <p class="checkin-motivation">${messages[msgIdx]}</p>

        <button class="btn btn-primary w-full checkin-btn ${checkedToday ? "done" : ""}" 
                id="checkinBtn" ${checkedToday ? "disabled" : ""}>
          ${checkedToday ? "✅ เช็คอินแล้ววันนี้!" : "เช็คอินวันนี้"}
        </button>

        ${data.longestStreak > 1 ? `<p class="checkin-record">🏆 สถิติสูงสุด: ${data.longestStreak} วันต่อเนื่อง</p>` : ""}
      </div>
    `;

    // Button handler
    const btn = document.getElementById("checkinBtn");
    if (btn && !checkedToday) {
      btn.addEventListener("click", () => {
        const result = window.JumDeeData.checkinToday();
        if (!result.alreadyDone) {
          // Animate
          btn.classList.add("done");
          btn.disabled = true;
          btn.innerHTML = "✅ เช็คอินแล้ววันนี้!";

          // Fire confetti
          if (window.confetti) {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#ff6b35", "#f7c948", "#ef4444", "#3b82f6"],
            });
          }

          // Re-render after short delay to update fires
          setTimeout(() => render(targetEl), 600);
        }
      });
    }
  }

  return { render };
})();
