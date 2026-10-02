// Main Application Controller & Event Wiring

import { GameEngine } from './game/GameEngine.js';
import { ISSUES, ENDLESS_MODE_CONFIG } from './game/Levels.js';
import { soundEngine } from './audio/SoundSynthesizer.js';
import { storage } from './game/Storage.js';
import { CutsceneViewer } from './game/Cutscenes.js';
import { ShopUI } from './game/Shop.js';
import { HighScoresUI } from './game/HighScores.js';
import { NewspaperUI } from './game/NewspaperUI.js';

window.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('game-canvas');
  const screenTitle = document.getElementById('screen-title');
  const screenGame = document.getElementById('screen-game');

  const issueCarouselContainer = document.getElementById('issue-carousel-container');
  const btnPlaySelected = document.getElementById('btn-play-selected');
  const btnOpenShop = document.getElementById('btn-open-shop');
  const btnOpenManual = document.getElementById('btn-open-manual');
  const btnOpenHighscores = document.getElementById('btn-open-highscores');

  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const btnToggleMusic = document.getElementById('btn-toggle-music');
  const labelSoundState = document.getElementById('label-sound-state');
  const labelMusicState = document.getElementById('label-music-state');
  const audioPromptBanner = document.getElementById('audio-prompt-banner');

  // Modals
  const modalManual = document.getElementById('modal-manual');
  const btnCloseManual = document.getElementById('btn-close-manual');
  const modalPause = document.getElementById('modal-pause');
  const btnPauseGame = document.getElementById('btn-pause-game');
  const btnResumeGame = document.getElementById('btn-resume-game');
  const btnPauseShop = document.getElementById('btn-pause-shop');
  const btnRestartShift = document.getElementById('btn-restart-shift');
  const btnQuitToTitle = document.getElementById('btn-quit-to-title');

  const modalShopEl = document.getElementById('modal-shop');
  const modalCutscenesEl = document.getElementById('modal-cutscenes');
  const modalHighscoresEl = document.getElementById('modal-highscores');
  const modalNewspaperEl = document.getElementById('modal-newspaper');

  // HUD Elements
  const hudIssueTitle = document.getElementById('hud-issue-title');
  const hudApprovalPercent = document.getElementById('hud-approval-percent');
  const hudApprovalFill = document.getElementById('hud-approval-fill');
  const hudEarningsVal = document.getElementById('hud-earnings-val');
  const hudScoreVal = document.getElementById('hud-score-val');
  const hudTimeVal = document.getElementById('hud-time-val');
  const hudTickerText = document.getElementById('hud-ticker-text');
  const toolButtons = document.querySelectorAll('.tool-btn');

  // Initialize Game Engine
  const engine = new GameEngine(canvas);

  // Initialize UI Sub-controllers
  let selectedIssueId = 1;

  const cutsceneViewer = new CutsceneViewer(modalCutscenesEl, () => {
    // Cutscene finished -> enter active shift
    screenTitle.classList.add('hidden');
    screenGame.classList.remove('hidden');
    engine.startIssue(selectedIssueId);
  });

  const shopUI = new ShopUI(modalShopEl, engine, () => {
    renderIssueCarousel();
  });

  const highScoresUI = new HighScoresUI(modalHighscoresEl, engine);

  const newspaperUI = new NewspaperUI(modalNewspaperEl, engine, {
    onNextIssue: (nextId) => {
      selectedIssueId = nextId;
      launchIssue(nextId);
    },
    onRetry: () => {
      launchIssue(selectedIssueId);
    },
    onShop: () => {
      shopUI.show();
    },
    onTitle: () => {
      showTitleScreen();
    }
  });

  // State change notification from engine
  engine.onStateChange = (state, data) => {
    if (state === 'WIN') {
      newspaperUI.showVictory(data);
    } else if (state === 'GAMEOVER') {
      newspaperUI.showGameOver(data);
    }
  };

  // --- AUDIO SETUP ---
  const updateAudioLabels = () => {
    const s = storage.getAudioSettings();
    labelSoundState.textContent = s.sound ? 'ON' : 'OFF';
    labelMusicState.textContent = s.music ? 'ON' : 'OFF';
    soundEngine.setSoundEnabled(s.sound);
    soundEngine.setMusicEnabled(s.music);
  };

  updateAudioLabels();

  const unlockAudioContext = () => {
    soundEngine.ensureContext();
    audioPromptBanner.classList.add('hidden');
    window.removeEventListener('click', unlockAudioContext);
    window.removeEventListener('keydown', unlockAudioContext);
  };
  window.addEventListener('click', unlockAudioContext);
  window.addEventListener('keydown', unlockAudioContext);

  btnToggleSound.addEventListener('click', () => {
    const curr = storage.getAudioSettings().sound;
    storage.setAudioSetting('sound', !curr);
    updateAudioLabels();
    soundEngine.playClick();
  });

  btnToggleMusic.addEventListener('click', () => {
    const curr = storage.getAudioSettings().music;
    storage.setAudioSetting('music', !curr);
    updateAudioLabels();
    soundEngine.playClick();
  });

  // --- ISSUE SELECTOR CAROUSEL ---
  function renderIssueCarousel() {
    const unlocked = storage.getUnlockedIssue();
    const highScores = storage.data.highScores;
    const grades = storage.data.issueGrades;

    let html = '';

    ISSUES.forEach(issue => {
      const isUnlocked = issue.id <= unlocked;
      const isSelected = issue.id === selectedIssueId;
      const score = highScores[issue.id] || 0;
      const grade = grades[issue.id] || null;

      html += `
        <div class="issue-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}" data-issue-id="${issue.id}">
          <div class="issue-badge-num">ISSUE #${issue.id}</div>
          <div class="issue-card-title">${issue.title.replace('Issue #' + issue.id + ': ', '')}</div>
          <div class="issue-card-stars">
            ${isUnlocked ? (grade ? `★ GRADE ${grade}` : 'AVAILABLE') : '🔒 LOCKED'}
          </div>
          ${score > 0 ? `<div style="font-size: 11px; margin-top: 4px; font-weight: 700;">${score.toLocaleString()} pts</div>` : ''}
        </div>
      `;
    });

    // Endless Mode Card
    const isEndlessSelected = selectedIssueId === 'endless';
    const endlessScore = highScores['endless'] || 0;
    html += `
      <div class="issue-card ${isEndlessSelected ? 'selected' : ''}" data-issue-id="endless">
        <div class="issue-badge-num" style="background:#ff4081; color:#fff;">SPECIAL</div>
        <div class="issue-card-title">Overtime Frenzy</div>
        <div class="issue-card-stars">⭐ ENDLESS</div>
        ${endlessScore > 0 ? `<div style="font-size: 11px; margin-top: 4px; font-weight: 700;">${endlessScore.toLocaleString()} pts</div>` : ''}
      </div>
    `;

    issueCarouselContainer.innerHTML = html;

    // Attach click events
    issueCarouselContainer.querySelectorAll('.issue-card').forEach(card => {
      card.addEventListener('click', (e) => {
        soundEngine.playClick();
        const idStr = card.getAttribute('data-issue-id');
        const id = idStr === 'endless' ? 'endless' : parseInt(idStr, 10);
        if (id !== 'endless' && id > storage.getUnlockedIssue()) {
          soundEngine.playOops();
          return;
        }
        selectedIssueId = id;
        renderIssueCarousel();
      });
    });
  }

  renderIssueCarousel();

  // --- SCREEN NAVIGATION ---
  function showTitleScreen() {
    engine.gameState = 'TITLE';
    engine.soundEngine.stopBgm();
    screenGame.classList.add('hidden');
    screenTitle.classList.remove('hidden');
    renderIssueCarousel();
  }

  function launchIssue(issueId) {
    soundEngine.playClick();
    if (issueId === 'endless') {
      screenTitle.classList.add('hidden');
      screenGame.classList.remove('hidden');
      engine.startIssue('endless');
      return;
    }

    const issueConfig = ISSUES.find(i => i.id === issueId) || ISSUES[0];
    // Show comic cutscene before shift
    cutsceneViewer.show(issueConfig);
  }

  btnPlaySelected.addEventListener('click', () => {
    launchIssue(selectedIssueId);
  });

  btnOpenShop.addEventListener('click', () => {
    soundEngine.playClick();
    shopUI.show();
  });

  btnOpenManual.addEventListener('click', () => {
    soundEngine.playClick();
    modalManual.classList.remove('hidden');
  });

  btnCloseManual.addEventListener('click', () => {
    soundEngine.playClick();
    modalManual.classList.add('hidden');
  });

  btnOpenHighscores.addEventListener('click', () => {
    soundEngine.playClick();
    highScoresUI.show();
  });

  // --- PAUSE MENU ---
  btnPauseGame.addEventListener('click', () => {
    if (engine.gameState === 'PLAYING') {
      engine.gameState = 'PAUSED';
      soundEngine.stopBgm();
      modalPause.classList.remove('hidden');
    }
  });

  btnResumeGame.addEventListener('click', () => {
    soundEngine.playClick();
    modalPause.classList.add('hidden');
    engine.gameState = 'PLAYING';
    if (storage.data.audio.music) {
      soundEngine.startBgm();
    }
  });

  btnPauseShop.addEventListener('click', () => {
    soundEngine.playClick();
    modalPause.classList.add('hidden');
    shopUI.show();
  });

  btnRestartShift.addEventListener('click', () => {
    soundEngine.playClick();
    modalPause.classList.add('hidden');
    engine.startIssue(selectedIssueId);
  });

  btnQuitToTitle.addEventListener('click', () => {
    soundEngine.playClick();
    modalPause.classList.add('hidden');
    showTitleScreen();
  });

  // --- TOOL BELT SELECTION ---
  function selectTool(toolKey) {
    engine.selectedTool = toolKey;
    toolButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tool') === toolKey);
    });
    soundEngine.playClick();
  }

  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      selectTool(tool);
    });
  });

  // --- KEYBOARD CONTROLS ---
  window.addEventListener('keydown', (e) => {
    engine.input.keys[e.code] = true;
    if (e.key) {
      engine.input.keys[e.key] = true;
      engine.input.keys[e.key.toLowerCase()] = true;
    }

    // Hotkeys 1-5 for tools
    if (e.key === '1') selectTool('tape');
    if (e.key === '2') selectTool('juice');
    if (e.key === '3') selectTool('broom');
    if (e.key === '4') selectTool('wrench');
    if (e.key === '5') selectTool('megaphone');

    // Pause toggle on Escape or P
    if (e.code === 'Escape' || e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
      if (engine.gameState === 'PLAYING') {
        engine.gameState = 'PAUSED';
        soundEngine.stopBgm();
        modalPause.classList.remove('hidden');
      } else if (engine.gameState === 'PAUSED') {
        soundEngine.playClick();
        modalPause.classList.add('hidden');
        engine.gameState = 'PLAYING';
        if (storage.data.audio.music) {
          soundEngine.startBgm();
        }
      }
    }

    // Back / Close keys: Escape, Backspace close active modals
    if (e.code === 'Escape' || e.key === 'Escape' || e.code === 'Backspace') {
      if (!modalManual.classList.contains('hidden')) {
        modalManual.classList.add('hidden');
      }
      if (!modalShopEl.classList.contains('hidden')) {
        shopUI.hide();
      }
      if (!modalHighscoresEl.classList.contains('hidden')) {
        highScoresUI.hide();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    engine.input.keys[e.code] = false;
    if (e.key) {
      engine.input.keys[e.key] = false;
      engine.input.keys[e.key.toLowerCase()] = false;
    }
  });

  // --- POINTER / MOUSE / TOUCH INTERACTIONS ON CANVAS ---
  let lastPointerPos = { x: 0, y: 0, time: 0 };
  let pointerVelocity = { vx: 0, vy: 0 };

  function getCanvasWorldCoords(evt) {
    const rect = canvas.getBoundingClientRect();
    const touch = evt.touches && evt.touches.length > 0 ? evt.touches[0] : (evt.changedTouches ? evt.changedTouches[0] : null);
    const clientX = touch ? touch.clientX : evt.clientX;
    const clientY = touch ? touch.clientY : evt.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const screenX = (clientX - rect.left) * scaleX;
    const screenY = (clientY - rect.top) * scaleY;

    const worldX = screenX + engine.cameraX;
    const worldY = screenY + engine.cameraY;

    return { worldX, worldY, screenX, screenY };
  }

  function handlePointerDown(evt) {
    if (engine.gameState !== 'PLAYING') return;

    const { worldX, worldY } = getCanvasWorldCoords(evt);
    engine.input.pointer.isDown = true;
    engine.input.pointer.worldX = worldX;
    engine.input.pointer.worldY = worldY;
    lastPointerPos = { x: worldX, y: worldY, time: performance.now() };

    // 1. Check if clicking/dragging debris directly
    if (engine.hazardManager.startDebrisDrag(worldX, worldY)) {
      return;
    }

    // 2. Megaphone triggers immediately anywhere
    if (engine.selectedTool === 'megaphone') {
      engine.hazardManager.interactAt(worldX, worldY, 'megaphone');
      return;
    }

    // 3. Check if clicking a hazard directly
    const targetHazard = engine.hazardManager.getHazardAt(worldX, worldY);
    const distToSidekick = Math.abs(engine.sidekick.x - worldX);
    const reach = engine.sidekick.reachRadius;

    if (distToSidekick <= reach) {
      // Within reach: fix immediately!
      const handled = engine.hazardManager.interactAt(worldX, worldY, engine.selectedTool);
      if (!handled) {
        engine.sidekick.moveTo(worldX);
      }
    } else if (targetHazard) {
      // Outside reach but clicked a damaged object: command Budge to sprint over and auto-repair!
      engine.sidekick.moveTo(targetHazard.x, () => {
        engine.hazardManager.interactAt(targetHazard.x, targetHazard.y, engine.selectedTool);
      });
    } else {
      // Clicked empty pavement: move Budge there
      engine.sidekick.moveTo(worldX);
    }
  }

  function handlePointerMove(evt) {
    if (!engine.input.pointer.isDown || engine.gameState !== 'PLAYING') return;
    const { worldX, worldY } = getCanvasWorldCoords(evt);
    engine.input.pointer.worldX = worldX;
    engine.input.pointer.worldY = worldY;

    // Track fling velocity for debris throwing
    const now = performance.now();
    const dt = (now - lastPointerPos.time) / 1000;
    if (dt > 0.01) {
      pointerVelocity.vx = (worldX - lastPointerPos.x) / dt;
      pointerVelocity.vy = (worldY - lastPointerPos.y) / dt;
      lastPointerPos = { x: worldX, y: worldY, time: now };
    }

    // Dragging debris
    if (engine.hazardManager.draggedDebris) {
      engine.hazardManager.updateDebrisDrag(worldX, worldY);
      return;
    }

    // Continuous spraying with juice or sweeping with broom within reach
    if (engine.selectedTool === 'juice' || engine.selectedTool === 'broom') {
      const dist = Math.abs(engine.sidekick.x - worldX);
      if (dist <= engine.sidekick.reachRadius + 40) {
        engine.hazardManager.interactAt(worldX, worldY, engine.selectedTool);
      }
    }
  }

  function handlePointerUp() {
    engine.input.pointer.isDown = false;
    // Release debris with fling velocity
    if (engine.hazardManager.draggedDebris) {
      const throwVx = Math.max(-400, Math.min(400, pointerVelocity.vx * 0.7));
      const throwVy = Math.max(-400, Math.min(200, pointerVelocity.vy * 0.7));
      engine.hazardManager.endDebrisDrag(throwVx, throwVy);
    }
  }

  canvas.addEventListener('mousedown', handlePointerDown);
  canvas.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerUp);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handlePointerDown(e);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handlePointerMove(e);
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    handlePointerUp();
  });
  window.addEventListener('touchcancel', (e) => {
    handlePointerUp();
  });

  // --- HUD REFRESH INTERVAL ---
  function updateHUD() {
    if (engine.gameState === 'PLAYING') {
      // Issue Name
      hudIssueTitle.textContent = engine.isEndless ? 'Endless Overtime' : `Issue #${engine.currentIssueId}`;

      // Approval meter
      const approval = Math.round(engine.approvalRating);
      hudApprovalPercent.textContent = `${approval}%`;
      hudApprovalFill.style.width = `${approval}%`;

      // Warning color if in danger
      if (approval < 40) {
        hudApprovalFill.style.background = '#ff1744';
        hudApprovalFill.parentElement.classList.add('pulse-glow');
      } else {
        hudApprovalFill.style.background = 'linear-gradient(90deg, #ff1744 0%, #ffea00 45%, #00e676 100%)';
        hudApprovalFill.parentElement.classList.remove('pulse-glow');
      }

      // Wage & Score
      hudEarningsVal.textContent = `$${engine.shiftEarnings.toFixed(2)}`;
      hudScoreVal.textContent = engine.score.toLocaleString();

      // Timer
      if (engine.isEndless) {
        hudTimeVal.textContent = `${Math.floor(engine.elapsedTime || 0)}s OT`;
      } else {
        hudTimeVal.textContent = `${Math.ceil(engine.shiftTimeRemaining)}s`;
      }

      // Breaking news ticker
      if (hudTickerText.textContent !== engine.breakingNewsTicker) {
        hudTickerText.textContent = engine.breakingNewsTicker;
      }
    }

    requestAnimationFrame(updateHUD);
  }

  // Start engine loops
  engine.startLoop();
  requestAnimationFrame(updateHUD);
});
