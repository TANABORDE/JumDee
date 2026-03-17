/* ==========================================================================
   Main Application Logic (app.js)
   Handles Routing, Global State, and UI Interactions
   ========================================================================== */

// Global State
const AppState = {
  totalScore: 0,
  currentGame: null,
  games: {
    "memory-matching": { title: "จับคู่ภาพ", module: null, category: "memory" },
    "grid-memory": { title: "จำตำแหน่ง", module: null, category: "memory" },
    "sequence-simon": { title: "จำลำดับ", module: null, category: "memory" },
    sudoku: { title: "ซูโดกุ", module: null, category: "puzzle" },
    "word-matching": {
      title: "จับคู่คำศัพท์",
      module: null,
      category: "puzzle",
    },
    jigsaw: { title: "จิ๊กซอว์", module: null, category: "puzzle" },
    "math-speed": { title: "คิดเลขเร็ว", module: null, category: "training" },
    "reaction-game": { title: "ตอบสนองไว", module: null, category: "training" },
  },
};

// UI Elements
const DOM = {
  views: {
    home: document.getElementById("viewHome"),
    games: document.getElementById("viewGames"),
    arena: document.getElementById("viewGameArena"),
  },
  buttons: {
    back: document.getElementById("backBtn"),
    instruction: document.getElementById("instructionBtn"),
    profile: document.getElementById("profileBtn"),
  },
  text: {
    title: document.getElementById("screenTitle"),
    categoryTitle: document.getElementById("categoryTitle"),
    totalScorePill: document.getElementById("totalScorePill"),
  },
  containers: {
    gamesList: document.getElementById("gamesList"),
    gameArena: document.getElementById("gameContainer"),
  },
  modals: {
    instruction: document.getElementById("instructionModal"),
    result: document.getElementById("resultModal"),
    profile: document.getElementById("profileModal"),
  },
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Icons
  lucide.createIcons();

  // Load local storage data
  loadUserData();

  // Setup Navigation Listeners
  setupNavigation();

  // Setup Modal Listeners
  setupModals();
});

/* ==========================================================================
   Navigation & Routing (SPA)
   ========================================================================== */

function setupNavigation() {
  // Category Cards -> Games List
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      showGamesList(category);
    });
  });

  // Back Button
  DOM.buttons.back.addEventListener("click", () => {
    if (DOM.views.arena.classList.contains("active")) {
      // If in a game, maybe prompt? For now, just go back to games list
      // Determine which category we were in if possible, or just go home
      cleanupCurrentGame();
      showHome();
    } else if (DOM.views.games.classList.contains("active")) {
      showHome();
    }
  });
}

function switchView(viewName) {
  // Hide all
  Object.values(DOM.views).forEach((v) =>
    v.classList.remove("active", "hidden"),
  );
  Object.values(DOM.views).forEach((v) => v.classList.add("hidden"));

  // Show target
  DOM.views[viewName].classList.remove("hidden");
  DOM.views[viewName].classList.add("active");

  // Handle Header
  if (viewName === "home") {
    DOM.buttons.back.classList.add("hidden");
    DOM.text.title.textContent = "Jum Dee";
  } else {
    DOM.buttons.back.classList.remove("hidden");
  }
}

function showHome() {
  switchView("home");
}

function showGamesList(category) {
  const categoryTitles = {
    memory: "ฝึกความจำ",
    puzzle: "ปริศนา ตรรกะ",
    training: "ฝึกสมองฉับไว",
  };

  DOM.text.title.textContent = categoryTitles[category] || "เลือกเกม";
  DOM.text.categoryTitle.textContent = categoryTitles[category] || "เกม";

  // Render Games Listing
  DOM.containers.gamesList.innerHTML = "";

  Object.entries(AppState.games).forEach(([gameId, gameInfo]) => {
    if (gameInfo.category === category) {
      const btn = document.createElement("div");
      btn.className = "game-item";
      btn.innerHTML = `
                <div>
                    <h4 style="font-size: 1.2rem; color: var(--blue-700);">${gameInfo.title}</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">แตะเพื่อเริ่มเล่น</p>
                </div>
                <div class="icon-btn" style="background-color: var(--blue-50); color: var(--blue-600);">
                    <i data-lucide="play"></i>
                </div>
            `;

      btn.addEventListener("click", () => {
        startGame(gameId);
      });

      DOM.containers.gamesList.appendChild(btn);
    }
  });

  // Re-init icons for new innerHTML
  lucide.createIcons();
  switchView("games");
}

/* ==========================================================================
   Game Management
   ========================================================================== */

function startGame(gameId) {
  const gameInfo = AppState.games[gameId];
  if (!gameInfo) return;

  AppState.currentGame = gameId;
  DOM.text.title.textContent = gameInfo.title;
  switchView("arena");

  // Clear arena
  DOM.containers.gameArena.innerHTML =
    '<div class="text-center"><p>กำลังโหลดเกม...</p></div>';

  // Show Instruction Modal first
  showInstruction(gameId);
}

function cleanupCurrentGame() {
  // Call cleanup on active game module if exists
  if (AppState.currentGame && AppState.games[AppState.currentGame].module) {
    if (
      typeof AppState.games[AppState.currentGame].module.cleanup === "function"
    ) {
      AppState.games[AppState.currentGame].module.cleanup();
    }
  }
  AppState.currentGame = null;
  DOM.containers.gameArena.innerHTML = "";
}

/* ==========================================================================
   Modals & UI
   ========================================================================== */

