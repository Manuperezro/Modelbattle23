/* SDLC Models Challenge - Missions Controller (Tested & Robust Logic) */

// Global Game Journey State
window.gameState = {
  currentMission: 1,
  completedMissions: new Set(),

  completeMission(num) {
    this.completedMissions.add(num);
    this.updateHUD();
    window.soundEngine.playSuccess();
  },

  updateHUD() {
    for (let i = 1; i <= 8; i++) {
      const node = document.getElementById(`journey-node-${i}`);
      if (!node) continue;

      if (this.completedMissions.has(i)) {
        node.className = 'journey-step-node completed';
        node.innerText = '✓';
      } else if (i === this.currentMission) {
        node.className = 'journey-step-node active';
        node.innerText = i;
      } else {
        node.className = 'journey-step-node';
        node.innerText = i;
      }
    }
  },

  goToMission(num) {
    this.currentMission = num;
    this.updateHUD();
    this.renderCurrentMission();
  },

  renderCurrentMission() {
    document.querySelectorAll('.mission-screen').forEach(scr => scr.classList.remove('active'));
    const activeScr = document.getElementById(`mission-${this.currentMission}`);
    if (activeScr) {
      activeScr.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

/* MISSION 1: BUILD WATERFALL */
class Mission1Controller {
  constructor() {
    this.slots = [null, null, null, null, null];
    this.availableItems = ['DEVELOPMENT', 'REQUIREMENTS', 'DEPLOYMENT', 'DESIGN', 'TESTING'];
    this.correctOrder = ['REQUIREMENTS', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT'];
    this.selectedItem = null;
  }

  init() {
    this.render();
  }

  render() {
    const poolContainer = document.getElementById('m1-pool');
    const trackContainer = document.getElementById('m1-track');

    if (!poolContainer || !trackContainer) return;

    // Render Pool
    poolContainer.innerHTML = this.availableItems.map(item => `
      <div class="drag-item ${this.selectedItem === item ? 'selected' : ''}" 
           onclick="window.m1.selectPoolItem('${item}')"
           data-id="${item}">
        <span>💧</span> ${item}
      </div>
    `).join('');

    // Render 5 Waterfall Slots
    trackContainer.innerHTML = this.correctOrder.map((_, i) => {
      const placedVal = this.slots[i];
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem;">
          <div style="font-size:1.1rem; color:var(--waterfall-color); font-weight:700;">💧 Stage ${i + 1}</div>
          <div class="waterfall-slot ${placedVal ? 'placed' : ''}" 
               id="m1-slot-${i}" 
               onclick="window.m1.handleSlotClick(${i})"
               style="width:100%; max-width:480px;">
            ${placedVal 
              ? `<div class="drag-item" style="width:100%; justify-content:center; background:rgba(0,180,216,0.3); border-color:var(--waterfall-color);">💧 ${placedVal} <span style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem;">(Click to remove)</span></div>`
              : `<span style="color:var(--text-muted); font-weight:600;">[ ? Place Stage ${i + 1} Here ]</span>`
            }
          </div>
          ${i < 4 ? '<div style="font-size:1.4rem; color:var(--waterfall-color);">↓</div>' : ''}
        </div>
      `;
    }).join('');
  }

  selectPoolItem(item) {
    window.soundEngine.playClick();
    if (this.selectedItem === item) {
      this.selectedItem = null;
    } else {
      this.selectedItem = item;
    }
    this.render();
  }

  handleSlotClick(index) {
    const existingPlaced = this.slots[index];

    // If slot has item -> remove it back to pool
    if (existingPlaced && !this.selectedItem) {
      window.soundEngine.playPlace();
      this.slots[index] = null;
      this.availableItems.push(existingPlaced);
      this.render();
      return;
    }

    // If item selected -> place it in slot
    if (this.selectedItem) {
      window.soundEngine.playPlace();
      
      // If slot already had an item, swap it back to pool
      if (existingPlaced) {
        this.availableItems.push(existingPlaced);
      }

      this.slots[index] = this.selectedItem;
      const itemIdx = this.availableItems.indexOf(this.selectedItem);
      if (itemIdx > -1) {
        this.availableItems.splice(itemIdx, 1);
      }
      this.selectedItem = null;
      this.render();
      this.checkCompletion();
    }
  }

  checkCompletion() {
    if (this.slots.includes(null)) return;

    const isCorrect = this.slots.every((val, idx) => val === this.correctOrder[idx]);
    const feedbackBox = document.getElementById('m1-feedback');

    if (isCorrect) {
      window.gameState.completeMission(1);
      this.slots.forEach((_, i) => {
        const slotEl = document.getElementById(`m1-slot-${i}`);
        if (slotEl) slotEl.classList.add('water-flowing');
      });

      feedbackBox.className = 'feedback-box active success';
      feedbackBox.innerHTML = `
        <div class="feedback-title">✓ WATERFALL COMPLETE</div>
        <div class="feedback-text">
          <div style="font-size:1.1rem; font-weight:700; margin-bottom:0.5rem; color:var(--accent-cyan);">
            PLAN ➔ DESIGN ➔ BUILD ➔ TEST ➔ RELEASE
          </div>
          "Stages mainly progress sequentially. One main phase finishes before the next begins."
        </div>

        <div class="real-world-box">
          <div class="real-world-title">🌍 WHERE MIGHT WE SEE THIS?</div>
          <div>
            <strong>Construction / Contract Projects:</strong><br/>
            🏢 Client Requirements ➔ 📐 Approved Architectural Design ➔ 🔨 Construction Build ➔ 🔍 Inspection ➔ 🏢 Handover.
            <br/><br/>
            <strong>Software Connection:</strong> Software projects for clients with a fixed specification and formal approval process where changes later in the project are expensive.
          </div>
        </div>

        <button class="btn-primary" style="margin-top:1.25rem;" onclick="window.gameState.goToMission(2)">
          PROCEED TO MISSION 2 ➔
        </button>
      `;
    } else {
      window.soundEngine.playError();
      feedbackBox.className = 'feedback-box active danger';
      feedbackBox.innerHTML = `
        <div class="feedback-title">⚠️ Sequence Incorrect</div>
        <div class="feedback-text">
          Waterfall requires a strict order: Requirements first, followed by Design, Development, Testing, and Deployment. Click any placed block to return it to the pool!
        </div>
      `;
    }
  }

  reset() {
    this.slots = [null, null, null, null, null];
    this.availableItems = ['DEVELOPMENT', 'REQUIREMENTS', 'DEPLOYMENT', 'DESIGN', 'TESTING'];
    this.selectedItem = null;
    this.render();
  }
}

/* MISSION 2: SURVIVE A REQUIREMENT CHANGE (BREAK WATERFALL) */
class Mission2Controller {
  constructor() {
    this.selectedStages = new Set();
  }

  init() {}

  toggleStage(stageId) {
    window.soundEngine.playClick();
    const card = document.getElementById(`m2-stage-${stageId}`);
    if (this.selectedStages.has(stageId)) {
      this.selectedStages.delete(stageId);
      if (card) card.classList.remove('affected');
    } else {
      this.selectedStages.add(stageId);
      if (card) card.classList.add('affected');
    }
  }

  evaluateImpact() {
    const feedbackBox = document.getElementById('m2-feedback');
    if (this.selectedStages.size < 2) {
      alert("Click the stages you think are affected by the late mobile requirement change!");
      return;
    }

    window.gameState.completeMission(2);
    feedbackBox.className = 'feedback-box active success';
    feedbackBox.innerHTML = `
      <div class="feedback-title">✓ WATERFALL CHANGE SURVIVED</div>
      <div class="feedback-text">
        <div style="font-size:1.1rem; font-weight:800; color:var(--accent-red); margin-bottom:0.5rem;">
          LATE CHANGE CAN AFFECT WORK ALREADY COMPLETED!
        </div>
        Because Requirements and Design were already completed and signed off, adding mobile booking forced the team to rewind the timeline — rewriting finished specifications and throwing away completed code.
        <br/><br/>
        <em>Note: Waterfall is still very useful when requirements are stable, well understood, and unlikely to change frequently.</em>
      </div>

      <div class="real-world-box">
        <div class="real-world-title">🌍 WHERE MIGHT WE SEE THIS?</div>
        <div>
          Projects with rigid compliance, regulatory safety controls, or physical manufacturing contracts often use Waterfall because upfront requirements must be fully validated before physical build begins.
        </div>
      </div>

      <button class="btn-primary" style="margin-top:1.25rem;" onclick="window.gameState.goToMission(3)">
        PROCEED TO MISSION 3 ➔
      </button>
    `;
  }
}

/* MISSION 3: RUN AN AGILE SPRINT */
class Mission3Controller {
  constructor() {
    this.step = 1;
    this.sprintFeatures = [];
    this.features = [
      { id: 'login', name: '🔐 LOGIN' },
      { id: 'menu', name: '🍕 VIEW MENU' },
      { id: 'basket', name: '🛒 BASKET' },
      { id: 'pay', name: '💳 PAYMENT' },
      { id: 'track', name: '📍 DELIVERY TRACKING' },
      { id: 'review', name: '⭐ REVIEWS' }
    ];
  }

  init() {
    this.renderBacklog();
  }

  renderBacklog() {
    const list = document.getElementById('m3-backlog-items');
    if (!list) return;

    list.innerHTML = this.features.map(f => `
      <div class="drag-item ${this.sprintFeatures.some(s => s.id === f.id) ? 'selected' : ''}" 
           onclick="window.m3.toggleFeature('${f.id}')" 
           id="m3-feat-${f.id}">
        ${f.name}
      </div>
    `).join('');
  }

  toggleFeature(id) {
    window.soundEngine.playClick();
    const feat = this.features.find(f => f.id === id);

    const idx = this.sprintFeatures.findIndex(f => f.id === id);
    if (idx > -1) {
      this.sprintFeatures.splice(idx, 1);
    } else {
      if (this.sprintFeatures.length >= 3) {
        alert("Select up to 3 features for Sprint 1!");
        return;
      }
      this.sprintFeatures.push(feat);
    }
    this.renderBacklog();
  }

  startSprint() {
    if (this.sprintFeatures.length === 0) {
      alert("Select at least 1 feature for Sprint 1!");
      return;
    }

    window.soundEngine.playSuccess();
    const kanbanTodo = document.getElementById('m3-kanban-todo');
    const kanbanDone = document.getElementById('m3-kanban-done');

    if (kanbanTodo) {
      kanbanTodo.innerHTML = this.sprintFeatures.map(f => `<div class="drag-item">${f.name}</div>`).join('');
    }

    setTimeout(() => {
      if (kanbanDone) {
        kanbanDone.innerHTML = this.sprintFeatures.map(f => `<div class="drag-item" style="border-color:var(--accent-green);">✓ ${f.name}</div>`).join('');
        if (kanbanTodo) kanbanTodo.innerHTML = '';
      }

      const feedbackBox = document.getElementById('m3-feedback');
      if (this.step === 1) {
        this.step = 2;
        feedbackBox.className = 'feedback-box active warning';
        feedbackBox.innerHTML = `
          <div class="feedback-title">👤 CUSTOMER FEEDBACK AFTER SPRINT 1</div>
          <div class="feedback-text">
            > <em>"Customers urgently want to see where their delivery is!"</em>
            <br/><br/>
            Now prioritize <strong>📍 DELIVERY TRACKING</strong> into <strong>Sprint 2</strong>! Notice how Agile allows priorities to adapt after every sprint release!
          </div>
          <button class="btn-primary" style="margin-top:1rem;" onclick="window.m3.completeAgile()">
            RUN SPRINT 2 WITH UPDATED PRIORITIES ➔
          </button>
        `;
      }
    }, 1000);
  }

  completeAgile() {
    window.gameState.completeMission(3);
    const feedbackBox = document.getElementById('m3-feedback');
    feedbackBox.className = 'feedback-box active success';
    feedbackBox.innerHTML = `
      <div class="feedback-title">✓ THIS IS THE IDEA BEHIND AGILE</div>
      <div class="feedback-text">
        <div style="font-size:1.1rem; font-weight:800; color:var(--agile-color); margin-bottom:0.5rem;">
          BUILD ➔ SHOW ➔ FEEDBACK ➔ ADAPT ➔ BUILD AGAIN
        </div>
        Agile breaks development into small increments. Feedback is gathered early and often, making it easy to adapt to changing user needs!
      </div>

      <div class="real-world-box">
        <div class="real-world-title">🌍 AGILE REAL-WORLD CONNECTION</div>
        <div>
          📱 <strong>Smartphone Apps & Online Services:</strong> Apps release Version 1.0 ➔ User Feedback ➔ Version 1.1 ➔ Analytics ➔ Version 1.2. Modern teams continuously release updates based on real user data!
        </div>
      </div>

      <button class="btn-primary" style="margin-top:1.25rem;" onclick="window.gameState.goToMission(4)">
        PROCEED TO MISSION 4 ➔
      </button>
    `;
  }
}

/* MISSION 4: BUILD THE V-MODEL */
class Mission4Controller {
  constructor() {
    this.selectedLeft = null;
    this.connectedPairs = new Map();
    this.correctPairs = {
      'req': 'accept',
      'sys': 'systest',
      'det': 'unit'
    };
  }

  init() {
    document.querySelectorAll('.v-node-btn').forEach(btn => {
      btn.onclick = () => this.handleNodeClick(btn);
    });
  }

  handleNodeClick(btn) {
    const side = btn.dataset.side;
    const id = btn.dataset.id;

    if (side === 'left') {
      document.querySelectorAll('.v-node-btn[data-side="left"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      this.selectedLeft = id;
      window.soundEngine.playClick();
    } else if (side === 'right' && this.selectedLeft) {
      if (this.correctPairs[this.selectedLeft] === id) {
        window.soundEngine.playSuccess();
        this.connectedPairs.set(this.selectedLeft, id);

        const leftBtn = document.querySelector(`.v-node-btn[data-id="${this.selectedLeft}"]`);
        if (leftBtn) leftBtn.classList.add('connected');
        btn.classList.add('connected');

        this.selectedLeft = null;
        document.querySelectorAll('.v-node-btn[data-side="left"]').forEach(b => b.classList.remove('selected'));
        this.checkCompletion();
      } else {
        window.soundEngine.playError();
        btn.classList.add('shake-error');
        setTimeout(() => btn.classList.remove('shake-error'), 400);
      }
    }
  }

  checkCompletion() {
    if (this.connectedPairs.size >= 3) {
      window.gameState.completeMission(4);
      const feedbackBox = document.getElementById('m4-feedback');
      feedbackBox.className = 'feedback-box active success';
      feedbackBox.innerHTML = `
        <div class="feedback-title">✓ V-MODEL COMPLETE</div>
        <div class="feedback-text">
          <div style="font-size:1.1rem; font-weight:800; color:var(--vmodel-color); margin-bottom:0.5rem;">
            DEVELOPMENT ↘ ↗ TESTING
          </div>
          The V-Model plans testing alongside early development stages! Every specification level has a corresponding validation test planned early.
        </div>

        <div class="real-world-box">
          <div class="real-world-title">🌍 REAL-WORLD V-MODEL CHALLENGE — CAR BRAKE SOFTWARE</div>
          <div>
            <strong>Requirement:</strong> "When driver presses the brake pedal, system must detect input within 50ms."
            <br/>
            <strong>Test Idea:</strong> "Simulate brake pedal pressure and measure system response time."
            <br/><br/>
            <em>Learning Point: Requirements should always be testable!</em>
          </div>
        </div>

        <button class="btn-primary" style="margin-top:1.25rem;" onclick="window.gameState.goToMission(5)">
          PROCEED TO MISSION 5 ➔
        </button>
      `;
    }
  }
}

/* MISSION 5: FIX THE SPIRAL MODEL (CLICK-THROUGH SIMULATION) */
class Mission5Controller {
  constructor() {
    this.stage = 1; // 1: PLAN, 2: RISKS, 3: PROTOTYPE, 4: EVALUATE
    this.selectedRisks = new Set();
    this.riskResponses = {
      'security': { title: '🔐 DATA SECURITY', risk: 'Patient information could be exposed.', mitigation: 'Improve authentication, permissions, and encryption testing.' },
      'db': { title: '💾 DATABASE FAILURE', risk: 'Hospital database crashes under load.', mitigation: 'Set up redundant backups and failover servers.' },
      'perf': { title: '🐌 PERFORMANCE', risk: 'System slows down during emergencies.', mitigation: 'Optimize database queries and perform stress testing.' },
      'staff': { title: '👩‍⚕️ STAFF USABILITY', risk: 'Doctors reject complex interface.', mitigation: 'Build interactive prototypes and conduct early staff trials.' },
      'cost': { title: '💰 COST OVERRUN', risk: 'Project exceeds initial budget.', mitigation: 'Conduct milestone cost audits after every cycle.' }
    };
  }

  init() {
    this.renderTracker();
  }

  renderTracker() {
    const node1 = document.getElementById('m5-node-1');
    const node2 = document.getElementById('m5-node-2');
    const node3 = document.getElementById('m5-node-3');
    const node4 = document.getElementById('m5-node-4');

    if (node1) node1.className = `spiral-step-node ${this.stage >= 1 ? 'unlocked' : ''} ${this.stage > 1 ? 'completed' : ''}`;
    if (node2) node2.className = `spiral-step-node ${this.stage >= 2 ? 'unlocked' : ''} ${this.stage > 2 ? 'completed' : ''}`;
    if (node3) node3.className = `spiral-step-node ${this.stage >= 3 ? 'unlocked' : ''} ${this.stage > 3 ? 'completed' : ''}`;
    if (node4) node4.className = `spiral-step-node ${this.stage >= 4 ? 'unlocked' : ''} ${this.stage > 4 ? 'completed' : ''}`;
  }

  clickPlan() {
    if (this.stage === 1) {
      window.soundEngine.playSuccess();
      this.stage = 2;
      this.renderTracker();

      const panel = document.getElementById('m5-active-panel');
      if (panel) {
        panel.innerHTML = `
          <div style="background:rgba(0,242,254,0.1); border:1px solid var(--accent-cyan); padding:1rem; border-radius:8px;">
            <h4 style="color:var(--accent-cyan); font-family:var(--font-heading);">✓ STAGE 1: PLAN COMPLETE</h4>
            <p style="margin-top:0.4rem;">Project objectives, constraints, and hospital requirements are documented.</p>
            <p style="margin-top:0.6rem; font-weight:700; color:var(--accent-amber);">➔ Now click STAGE 2: IDENTIFY RISKS above!</p>
          </div>
        `;
      }
    }
  }

  clickIdentifyRisks() {
    if (this.stage >= 2) {
      window.soundEngine.playClick();
      const panel = document.getElementById('m5-active-panel');
      if (panel) {
        panel.innerHTML = `
          <h3 style="font-family:var(--font-heading); color:var(--accent-amber); margin-bottom:0.75rem;">
            ⚠️ STAGE 2: RISK INVESTIGATION (Select at least 2 risks)
          </h3>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; margin-bottom:1rem;">
            <div class="risk-card ${this.selectedRisks.has('security') ? 'selected' : ''}" onclick="window.m5.toggleRisk('security')">
              <span>${this.selectedRisks.has('security') ? '✓' : '○'} DATA SECURITY</span>
            </div>
            <div class="risk-card ${this.selectedRisks.has('db') ? 'selected' : ''}" onclick="window.m5.toggleRisk('db')">
              <span>${this.selectedRisks.has('db') ? '✓' : '○'} DATABASE FAILURE</span>
            </div>
            <div class="risk-card ${this.selectedRisks.has('perf') ? 'selected' : ''}" onclick="window.m5.toggleRisk('perf')">
              <span>${this.selectedRisks.has('perf') ? '✓' : '○'} PERFORMANCE</span>
            </div>
            <div class="risk-card ${this.selectedRisks.has('staff') ? 'selected' : ''}" onclick="window.m5.toggleRisk('staff')">
              <span>${this.selectedRisks.has('staff') ? '✓' : '○'} STAFF USABILITY</span>
            </div>
            <div class="risk-card ${this.selectedRisks.has('cost') ? 'selected' : ''}" onclick="window.m5.toggleRisk('cost')">
              <span>${this.selectedRisks.has('cost') ? '✓' : '○'} COST OVERRUN</span>
            </div>
          </div>

          <button class="btn-primary" id="m5-btn-analyse" ${this.selectedRisks.size < 2 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="window.m5.analyseRisks()">
            ANALYSE SELECTED RISKS (${this.selectedRisks.size}/2 Selected) ➔
          </button>
        `;
      }
    }
  }

  toggleRisk(riskKey) {
    window.soundEngine.playClick();
    if (this.selectedRisks.has(riskKey)) {
      this.selectedRisks.delete(riskKey);
    } else {
      this.selectedRisks.add(riskKey);
    }
    this.clickIdentifyRisks();
  }

  analyseRisks() {
    if (this.selectedRisks.size < 2) return;

    window.soundEngine.playSuccess();
    this.stage = 3;
    this.renderTracker();

    const panel = document.getElementById('m5-active-panel');
    if (panel) {
      const riskListHtml = Array.from(this.selectedRisks).map(k => {
        const item = this.riskResponses[k];
        return `
          <div style="background:rgba(255,255,255,0.04); border-left:3px solid var(--accent-amber); padding:0.75rem 1rem; border-radius:4px; margin-bottom:0.5rem;">
            <strong style="color:var(--accent-amber);">${item.title}</strong>
            <div style="font-size:0.88rem; margin-top:0.25rem;"><strong>Risk:</strong> ${item.risk}</div>
            <div style="font-size:0.88rem; color:var(--accent-green); margin-top:0.25rem;"><strong>Response:</strong> ${item.mitigation}</div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <h4 style="font-family:var(--font-heading); color:var(--accent-green); margin-bottom:0.75rem;">
          ✓ RISKS ANALYSED & RESPONSES PLANNED:
        </h4>
        ${riskListHtml}
        <p style="margin-top:0.75rem; font-weight:700; color:var(--accent-cyan);">➔ Now click STAGE 3: DEVELOP / PROTOTYPE above!</p>
      `;
    }
  }

  clickDevelop() {
    if (this.stage >= 3) {
      window.soundEngine.playSuccess();
      this.stage = 4;
      this.renderTracker();

      const panel = document.getElementById('m5-active-panel');
      if (panel) {
        panel.innerHTML = `
          <div style="background:rgba(127,0,255,0.1); border:1px solid var(--accent-purple); padding:1rem; border-radius:8px;">
            <h4 style="color:var(--accent-purple); font-family:var(--font-heading);">✓ STAGE 3: DEVELOP / PROTOTYPE COMPLETE</h4>
            <p style="margin-top:0.4rem;">"Build or prototype part of the solution to reduce technical uncertainty."</p>
            <p style="margin-top:0.6rem; font-weight:700; color:var(--accent-cyan);">➔ Now click STAGE 4: EVALUATE above!</p>
          </div>
        `;
      }
    }
  }

  clickEvaluate() {
    if (this.stage >= 4) {
      window.gameState.completeMission(5);
      const panel = document.getElementById('m5-active-panel');
      if (panel) {
        panel.innerHTML = `
          <div style="background:rgba(0,245,212,0.1); border:1px solid var(--accent-green); padding:1rem; border-radius:8px;">
            <h4 style="color:var(--accent-green); font-family:var(--font-heading);">✓ STAGE 4: EVALUATE COMPLETE</h4>
            <p style="margin-top:0.4rem;">"Review what has been learned before beginning another cycle."</p>
            <div style="font-size:1.3rem; font-weight:800; color:var(--accent-purple); margin-top:0.75rem;">
              🌀 RETURNING TO NEXT CYCLE...
            </div>
          </div>
        `;
      }

      const feedbackBox = document.getElementById('m5-feedback');
      feedbackBox.className = 'feedback-box active success';
      feedbackBox.innerHTML = `
        <div class="feedback-title">✓ SPIRAL MISSION COMPLETE</div>
        <div class="feedback-text">
          <div style="font-size:1.1rem; font-weight:800; color:var(--spiral-color); margin-bottom:0.5rem;">
            PLAN ➔ RISK ANALYSIS ➔ DEVELOP ➔ EVALUATE ↻
          </div>
          The Spiral Model puts <strong>RISK ANALYSIS</strong> at the heart of every cycle. High-cost, high-risk projects repeatedly evaluate risks before building prototypes.
        </div>

        <div class="real-world-box">
          <div class="real-world-title">🌍 SPIRAL REAL-WORLD CONNECTION</div>
          <div>
            🏥 Healthcare Systems &nbsp;|&nbsp; ✈️ Aviation Systems &nbsp;|&nbsp; 🏦 Financial Infrastructure
            <br/><br/>
            Projects that are large, complex, or high-risk benefit from approaches that place heavy emphasis on identifying and mitigating risk early.
          </div>
        </div>

        <button class="btn-primary" style="margin-top:1.25rem;" onclick="window.gameState.goToMission(6)">
          PROCEED TO MISSION 6 ➔
        </button>
      `;
    }
  }
}

/* MISSION 6: REDESIGN ITERATIVE DEVELOPMENT (LIVE CODE & UI PUZZLE) */
class Mission6Controller {
  constructor() {
    this.version = 1;
    this.selectedFixes = new Set();
  }

  init() {
    this.renderPuzzle();
  }

  toggleFix(fixKey) {
    window.soundEngine.playClick();
    if (this.selectedFixes.has(fixKey)) {
      this.selectedFixes.delete(fixKey);
    } else {
      this.selectedFixes.add(fixKey);
    }
    this.renderPuzzle();
  }

  renderPuzzle() {
    const fix1Card = document.getElementById('m6-fix-pass');
    const fix2Card = document.getElementById('m6-fix-btn');
    const codeBox = document.getElementById('m6-code-box');
    const screenBox = document.getElementById('m6-screen-preview');
    const applyBtn = document.getElementById('m6-btn-v2');

    const hasPass = this.selectedFixes.has('pass');
    const hasBtn = this.selectedFixes.has('btn');

    // Update Fix Cards visual state
    if (fix1Card) {
      fix1Card.className = `risk-card ${hasPass ? 'selected' : ''}`;
      fix1Card.innerHTML = `<span>${hasPass ? '✓' : '○'} 🔧 Fix 1: Mask Password Input (type="password")</span>`;
    }

    if (fix2Card) {
      fix2Card.className = `risk-card ${hasBtn ? 'selected' : ''}`;
      fix2Card.innerHTML = `<span>${hasBtn ? '✓' : '○'} 🔧 Fix 2: Enlarge Login Button (width: 100%)</span>`;
    }

    // Update Live Code Snippet
    const inputType = hasPass ? 'password' : 'text';
    const btnStyle = hasBtn ? 'width:100%; font-size:1rem; padding:0.6rem;' : 'width:30px; font-size:6px;';

    if (codeBox) {
      codeBox.innerHTML = `
        <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:0.4rem;">// LIVE CODE PREVIEW (Version 1.${this.selectedFixes.size})</div>
        <code>
          &lt;input type="<span style="color:${hasPass ? 'var(--accent-green)' : 'var(--accent-red)'}">${inputType}</span>" placeholder="Password"&gt;<br/>
          &lt;button style="<span style="color:${hasBtn ? 'var(--accent-green)' : 'var(--accent-red)'}">${btnStyle}</span>"&gt;Login&lt;/button&gt;
        </code>
      `;
    }

    // Update Live UI Mockup Screen
    if (screenBox) {
      screenBox.innerHTML = `
        <h3 style="color:${this.selectedFixes.size > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-family:var(--font-heading);">
          Live Interface Preview (V1.${this.selectedFixes.size})
        </h3>
        <input type="${inputType}" placeholder="Password" style="padding:0.5rem; font-size:0.9rem; border-radius:4px; border:1px solid #475569; width:100%;" disabled>
        <button style="${btnStyle} background:var(--accent-cyan); color:#000; font-weight:700; border:none; border-radius:4px; cursor:pointer;" disabled>Login</button>
      `;
    }

    // Enable Apply button if at least 1 fix selected
    if (applyBtn) {
      if (this.selectedFixes.size > 0) {
        applyBtn.removeAttribute('disabled');
        applyBtn.style.opacity = '1';
        applyBtn.style.cursor = 'pointer';
      } else {
        applyBtn.setAttribute('disabled', 'true');
        applyBtn.style.opacity = '0.5';
        applyBtn.style.cursor = 'not-allowed';
      }
    }
  }

  applyVersion2() {
    if (this.selectedFixes.size === 0) {
      alert("Select at least 1 code fix card to apply!");
      return;
    }

    this.version = 2;
    window.soundEngine.playSuccess();

    document.getElementById('m6-v1-panel').style.display = 'none';
    document.getElementById('m6-v2-panel').style.display = 'block';

    const screenBox = document.getElementById('m6-screen-preview');
    if (screenBox) {
      screenBox.innerHTML = `
        <h3 style="color:var(--accent-cyan); font-family:var(--font-heading);">Version 2.0 (Code & UI Upgraded)</h3>
        <p>✓ Password input masked: <code>type="password"</code></p>
        <p>✓ Login button enlarged: <code>width: 100%</code></p>
        <div style="background:rgba(0,242,254,0.12); padding:0.75rem; border-radius:6px; font-size:0.88rem; margin-top:0.5rem;">
          👤 NEW USER FEEDBACK: "Need biometric authentication & high-contrast dark mode!"
        </div>
      `;
    }
  }

  applyVersion3() {
    window.gameState.completeMission(6);
    window.soundEngine.playSuccess();

    const screenBox = document.getElementById('m6-screen-preview');
    if (screenBox) {
      screenBox.innerHTML = `
        <h3 style="color:var(--accent-green); font-family:var(--font-heading);">Version 3.0 (Polished Release)</h3>
        <p>✓ Biometric authentication active.</p>
        <p>✓ High-contrast dark theme enabled.</p>
        <p style="color:var(--accent-amber); font-weight:700;">User Satisfaction Rating: ⭐⭐⭐⭐⭐ 4.9/5</p>
      `;
    }

    document.getElementById('m6-v2-panel').style.display = 'none';

    const feedbackBox = document.getElementById('m6-feedback');
    feedbackBox.className = 'feedback-box active success';
    feedbackBox.innerHTML = `
      <div class="feedback-title">✓ ITERATIVE DEVELOPMENT COMPLETE</div>
      <div class="feedback-text">
        <div style="font-size:1.1rem; font-weight:800; color:var(--iterative-color); margin-bottom:0.5rem;">
          V1 ➔ FEEDBACK ➔ V2 ➔ FEEDBACK ➔ V3
        </div>
        Iterative development means software develops through multiple versions, continually refined through user feedback!
      </div>

      <div class="real-world-box">
        <div class="real-world-title">🌍 REAL-WORLD CONNECTION — VIDEO GAME UPDATES</div>
        <div>
          🎮 Game Version 1.0 ➔ Player Feedback ➔ 🎮 Update 1.1 ➔ Bug Fixes & Improvements ➔ 🎮 Update 1.2.
        </div>
      </div>

      <button class="btn-primary" style="margin-top:1.25rem;" onclick="window.gameState.goToMission(7)">
        PROCEED TO MISSION 7 ➔
      </button>
    `;
  }
}

/* MISSION 7: REDESIGN REAL-WORLD MODEL DETECTIVE (GUESS BEFORE REVEAL) */
class Mission7Controller {
  constructor() {
    this.solvedCases = new Set();
    this.correctModels = {
      'a': 'agile',
      'b': 'spiral',
      'c': 'waterfall',
      'd': 'vmodel'
    };
  }

  guessCase(caseId, userGuess) {
    window.soundEngine.playClick();
    const correct = this.correctModels[caseId];
    const resultBox = document.getElementById(`m7-case-${caseId}-result`);

    if (userGuess === correct) {
      window.soundEngine.playSuccess();
      this.solvedCases.add(caseId);
      
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="background:rgba(0,245,212,0.15); border:1px solid var(--accent-green); padding:0.75rem; border-radius:6px; margin-top:0.5rem;">
            <strong style="color:var(--accent-green);">✓ CORRECT GUESS: ${userGuess.toUpperCase()}</strong>
            <p style="font-size:0.85rem; margin-top:0.25rem;">
              Evidence confirms this project matches ${userGuess.toUpperCase()} characteristics.
            </p>
          </div>
        `;
      }
    } else {
      window.soundEngine.playError();
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="background:rgba(255,51,102,0.15); border:1px solid var(--accent-red); padding:0.75rem; border-radius:6px; margin-top:0.5rem;">
            <strong style="color:var(--accent-red);">💡 MISCONCEPTION REVEALED</strong>
            <p style="font-size:0.85rem; margin-top:0.25rem;">
              You guessed <em>${userGuess.toUpperCase()}</em>, but the evidence points to <strong>${correct.toUpperCase()}</strong>! Try another option!
            </p>
          </div>
        `;
      }
    }

    if (this.solvedCases.size >= 4) {
      window.gameState.completeMission(7);
      const feedbackBox = document.getElementById('m7-feedback');
      feedbackBox.className = 'feedback-box active success';
      feedbackBox.innerHTML = `
        <div class="feedback-title">✓ ALL DETECTIVE CASES SOLVED</div>
        <div class="feedback-text">
          Excellent analysis! You guessed and verified the correct SDLC models from real-world evidence clues.
        </div>
        <button class="btn-primary" style="margin-top:1.25rem;" onclick="window.gameState.goToMission(8)">
          PROCEED TO FINAL CONSULTANT MISSION ➔
        </button>
      `;
    }
  }
}

/* MISSION 8: THE PROJECT CONSULTANT (FINAL MISSION) */
class Mission8Controller {
  constructor() {
    this.selectedBlocks = new Set();
  }

  toggleBlock(name) {
    window.soundEngine.playClick();
    const btn = document.getElementById(`m8-block-${name}`);
    if (this.selectedBlocks.has(name)) {
      this.selectedBlocks.delete(name);
      if (btn) btn.classList.remove('selected');
    } else {
      this.selectedBlocks.add(name);
      if (btn) btn.classList.add('selected');
    }
    this.renderStack();
  }

  renderStack() {
    const stackEl = document.getElementById('m8-stack-box');
    if (!stackEl) return;
    
    if (this.selectedBlocks.size === 0) {
      stackEl.innerHTML = `<span style="color:var(--text-muted);">[ Click building blocks above to assemble strategy ]</span>`;
    } else {
      stackEl.innerHTML = Array.from(this.selectedBlocks).map(b => `
        <div class="drag-item" style="border-color:var(--accent-cyan);">✓ ${b}</div>
      `).join('');
    }
  }

  finishConsultant() {
    if (this.selectedBlocks.size < 3) {
      alert("Select at least 3 strategy building blocks!");
      return;
    }

    window.gameState.completeMission(8);
    const screen = document.getElementById('mission-8');
    screen.innerHTML = `
      <div style="background:var(--bg-card); border:var(--glass-border); padding:2rem; border-radius:var(--radius-lg); text-align:center;">
        <h1 style="font-family:var(--font-heading); color:var(--accent-green); font-size:2.5rem;">🎉 ALL MISSIONS COMPLETE</h1>
        <p style="font-size:1.2rem; margin-top:0.5rem; color:var(--text-secondary);">You have mastered Unit 23 Software Development Lifecycle Models!</p>

        <div class="completion-checklist">
          <div class="completion-item">✓ WATERFALL</div>
          <div class="completion-item">✓ AGILE</div>
          <div class="completion-item">✓ V-MODEL</div>
          <div class="completion-item">✓ SPIRAL</div>
          <div class="completion-item">✓ ITERATIVE</div>
          <div class="completion-item">✓ REAL-WORLD DETECTIVE</div>
          <div class="completion-item">✓ PROJECT CONSULTANT</div>
        </div>

        <div style="margin-top:2rem; background:rgba(0,245,212,0.08); border:1px solid var(--accent-green); border-radius:var(--radius-md); padding:1.5rem; text-align:left;">
          <h3 style="color:var(--accent-green); font-family:var(--font-heading); margin-bottom:0.75rem;">YOU CAN NOW:</h3>
          <p>✓ Recognise different SDLC models.</p>
          <p>✓ Explain how their structures differ.</p>
          <p>✓ Identify how they handle change.</p>
          <p>✓ Understand where feedback happens.</p>
          <p>✓ Understand where testing happens.</p>
          <p>✓ Recognise the importance of risk.</p>
          <p>✓ Apply the models to different project scenarios.</p>
        </div>

        <div style="margin-top:2rem; display:flex; justify-content:center; gap:1rem;">
          <button class="btn-primary" onclick="window.gameState.goToMission(1)">REPLAY A MISSION</button>
          <button class="btn-secondary" onclick="window.location.reload()">RESTART ALL MISSIONS</button>
        </div>
      </div>
    `;
  }
}

// Instantiate Mission Controllers
window.m1 = new Mission1Controller();
window.m2 = new Mission2Controller();
window.m3 = new Mission3Controller();
window.m4 = new Mission4Controller();
window.m5 = new Mission5Controller();
window.m6 = new Mission6Controller();
window.m7 = new Mission7Controller();
window.m8 = new Mission8Controller();
