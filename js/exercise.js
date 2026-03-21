/* ==========================================================================
   Exercise Recommendation System (js/exercise.js)
   Simple exercises for elderly + "Remember & Follow" mini-game
   With animated SVG illustrations for each exercise
   ========================================================================== */

window.JumDeeExercise = (function () {
  let container = null;

  // ── Animated SVG illustrations for exercises ─────────────────

  const exerciseAnimations = {
    'arm-raise': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .arm-raise-body { fill: none; stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; }
          .arm-raise-head { fill: #dbeafe; stroke: #3b82f6; stroke-width: 4; }
          .arm-raise-left { animation: armRaiseL 2s ease-in-out infinite alternate; transform-origin: 85px 100px; }
          .arm-raise-right { animation: armRaiseR 2s ease-in-out infinite alternate; transform-origin: 115px 100px; }
          @keyframes armRaiseL { 0% { transform: rotate(0deg); } 100% { transform: rotate(-150deg); } }
          @keyframes armRaiseR { 0% { transform: rotate(0deg); } 100% { transform: rotate(150deg); } }
        </style>
        <circle class="arm-raise-head" cx="100" cy="55" r="25"/>
        <line class="arm-raise-body" x1="100" y1="80" x2="100" y2="170"/>
        <line class="arm-raise-body arm-raise-left" x1="85" y1="100" x2="55" y2="140"/>
        <line class="arm-raise-body arm-raise-right" x1="115" y1="100" x2="145" y2="140"/>
        <line class="arm-raise-body" x1="100" y1="170" x2="75" y2="240"/>
        <line class="arm-raise-body" x1="100" y1="170" x2="125" y2="240"/>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">ยกแขนขึ้น-ลง</text>
      </svg>
    `,
    'neck-rotate': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .neck-body { fill: none; stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; }
          .neck-head { fill: #dbeafe; stroke: #3b82f6; stroke-width: 4; animation: neckTilt 3s ease-in-out infinite; transform-origin: 100px 55px; }
          @keyframes neckTilt { 0%,100% { transform: rotate(-20deg); } 25% { transform: rotate(0deg) translateY(-3px); } 50% { transform: rotate(20deg); } 75% { transform: rotate(0deg) translateY(-3px); } }
        </style>
        <line class="neck-body" x1="100" y1="80" x2="100" y2="170"/>
        <circle class="neck-head" cx="100" cy="55" r="25"/>
        <circle cx="92" cy="50" r="3" fill="#3b82f6" style="animation: neckTilt 3s ease-in-out infinite; transform-origin: 100px 55px;"/>
        <circle cx="108" cy="50" r="3" fill="#3b82f6" style="animation: neckTilt 3s ease-in-out infinite; transform-origin: 100px 55px;"/>
        <line class="neck-body" x1="85" y1="100" x2="55" y2="140"/>
        <line class="neck-body" x1="115" y1="100" x2="145" y2="140"/>
        <line class="neck-body" x1="100" y1="170" x2="75" y2="240"/>
        <line class="neck-body" x1="100" y1="170" x2="125" y2="240"/>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">หมุนคอซ้าย-ขวา</text>
      </svg>
    `,
    'calf-stretch': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .cs-body { fill: none; stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; }
          .cs-head { fill: #dbeafe; stroke: #3b82f6; stroke-width: 4; }
          .cs-lean { animation: csLean 2.5s ease-in-out infinite alternate; transform-origin: 100px 170px; }
          @keyframes csLean { 0% { transform: rotate(0deg); } 100% { transform: rotate(12deg); } }
          .cs-wall { stroke: #94a3b8; stroke-width: 3; stroke-dasharray: 6 4; }
        </style>
        <line class="cs-wall" x1="40" y1="30" x2="40" y2="245"/>
        <g class="cs-lean">
          <circle class="cs-head" cx="100" cy="55" r="22"/>
          <line class="cs-body" x1="100" y1="77" x2="100" y2="160"/>
          <line class="cs-body" x1="85" y1="95" x2="50" y2="70"/>
          <line class="cs-body" x1="115" y1="95" x2="50" y2="75"/>
        </g>
        <line class="cs-body" x1="100" y1="170" x2="80" y2="240"/>
        <line class="cs-body" x1="100" y1="170" x2="135" y2="240"/>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">ยืดน่อง</text>
      </svg>
    `,
    'knee-raise': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .kr-body { fill: none; stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; }
          .kr-head { fill: #dbeafe; stroke: #3b82f6; stroke-width: 4; }
          .kr-leg-l { animation: krLegL 1.5s ease-in-out infinite alternate; transform-origin: 90px 170px; }
          .kr-leg-r { animation: krLegR 1.5s ease-in-out infinite alternate-reverse; transform-origin: 110px 170px; }
          @keyframes krLegL { 0% { transform: rotate(0deg); } 100% { transform: rotate(-70deg); } }
          @keyframes krLegR { 0% { transform: rotate(0deg); } 100% { transform: rotate(-70deg); } }
        </style>
        <circle class="kr-head" cx="100" cy="55" r="22"/>
        <line class="kr-body" x1="100" y1="77" x2="100" y2="170"/>
        <line class="kr-body" x1="80" y1="100" x2="60" y2="130"/>
        <line class="kr-body" x1="120" y1="100" x2="140" y2="130"/>
        <g class="kr-leg-l">
          <line class="kr-body" x1="90" y1="170" x2="75" y2="240"/>
        </g>
        <g class="kr-leg-r">
          <line class="kr-body" x1="110" y1="170" x2="125" y2="240"/>
        </g>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">ยกเข่าสลับ</text>
      </svg>
    `,
    'sit-stand': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .ss-body { fill: none; stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; }
          .ss-head { fill: #dbeafe; stroke: #3b82f6; stroke-width: 4; }
          .ss-figure { animation: ssFigure 2.5s ease-in-out infinite alternate; transform-origin: 100px 240px; }
          .ss-chair { stroke: #94a3b8; stroke-width: 3; fill: none; }
          @keyframes ssFigure { 0% { transform: scaleY(0.75) translateY(25px); } 100% { transform: scaleY(1) translateY(0px); } }
        </style>
        <rect class="ss-chair" x="55" y="160" width="90" height="5" rx="2"/>
        <line class="ss-chair" x1="60" y1="165" x2="60" y2="245"/>
        <line class="ss-chair" x1="140" y1="165" x2="140" y2="245"/>
        <line class="ss-chair" x1="140" y1="95" x2="140" y2="165"/>
        <g class="ss-figure">
          <circle class="ss-head" cx="100" cy="55" r="22"/>
          <line class="ss-body" x1="100" y1="77" x2="100" y2="155"/>
          <line class="ss-body" x1="80" y1="100" x2="60" y2="130"/>
          <line class="ss-body" x1="120" y1="100" x2="140" y2="130"/>
          <line class="ss-body" x1="90" y1="155" x2="75" y2="240"/>
          <line class="ss-body" x1="110" y1="155" x2="125" y2="240"/>
        </g>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">ลุก-นั่ง</text>
      </svg>
    `,
    'arm-swing': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .as-body { fill: none; stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; }
          .as-head { fill: #dbeafe; stroke: #3b82f6; stroke-width: 4; }
          .as-arm-l { animation: asSwingL 1.5s ease-in-out infinite alternate; transform-origin: 85px 100px; }
          .as-arm-r { animation: asSwingR 1.5s ease-in-out infinite alternate; transform-origin: 115px 100px; }
          @keyframes asSwingL { 0% { transform: rotate(-60deg); } 100% { transform: rotate(60deg); } }
          @keyframes asSwingR { 0% { transform: rotate(60deg); } 100% { transform: rotate(-60deg); } }
        </style>
        <circle class="as-head" cx="100" cy="55" r="22"/>
        <line class="as-body" x1="100" y1="77" x2="100" y2="170"/>
        <line class="as-body as-arm-l" x1="85" y1="100" x2="55" y2="140"/>
        <line class="as-body as-arm-r" x1="115" y1="100" x2="145" y2="140"/>
        <line class="as-body" x1="90" y1="170" x2="75" y2="240"/>
        <line class="as-body" x1="110" y1="170" x2="125" y2="240"/>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">แกว่งแขน</text>
      </svg>
    `,
    'clap-count': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .cc-body { fill: none; stroke: #8b5cf6; stroke-width: 4; stroke-linecap: round; }
          .cc-head { fill: #ede9fe; stroke: #8b5cf6; stroke-width: 4; }
          .cc-arm-l { animation: ccClap 0.8s ease-in-out infinite alternate; transform-origin: 85px 100px; }
          .cc-arm-r { animation: ccClapR 0.8s ease-in-out infinite alternate; transform-origin: 115px 100px; }
          .cc-spark { animation: ccSparkle 0.8s ease-in-out infinite alternate; }
          @keyframes ccClap { 0% { transform: rotate(-40deg); } 100% { transform: rotate(-90deg); } }
          @keyframes ccClapR { 0% { transform: rotate(40deg); } 100% { transform: rotate(90deg); } }
          @keyframes ccSparkle { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1.2); } }
        </style>
        <circle class="cc-head" cx="100" cy="55" r="22"/>
        <line class="cc-body" x1="100" y1="77" x2="100" y2="170"/>
        <line class="cc-body cc-arm-l" x1="85" y1="100" x2="55" y2="140"/>
        <line class="cc-body cc-arm-r" x1="115" y1="100" x2="145" y2="140"/>
        <line class="cc-body" x1="90" y1="170" x2="75" y2="240"/>
        <line class="cc-body" x1="110" y1="170" x2="125" y2="240"/>
        <text class="cc-spark" x="100" y="25" text-anchor="middle" font-size="20">👏</text>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">ตบมือนับเลข</text>
      </svg>
    `,
    'cross-touch': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .ct-body { fill: none; stroke: #8b5cf6; stroke-width: 4; stroke-linecap: round; }
          .ct-head { fill: #ede9fe; stroke: #8b5cf6; stroke-width: 4; }
          .ct-arm-r { animation: ctCrossR 2s ease-in-out infinite; transform-origin: 115px 100px; }
          .ct-arm-l { animation: ctCrossL 2s ease-in-out infinite; transform-origin: 85px 100px; }
          @keyframes ctCrossR { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(100deg); } }
          @keyframes ctCrossL { 0%,50% { transform: rotate(0deg); } 100% { transform: rotate(-100deg); } }
        </style>
        <circle class="ct-head" cx="100" cy="55" r="22"/>
        <line class="ct-body" x1="100" y1="77" x2="100" y2="170"/>
        <line class="ct-body ct-arm-l" x1="85" y1="100" x2="55" y2="140"/>
        <line class="ct-body ct-arm-r" x1="115" y1="100" x2="145" y2="140"/>
        <line class="ct-body" x1="90" y1="170" x2="70" y2="240"/>
        <line class="ct-body" x1="110" y1="170" x2="130" y2="240"/>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">สัมผัสข้ามลำตัว</text>
      </svg>
    `,
    'walk-count': `
      <svg class="exercise-anim" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <style>
          .wc-body { fill: none; stroke: #8b5cf6; stroke-width: 4; stroke-linecap: round; }
          .wc-head { fill: #ede9fe; stroke: #8b5cf6; stroke-width: 4; }
          .wc-leg-l { animation: wcWalkL 1s ease-in-out infinite alternate; transform-origin: 90px 170px; }
          .wc-leg-r { animation: wcWalkR 1s ease-in-out infinite alternate; transform-origin: 110px 170px; }
          .wc-arm-l { animation: wcArmL 1s ease-in-out infinite alternate; transform-origin: 85px 100px; }
          .wc-arm-r { animation: wcArmR 1s ease-in-out infinite alternate; transform-origin: 115px 100px; }
          .wc-nums { animation: wcNums 3s ease-in-out infinite; }
          @keyframes wcWalkL { 0% { transform: rotate(-25deg); } 100% { transform: rotate(25deg); } }
          @keyframes wcWalkR { 0% { transform: rotate(25deg); } 100% { transform: rotate(-25deg); } }
          @keyframes wcArmL { 0% { transform: rotate(15deg); } 100% { transform: rotate(-15deg); } }
          @keyframes wcArmR { 0% { transform: rotate(-15deg); } 100% { transform: rotate(15deg); } }
          @keyframes wcNums { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
        </style>
        <circle class="wc-head" cx="100" cy="55" r="22"/>
        <line class="wc-body" x1="100" y1="77" x2="100" y2="170"/>
        <line class="wc-body wc-arm-l" x1="85" y1="100" x2="60" y2="135"/>
        <line class="wc-body wc-arm-r" x1="115" y1="100" x2="140" y2="135"/>
        <line class="wc-body wc-leg-l" x1="90" y1="170" x2="75" y2="238"/>
        <line class="wc-body wc-leg-r" x1="110" y1="170" x2="125" y2="238"/>
        <text class="wc-nums" x="165" y="65" fill="#8b5cf6" font-size="18" font-family="Kanit" font-weight="bold">20</text>
        <text class="wc-nums" x="165" y="85" fill="#a78bfa" font-size="14" font-family="Kanit">19...</text>
        <text x="100" y="258" text-anchor="middle" fill="#64748b" font-size="11" font-family="Kanit">เดินนับถอยหลัง</text>
      </svg>
    `,
  };

  // Map exercise name -> animation key
  const exerciseAnimMap = {
    'ยกแขนเหนือศีรษะ': 'arm-raise',
    'หมุนคอช้าๆ': 'neck-rotate',
    'ยืดน่อง': 'calf-stretch',
    'เดินยกเข่าสูง': 'knee-raise',
    'ลุก-นั่งจากเก้าอี้': 'sit-stand',
    'แกว่งแขน': 'arm-swing',
    'นับเลขพร้อมตบมือ': 'clap-count',
    'สัมผัสข้ามลำตัว': 'cross-touch',
    'เดินนับถอยหลัง': 'walk-count',
  };

  // ── Exercise Data ────────────────────────────────────────────

  const categories = [
    {
      id: "stretch",
      title: "ยืดเหยียด",
      icon: "🧘",
      color: "#10b981",
      exercises: [
        {
          name: "ยกแขนเหนือศีรษะ",
          emoji: "🙆",
          duration: 15,
          steps: [
            "ยืนตัวตรง หายใจเข้าลึกๆ",
            "ยกแขนทั้งสองข้างขึ้นเหนือศีรษะ",
            "เหยียดแขนให้สุด ค้างไว้ 5 วินาที",
            "ค่อยๆ ลดแขนลง",
            "ทำซ้ำ 3 ครั้ง",
          ],
        },
        {
          name: "หมุนคอช้าๆ",
          emoji: "😌",
          duration: 20,
          steps: [
            "นั่งตัวตรง ผ่อนคลายไหล่",
            "ค่อยๆ เอียงศีรษะไปทางขวา",
            "หมุนศีรษะไปด้านหลังช้าๆ",
            "หมุนต่อไปทางซ้าย แล้ววนกลับ",
            "ทำซ้ำ 3 รอบ ทั้งซ้ายและขวา",
          ],
        },
        {
          name: "ยืดน่อง",
          emoji: "🦵",
          duration: 20,
          steps: [
            "ยืนหันหน้าเข้าผนัง มือยันผนัง",
            "ก้าวเท้าขวาไปด้านหลัง",
            "ย่อเข่าซ้าย ส้นเท้าขวาแตะพื้น",
            "ค้างไว้ 10 วินาที",
            "สลับข้าง ทำซ้ำ 3 ครั้ง",
          ],
        },
      ],
    },
    {
      id: "body",
      title: "บริหารร่างกาย",
      icon: "💪",
      color: "#3b82f6",
      exercises: [
        {
          name: "เดินยกเข่าสูง",
          emoji: "🚶",
          duration: 30,
          steps: [
            "ยืนตัวตรง มือเท้าเอว",
            "ยกเข่าขวาขึ้นสูงระดับเอว",
            "วางลง แล้วยกเข่าซ้าย",
            "ทำสลับซ้าย-ขวา ช้าๆ",
            "ทำต่อเนื่อง 30 วินาที",
          ],
        },
        {
          name: "ลุก-นั่งจากเก้าอี้",
          emoji: "🪑",
          duration: 25,
          steps: [
            "นั่งบนเก้าอี้ หลังตรง",
            "ไขว้แขนไว้ที่หน้าอก",
            "ค่อยๆ ลุกขึ้นยืนช้าๆ",
            "ค่อยๆ นั่งลงกลับ",
            "ทำซ้ำ 5 ครั้ง",
          ],
        },
        {
          name: "แกว่งแขน",
          emoji: "🤸",
          duration: 20,
          steps: [
            "ยืนตัวตรง ปล่อยแขนข้างลำตัว",
            "แกว่งแขนไปข้างหน้าพร้อมกัน",
            "แกว่งกลับไปด้านหลัง",
            "ทำต่อเนื่อง สม่ำเสมอ",
            "ทำ 10 ครั้ง",
          ],
        },
      ],
    },
    {
      id: "brain-body",
      title: "บริหารสมองและร่างกาย",
      icon: "🧠",
      color: "#8b5cf6",
      exercises: [
        {
          name: "นับเลขพร้อมตบมือ",
          emoji: "👏",
          duration: 30,
          steps: [
            "นับ 1-10 ออกเสียงดัง",
            "ตบมือทุกเลขคู่ (2, 4, 6, 8, 10)",
            "เริ่มใหม่ ตบมือทุกเลขคี่",
            "เพิ่มความเร็วขึ้นทีละรอบ",
            "ทำ 3 รอบ",
          ],
        },
        {
          name: "สัมผัสข้ามลำตัว",
          emoji: "🤚",
          duration: 25,
          steps: [
            "ยืนตัวตรง",
            "ใช้มือขวาสัมผัสเข่าซ้าย",
            "ใช้มือซ้ายสัมผัสเข่าขวา",
            "ทำสลับซ้าย-ขวา สม่ำเสมอ",
            "ทำ 10 ครั้งต่อข้าง",
          ],
        },
        {
          name: "เดินนับถอยหลัง",
          emoji: "🔢",
          duration: 30,
          steps: [
            "เดินอยู่กับที่ช้าๆ",
            "นับถอยหลังจาก 20 ถึง 1",
            "ทุกก้าว นับลดลง 1",
            "พยายามไม่ผิดและไม่หยุด",
            "ทำซ้ำ 2 รอบ",
          ],
        },
      ],
    },
  ];

  // Mini-game poses for "Remember & Follow" game
  const gamePoses = [
    { name: "ยกแขนขึ้น", emoji: "🙆" },
    { name: "ตบมือ", emoji: "👏" },
    { name: "ยกเข่า", emoji: "🦵" },
    { name: "หมุนคอ", emoji: "😌" },
    { name: "แกว่งแขน", emoji: "🤸" },
    { name: "สัมผัสไหล่", emoji: "🤚" },
  ];

  // ── Main Render ──────────────────────────────────────────────

  function render(targetContainer) {
    container = targetContainer;
    showExerciseHome();
  }

  function getAnimSvg(exerciseName) {
    const key = exerciseAnimMap[exerciseName];
    return key && exerciseAnimations[key] ? exerciseAnimations[key] : '';
  }

  function showExerciseHome() {
    container.innerHTML = `
      <div class="exercise-home">
        <div class="exercise-hero">
          <div class="exercise-hero-icon">🏃‍♂️</div>
          <h2>แนะนำการออกกำลังกาย</h2>
          <p>ท่าง่ายๆ ไม่ยากเกินไป เพื่อสุขภาพที่ดี</p>
        </div>

        <div class="exercise-categories">
          ${categories
            .map(
              (cat) => `
            <div class="exercise-cat-card" data-cat="${cat.id}">
              <div class="exercise-cat-icon" style="background: ${cat.color}15; color: ${cat.color};">
                <span>${cat.icon}</span>
              </div>
              <div class="exercise-cat-info">
                <h3>${cat.title}</h3>
                <p>${cat.exercises.length} ท่า</p>
              </div>
              <div class="exercise-cat-arrow">›</div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="exercise-game-card" id="exerciseGameBtn">
          <div class="exercise-game-icon">🎮</div>
          <div class="exercise-game-info">
            <h3>จำท่าแล้วทำตาม</h3>
            <p>มินิเกมฝึกสมอง มาเริ่มกันเล๊ยยย</p>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll(".exercise-cat-card").forEach((card) => {
      card.addEventListener("click", () => {
        const catId = card.dataset.cat;
        const cat = categories.find((c) => c.id === catId);
        if (cat) showCategoryDetail(cat);
      });
    });

    document
      .getElementById("exerciseGameBtn")
      ?.addEventListener("click", () => {
        startMiniGame();
      });
  }

  // ── Category Detail ──────────────────────────────────────────

  function showCategoryDetail(cat) {
    container.innerHTML = `
      <div class="exercise-detail">
        <button class="exercise-back-btn" id="exBackBtn">
          ‹ กลับ
        </button>
        <div class="exercise-detail-header" style="background: ${cat.color}10;">
          <span class="exercise-detail-icon">${cat.icon}</span>
          <h2>${cat.title}</h2>
        </div>
        <div class="exercise-list">
          ${cat.exercises
            .map(
              (ex, idx) => `
            <div class="exercise-item" data-idx="${idx}">
              <div class="exercise-item-preview">
                ${getAnimSvg(ex.name) ? `<div class="exercise-item-anim-small">${getAnimSvg(ex.name)}</div>` : `<div class="exercise-item-emoji">${ex.emoji}</div>`}
              </div>
              <div class="exercise-item-info">
                <h4>${ex.name}</h4>
                <span class="exercise-duration">⏱ ${ex.duration} วินาที</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    document.getElementById("exBackBtn")?.addEventListener("click", () => {
      showExerciseHome();
    });

    container.querySelectorAll(".exercise-item").forEach((item) => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.dataset.idx);
        showExerciseGuide(cat, cat.exercises[idx]);
      });
    });
  }

  // ── Exercise Guide (step-by-step with animation + timer) ─────

  function showExerciseGuide(cat, exercise) {
    let timeLeft = exercise.duration;
    let timerInterval = null;
    const animSvg = getAnimSvg(exercise.name);

    container.innerHTML = `
      <div class="exercise-guide">
        <button class="exercise-back-btn" id="exGuideBackBtn">‹ กลับ</button>
        
        <!-- Animated illustration -->
        <div class="exercise-animation-showcase">
          ${animSvg ? animSvg : `<div class="exercise-guide-emoji">${exercise.emoji}</div>`}
        </div>

        <div class="exercise-guide-header">
          <h2>${exercise.name}</h2>
          <div class="exercise-timer-circle" id="exTimerCircle">
            <span id="exTimerText">${timeLeft}</span>
            <small>วินาที</small>
          </div>
        </div>

        <div class="exercise-steps">
          ${exercise.steps
            .map(
              (step, i) => `
            <div class="exercise-step" id="exStep${i}">
              <div class="step-number">${i + 1}</div>
              <p>${step}</p>
            </div>
          `
            )
            .join("")}
        </div>
        <button class="btn btn-primary w-full exercise-start-btn" id="exStartTimerBtn">
          ▶ เริ่มจับเวลา
        </button>
      </div>
    `;

    document.getElementById("exGuideBackBtn")?.addEventListener("click", () => {
      if (timerInterval) clearInterval(timerInterval);
      showCategoryDetail(cat);
    });

    document
      .getElementById("exStartTimerBtn")
      ?.addEventListener("click", () => {
        const btn = document.getElementById("exStartTimerBtn");
        const timerText = document.getElementById("exTimerText");
        const timerCircle = document.getElementById("exTimerCircle");

        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
          btn.textContent = "▶ เริ่มจับเวลา";
          btn.classList.remove("btn-outline");
          btn.classList.add("btn-primary");
          return;
        }

        btn.textContent = "⏸ หยุดชั่วคราว";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline");
        timerCircle.classList.add("active");

        // Highlight steps progressively
        const totalSteps = exercise.steps.length;
        const stepDuration = exercise.duration / totalSteps;

        timerInterval = setInterval(() => {
          timeLeft--;
          timerText.textContent = timeLeft;

          // Highlight current step
          const elapsed = exercise.duration - timeLeft;
          const currentStep = Math.min(totalSteps - 1, Math.floor(elapsed / stepDuration));
          for (let s = 0; s < totalSteps; s++) {
            const stepEl = document.getElementById(`exStep${s}`);
            if (stepEl) {
              if (s < currentStep) stepEl.classList.add('step-done');
              else if (s === currentStep) stepEl.classList.add('step-active');
              else stepEl.classList.remove('step-active', 'step-done');
            }
          }

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerCircle.classList.remove("active");
            timerCircle.classList.add("done");
            timerText.textContent = "✓";
            btn.textContent = "✅ เสร็จแล้ว!";
            btn.disabled = true;

            // Mark all steps done
            for (let s = 0; s < totalSteps; s++) {
              const stepEl = document.getElementById(`exStep${s}`);
              if (stepEl) stepEl.classList.add('step-done');
            }

            if (window.confetti) {
              confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.6 },
              });
            }
          }
        }, 1000);
      });
  }

  // ── Mini-Game: "จำท่าแล้วทำตาม" ─────────────────────────────

  function startMiniGame() {
    let level = 1;
    let score = 0;
    let sequence = [];

    function generateSequence(len) {
      const seq = [];
      for (let i = 0; i < len; i++) {
        seq.push(gamePoses[Math.floor(Math.random() * gamePoses.length)]);
      }
      return seq;
    }

    function showSequencePhase() {
      sequence = generateSequence(level + 1);

      container.innerHTML = `
        <div class="mini-game">
          <div class="mini-game-header">
            <h2>🎮 จำท่าแล้วทำตาม</h2>
            <div class="mini-game-stats">
              <span class="stat-pill">ด่าน ${level}</span>
              <span class="stat-pill">คะแนน: ${score}</span>
            </div>
          </div>
          <p class="mini-game-instruction">จำลำดับท่าเหล่านี้ให้ดี!</p>
          <div class="mini-game-sequence" id="sequenceDisplay">
            ${sequence
              .map(
                (pose, i) => `
              <div class="sequence-pose hidden" data-idx="${i}">
                <div class="pose-emoji">${pose.emoji}</div>
                <div class="pose-name">${pose.name}</div>
              </div>
            `
              )
              .join("")}
          </div>
          <div class="mini-game-progress" id="seqProgress"></div>
        </div>
      `;

      // Reveal one by one
      let showIdx = 0;
      const poses = container.querySelectorAll(".sequence-pose");
      const progress = document.getElementById("seqProgress");

      function showNext() {
        if (showIdx >= poses.length) {
          setTimeout(() => showAnswerPhase(), 1200);
          return;
        }
        poses[showIdx].classList.remove("hidden");
        poses[showIdx].classList.add("reveal");
        progress.textContent = `${showIdx + 1} / ${sequence.length}`;
        showIdx++;
        setTimeout(showNext, 1500);
      }
      setTimeout(showNext, 500);
    }

    function showAnswerPhase() {
      let answerIdx = 0;
      let mistakes = 0;

      const shuffled = [...gamePoses].sort(() => Math.random() - 0.5);

      container.innerHTML = `
        <div class="mini-game">
          <div class="mini-game-header">
            <h2>🎮 เลือกท่าตามลำดับ!</h2>
            <div class="mini-game-stats">
              <span class="stat-pill">ด่าน ${level}</span>
              <span class="stat-pill">คะแนน: ${score}</span>
            </div>
          </div>
          <p class="mini-game-instruction">เลือกท่าที่ <strong>${answerIdx + 1}</strong> จาก ${sequence.length}</p>
          <div class="mini-game-answers" id="answeredSlots">
            ${sequence
              .map(
                (_, i) => `
              <div class="answer-slot ${i === 0 ? "current" : ""}" data-idx="${i}">?</div>
            `
              )
              .join("")}
          </div>
          <div class="mini-game-choices" id="poseChoices">
            ${shuffled
              .map(
                (pose) => `
              <button class="pose-choice-btn" data-name="${pose.name}">
                <span class="pose-choice-emoji">${pose.emoji}</span>
                <span class="pose-choice-label">${pose.name}</span>
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      `;

      const slots = container.querySelectorAll(".answer-slot");
      const instruction = container.querySelector(".mini-game-instruction");

      container.querySelectorAll(".pose-choice-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const chosen = btn.dataset.name;
          const expected = sequence[answerIdx].name;

          if (chosen === expected) {
            slots[answerIdx].textContent = sequence[answerIdx].emoji;
            slots[answerIdx].classList.add("correct");
            slots[answerIdx].classList.remove("current");
            score += 10;
            answerIdx++;

            if (answerIdx >= sequence.length) {
              score += level * 5;
              level++;
              setTimeout(() => {
                if (level > 5) {
                  showGameEnd(score);
                } else {
                  showSequencePhase();
                }
              }, 800);
            } else {
              slots[answerIdx].classList.add("current");
              instruction.innerHTML = `เลือกท่าที่ <strong>${answerIdx + 1}</strong> จาก ${sequence.length}`;
            }
          } else {
            mistakes++;
            btn.classList.add("wrong");
            setTimeout(() => btn.classList.remove("wrong"), 500);

            if (mistakes >= 3) {
              showGameEnd(score);
            }
          }
        });
      });
    }

    function showGameEnd(finalScore) {
      if (window.JumDeeData) {
        window.JumDeeData.saveGameResult(
          "exercise-game",
          "training",
          finalScore,
          0
        );
      }

      container.innerHTML = `
        <div class="mini-game mini-game-result">
          <div class="mini-game-result-icon">🎉</div>
          <h2>ยอดเยี่ยม!</h2>
          <p>คุณผ่านได้ ${level - 1} ด่าน</p>
          <div class="final-score">${finalScore}</div>
          <p style="color: var(--text-muted);">คะแนน</p>
          <div class="mini-game-result-actions">
            <button class="btn btn-outline" id="exGameRetry">เล่นอีกครั้ง</button>
            <button class="btn btn-primary" id="exGameBack">กลับหน้าหลัก</button>
          </div>
        </div>
      `;

      if (window.confetti) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      document.getElementById("exGameRetry")?.addEventListener("click", () => {
        startMiniGame();
      });
      document.getElementById("exGameBack")?.addEventListener("click", () => {
        showExerciseHome();
      });
    }

    showSequencePhase();
  }

  return { render };
})();
