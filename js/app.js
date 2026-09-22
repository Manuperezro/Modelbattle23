/* SDLC Models Challenge - App Initialization & Global Controls */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize HUD Journey
  window.gameState.updateHUD();

  // Initialize Missions
  window.m1.init();
  window.m2.init();
  window.m3.init();
  window.m4.init();
  window.m5.init();
  window.m6.init();

  // Modal navigation setup
  const modal = document.getElementById('mission-modal');
  const openModalBtn = document.getElementById('btn-open-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');

  if (openModalBtn && modal) {
    openModalBtn.onclick = () => {
      renderMissionGrid();
      modal.classList.add('active');
    };
  }

  if (closeModalBtn && modal) {
    closeModalBtn.onclick = () => {
      modal.classList.remove('active');
    };
  }

  // Sound mute toggle
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    soundBtn.onclick = () => {
      const isMuted = window.soundEngine.toggleMute();
      soundBtn.innerText = isMuted ? '🔇' : '🔊';
    };
  }
});

function renderMissionGrid() {
  const grid = document.getElementById('mission-grid-container');
  if (!grid) return;

  const names = [
    "Mission 1 — Build Waterfall 🧩",
    "Mission 2 — Survive a Requirement Change 🏫",
    "Mission 3 — Run an Agile Sprint 🔄",
    "Mission 4 — Build the V-Model ⚡",
    "Mission 5 — Navigate the Spiral 🌀",
    "Mission 6 — Improve Iteratively 🛠️",
    "Mission 7 — Real-World Model Detective 🕵️",
    "Final Mission — Choose a Development Strategy 👔"
  ];

  grid.innerHTML = names.map((name, i) => {
    const num = i + 1;
    const isCompleted = window.gameState.completedMissions.has(num);

    return `
      <button class="btn-secondary" 
              style="justify-content: flex-start; padding: 0.85rem;"
              onclick="window.gameState.goToMission(${num}); document.getElementById('mission-modal').classList.remove('active');">
        <span>${isCompleted ? '✓' : '○'}</span>
        <span>${name}</span>
      </button>
    `;
  }).join('');
}