function setupModals() {
  // Instruction Modal
  document.getElementById("closeModalBtn").addEventListener("click", () => {
    DOM.modals.instruction.classList.add("hidden");
  });

  document.getElementById("startGameBtn").addEventListener("click", () => {
    DOM.modals.instruction.classList.add("hidden");
    loadGameModule(AppState.currentGame);
  });

  DOM.buttons.instruction.addEventListener("click", () => {
    if (AppState.currentGame) {
      showInstruction(AppState.currentGame);
    }
  });

  // Profile Modal
  DOM.buttons.profile.addEventListener("click", () => {
    document.getElementById("profileTotalScore").textContent = AppState.totalScore;
    DOM.modals.profile.classList.remove("hidden");
  });

  document.getElementById("closeProfileBtn").addEventListener("click", () => {
    DOM.modals.profile.classList.add("hidden");
  });

  document.getElementById("resetScoreBtn").addEventListener("click", () => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคะแนนสะสมทั้งหมด?")) {
      AppState.totalScore = 0;
      localStorage.setItem("jumDeeScore", 0);
      updateScoreDisplay();
      document.getElementById("profileTotalScore").textContent = 0;
      DOM.modals.profile.classList.add("hidden");
    }
  });

  // Result Modal
  document.getElementById("backToMenuBtn").addEventListener("click", () => {
    DOM.modals.result.classList.add("hidden");
    cleanupCurrentGame();
    showHome();
  });

  document.getElementById("playAgainBtn").addEventListener("click", () => {
    DOM.modals.result.classList.add("hidden");
    loadGameModule(AppState.currentGame); // Reload game
  });
}

function showInstruction(gameId) {
  const instructions = {
    "memory-matching":
      "พลิกการ์ดเพื่อหาคู่ภาพที่เหมือนกัน พยายามใช้จำนวนการพลิกให้น้อยที่สุด!",
    "grid-memory": "จดจำตำแหน่งช่องที่สว่างขึ้น แล้วแตะตามลำดับให้ถูกต้อง",
    "sequence-simon": "จำลำดับสีและเสียงที่เล่น แล้วทำซ้ำตามให้ถูกต้อง",
    sudoku:
      "เติมตัวเลข 1-4 ลงในตาราง โดยไม่ให้ซ้ำกันในแต่ละแถว คอลัมน์ และบล็อก 2x2",
    "word-matching": "โยงเส้นหรือเลือกคู่คำศัพท์ที่มีความหมายเกี่ยวข้องกัน",
    jigsaw: "แตะชิ้นส่วนที่อยู่ติดกับช่องว่างเพื่อเลื่อนสลับตำแหน่งและเรียงภาพให้สมบูรณ์",
    "math-speed": "แก้โจทย์คณิตศาสตร์หมายเลขง่ายๆ ให้ไวที่สุดก่อนเวลาหมด",
    "reaction-game": "แตะที่รูปร่างเป้าหมายทันทีที่ปรากฏขึ้นบนหน้าจอ",
  };

  document.getElementById("modalTitle").textContent =
    `วิธีเล่น: ${AppState.games[gameId].title}`;
  document.getElementById("modalBody").innerHTML =
    `<p>${instructions[gameId] || "กำลังเตรียมข้อมูล..."}</p>`;

  DOM.modals.instruction.classList.remove("hidden");
}

function showGameResult(score) {
  document.getElementById("finalScoreText").textContent = score;
  DOM.modals.result.classList.remove("hidden");
  addScore(score);

  // Auto trigger confetti if loaded (we'll load it dynamically if needed)
  if (window.confetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}

/* ==========================================================================
   Game Module Loader
   ========================================================================== */

function loadGameModule(gameId) {
  const scriptPath = `js/${gameId}.js`;

  // Check if already loaded
  if (AppState.games[gameId].module) {
    AppState.games[gameId].module.init(
      DOM.containers.gameArena,
      showGameResult,
    );
    return;
  }

  // Dynamic Script Loading
  const script = document.createElement("script");
  script.src = scriptPath;
  script.onload = () => {
    // Assume the script exposes a global object matching the gameId (camelCase)
    // e.g., 'memory-matching' -> window.MemoryMatchingGame
    const globalName =
      gameId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("") + "Game";

    if (window[globalName]) {
      AppState.games[gameId].module = window[globalName];
      AppState.games[gameId].module.init(
        DOM.containers.gameArena,
        showGameResult,
      );
    } else {
      DOM.containers.gameArena.innerHTML =
        '<div class="text-center p-4"><p>ขออภัย ระบบกำลังพัฒนาเกมนี้อยู่ครับ</p></div>';
    }
  };
  script.onerror = () => {
    DOM.containers.gameArena.innerHTML =
      '<div class="text-center p-4"><p>ขออภัย ไม่พบไฟล์เกม หรือกำลังพัฒนาอยู่ครับ</p></div>';
  };

  document.body.appendChild(script);
}

/* ==========================================================================
   User Data & Scoring
   ========================================================================== */

function loadUserData() {
  const saved = localStorage.getItem("jumDeeScore");
  if (saved) {
    AppState.totalScore = parseInt(saved, 10);
    updateScoreDisplay();
  }
}

function addScore(points) {
  if (points > 0) {
    AppState.totalScore += points;
    localStorage.setItem("jumDeeScore", AppState.totalScore);
    updateScoreDisplay();
  }
}

function updateScoreDisplay() {
  DOM.text.totalScorePill.textContent = `${AppState.totalScore} แต้ม`;

const toggleBtn = document.getElementById("toggleAboutBtn");
const aboutContent = document.getElementById("aboutContent");

if (toggleBtn && aboutContent) {
    toggleBtn.addEventListener("click", () => {
        aboutContent.classList.toggle("hidden");

        // เปลี่ยนข้อความปุ่ม
        if (aboutContent.classList.contains("hidden")) {
            toggleBtn.textContent = "เกี่ยวกับ Jum Dee";
        } else {
            toggleBtn.textContent = "ซ่อนข้อมูล";
        }
    });
}
}
