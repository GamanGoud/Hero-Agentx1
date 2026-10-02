// Core Game Engine: Loop, Parallax Comic Renderer, Camera, State Orchestration

import { soundEngine } from '../audio/SoundSynthesizer.js';
import { storage } from './Storage.js';
import { ISSUES, ENDLESS_MODE_CONFIG } from './Levels.js';
import { Sidekick } from './Sidekick.js';
import { HeroAndVillain } from './HeroAndVillain.js';
import { NewsChopper } from './NewsChopper.js';
import { HazardManager } from './HazardManager.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.soundEngine = soundEngine;
    this.storage = storage;

    this.worldWidth = 1600;
    this.worldHeight = 600;

    // Subsystems
    this.sidekick = new Sidekick(this);
    this.heroAndVillain = new HeroAndVillain(this);
    this.newsChopper = new NewsChopper(this);
    this.hazardManager = new HazardManager(this);

    // Camera
    this.cameraX = 0;
    this.cameraY = 0;

    // Game loop timing
    this.lastTime = 0;
    this.isRunning = false;
    this.gameState = 'TITLE'; // 'TITLE', 'CUTSCENE', 'PLAYING', 'PAUSED', 'WIN', 'GAMEOVER', 'SHOP'

    // Shift / Issue state
    this.currentIssueId = 1;
    this.currentLevelConfig = null;
    this.isEndless = false;
    this.elapsedTime = 0;

    this.shiftTimeRemaining = 60;
    this.approvalRating = 100; // 0 to 100
    this.shiftEarnings = 0;
    this.score = 0;
    this.repairsCount = 0;
    this.comboStreak = 0;

    this.selectedTool = 'tape'; // 'tape', 'juice', 'broom', 'wrench', 'megaphone'
    this.screenShake = 0;

    // Visual effects
    this.attackEffects = [];
    this.breakingNewsTicker = "CAPTAIN CALAMITY PATROLS METRO CITY! MINIMUM-WAGE SIDEKICK REPORTEDLY PUSHING BROOM.";
    this.newsTickerTimer = 0;

    // Input state
    this.input = {
      keys: {},
      pointer: {
        x: 0,
        y: 0,
        worldX: 0,
        worldY: 0,
        isDown: false
      }
    };

    // Halftone canvas pattern cache
    this.halftonePattern = null;
    this.createHalftonePattern();
  }

  createHalftonePattern() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 8;
    pCanvas.height = 8;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.055)';
    pCtx.beginPath();
    pCtx.arc(4, 4, 1.6, 0, Math.PI * 2);
    pCtx.fill();
    this.halftonePattern = this.ctx.createPattern(pCanvas, 'repeat');
  }

  setBreakingNews(text) {
    this.breakingNewsTicker = text;
    this.newsTickerTimer = 6.0;
  }

  changeApprovalRating(delta) {
    const prev = this.approvalRating;
    this.approvalRating = Math.max(0, Math.min(100, this.approvalRating + delta));

    // Screen shake if large negative impact
    if (delta <= -10) {
      this.screenShake = 12;
    }

    // Music panic mode
    this.soundEngine.setPanicMode(this.approvalRating < 40);

    // Check game over
    if (this.approvalRating <= 0 && this.gameState === 'PLAYING') {
      this.triggerGameOver();
    }
  }

  addTips(amount) {
    this.shiftEarnings += amount;
    this.storage.addFunds(amount);
  }

  onHazardRepaired(hazard) {
    this.repairsCount++;
    this.comboStreak++;
    const bonusMultiplier = Math.min(4, 1 + Math.floor(this.comboStreak / 3) * 0.5);
    const earnedScore = Math.floor(150 * bonusMultiplier);
    this.score += earnedScore;

    const tip = 2.00 * bonusMultiplier;
    this.addTips(tip);
    this.changeApprovalRating(8);

    // Record to storage stats
    this.storage.recordStats({
      totalRepairs: 1,
      firesPutOut: hazard.type === 'fire' ? 1 : 0,
      windowsTaped: hazard.type === 'window' ? 1 : 0,
      debrisSwept: hazard.type === 'debris' ? 1 : 0
    });
  }

  spawnComicText(worldX, worldY, text, color = '#ffd600', bgColor = '#ff1744') {
    this.ctx.font = 'bold 22px "Bangers", cursive';
    const textWidth = this.ctx.measureText(text).width;

    this.hazardManager.comicPopups.push({
      x: worldX,
      y: worldY,
      vy: -60,
      text: text,
      textWidth: textWidth,
      color: color,
      bgColor: bgColor,
      scale: 0.2,
      targetScale: 1.0,
      angle: (Math.random() - 0.5) * 0.35,
      timer: 0,
      duration: 1.2
    });
  }

  spawnAttackEffect(eff) {
    this.attackEffects.push({
      ...eff,
      timer: 0.35,
      maxTimer: 0.35
    });
    this.screenShake = 8;
  }

  // --- ISSUE SETUP & FLOW ---

  startIssue(issueId) {
    this.isEndless = (issueId === 'endless');
    this.currentIssueId = issueId;
    this.currentLevelConfig = this.isEndless ? ENDLESS_MODE_CONFIG : ISSUES.find(i => i.id === issueId) || ISSUES[0];

    this.shiftTimeRemaining = this.isEndless ? 999999 : this.currentLevelConfig.duration;
    this.approvalRating = 85; // Starting approval
    this.shiftEarnings = 0;
    this.score = 0;
    this.repairsCount = 0;
    this.comboStreak = 0;
    this.screenShake = 0;
    this.selectedTool = 'tape';
    this.elapsedTime = 0;

    // Subsystem resets
    this.sidekick.reset(200, 480);
    this.sidekick.applyUpgrades(this.storage.data.upgrades);
    this.heroAndVillain.reset();
    this.newsChopper.reset();
    this.hazardManager.reset();

    this.gameState = 'PLAYING';
    this.soundEngine.setPanicMode(false);
    if (this.storage.data.audio.music) {
      this.soundEngine.startBgm();
    }
  }

  triggerVictory() {
    this.gameState = 'WIN';
    this.soundEngine.stopBgm();
    this.soundEngine.playWin();

    // Grade calculation based on approval rating
    let grade = 'C';
    if (this.approvalRating >= 90) grade = 'S';
    else if (this.approvalRating >= 78) grade = 'A';
    else if (this.approvalRating >= 60) grade = 'B';

    // Save issue progress
    if (!this.isEndless) {
      this.storage.recordIssueScore(this.currentIssueId, this.score, grade);
      this.storage.unlockNextIssue(this.currentIssueId + 1);
    } else {
      this.storage.recordIssueScore('endless', this.score, 'S');
    }

    if (this.onStateChange) this.onStateChange('WIN', {
      grade,
      score: this.score,
      approval: this.approvalRating,
      earnings: this.shiftEarnings,
      repairs: this.repairsCount
    });
  }

  triggerGameOver() {
    this.gameState = 'GAMEOVER';
    this.soundEngine.stopBgm();
    this.soundEngine.playLose();

    if (this.onStateChange) this.onStateChange('GAMEOVER', {
      score: this.score,
      repairs: this.repairsCount,
      earnings: this.shiftEarnings
    });
  }

  // --- LOOP & UPDATE ---

  startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.tick(t));
  }

  tick(time) {
    if (!this.isRunning) return;

    let dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Clamp dt to avoid massive physics jumps
    if (dt > 0.1) dt = 0.1;

    if (this.gameState === 'PLAYING') {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame((t) => this.tick(t));
  }

  update(dt) {
    this.elapsedTime = (this.elapsedTime || 0) + dt;

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Shift timer
    if (!this.isEndless) {
      this.shiftTimeRemaining -= dt;
      if (this.shiftTimeRemaining <= 0) {
        this.shiftTimeRemaining = 0;
        // Check if approval meets issue requirements
        if (this.approvalRating >= this.currentLevelConfig.minApproval) {
          this.triggerVictory();
          return;
        } else {
          this.triggerGameOver();
          return;
        }
      }
    }

    // Wage ticker accumulation
    const wageSec = (this.currentLevelConfig?.wageRate || 15.00) / 3600;
    this.shiftEarnings += wageSec * dt;

    // Gradual passive approval decay if hazards are neglected
    const unfixedCount = this.hazardManager.hazards.filter(h => !h.isRepaired).length;
    if (unfixedCount > 0) {
      this.changeApprovalRating(-dt * (0.8 * unfixedCount));
    }

    // Update entities
    this.sidekick.update(dt, this.input);
    this.heroAndVillain.update(dt);
    this.newsChopper.update(dt);
    this.hazardManager.update(dt);

    // Update attack laser effects
    for (let i = this.attackEffects.length - 1; i >= 0; i--) {
      const eff = this.attackEffects[i];
      eff.timer -= dt;
      if (eff.timer <= 0) {
        this.attackEffects.splice(i, 1);
      }
    }

    // Camera follow sidekick with smooth lerp
    const targetCamX = this.sidekick.x - this.worldWidth * 0.45;
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    // Clamp camera
    const maxCamX = this.worldWidth - this.canvas.width;
    if (this.cameraX < 0) this.cameraX = 0;
    if (this.cameraX > maxCamX) this.cameraX = maxCamX;
  }

  // --- RENDER & COMIC AESTHETICS ---

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Screen shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Background sky gradient
    const skyColor = this.currentLevelConfig ? this.currentLevelConfig.skyColor : '#58b6ff';
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, skyColor);
    bgGrad.addColorStop(0.7, '#ffffff');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Parallax background layers
    this.drawParallaxCity(ctx);

    // Translate for game camera
    ctx.save();
    ctx.translate(-this.cameraX, -this.cameraY);

    // Ground / Sidewalk
    this.drawStreetAndBuildings(ctx);

    // Draw Hazards & Debris
    this.hazardManager.draw(ctx);

    // Draw Laser attacks from Captain Calamity
    this.drawAttackEffects(ctx);

    // Draw Player Sidekick
    this.sidekick.draw(ctx);

    // Draw Hero & Villain Dogfight
    this.heroAndVillain.draw(ctx);

    // Draw News Chopper & Spotlight
    this.newsChopper.draw(ctx);

    ctx.restore();

    // Halftone comic dot overlay
    if (this.halftonePattern) {
      ctx.fillStyle = this.halftonePattern;
      ctx.fillRect(0, 0, w, h);
    }

    // Comic Book Border (Bold Black Edge with Slanted Angles)
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(4, 4, w - 8, h - 8);

    ctx.restore();
  }

  drawParallaxCity(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const theme = this.currentLevelConfig ? this.currentLevelConfig.theme : 'downtown';

    if (theme === 'suburbia') {
      // Rolling green hills in the distance
      const hillOffset = -(this.cameraX * 0.1) % 360;
      ctx.fillStyle = '#81c784';
      ctx.beginPath();
      ctx.moveTo(-360 + hillOffset, 320);
      for (let x = -360 + hillOffset; x < w + 360; x += 120) {
        ctx.quadraticCurveTo(x + 60, 240, x + 120, 320);
      }
      ctx.lineTo(w + 360, 320);
      ctx.lineTo(-360 + hillOffset, 320);
      ctx.closePath();
      ctx.fill();

      // Fluffy suburban trees & pitched roofs
      const treeOffset = -(this.cameraX * 0.25) % 240;
      for (let x = -240 + treeOffset; x < w + 240; x += 80) {
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(x + 25, 270, 30, 0, Math.PI * 2);
        ctx.fill();
        // Roof gable
        ctx.fillStyle = '#d32f2f';
        ctx.beginPath();
        ctx.moveTo(x + 40, 275);
        ctx.lineTo(x + 75, 235);
        ctx.lineTo(x + 110, 275);
        ctx.closePath();
        ctx.fill();
      }
    } else if (theme === 'boardwalk') {
      // Ocean horizon & waves
      ctx.fillStyle = '#0288d1';
      ctx.fillRect(0, 220, w, 80);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const waveOffset = -(this.cameraX * 0.1) % 80;
      for (let x = -80 + waveOffset; x < w + 80; x += 40) {
        ctx.beginPath();
        ctx.arc(x, 260, 16, 0, Math.PI);
        ctx.fill();
      }

      // Distant rotating Ferris Wheel & Carnival tents
      const pierOffset = -(this.cameraX * 0.2) % 400;
      const fWheelX = 350 + pierOffset;
      const fWheelY = 190;
      ctx.strokeStyle = 'rgba(255, 214, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fWheelX, fWheelY, 55, 0, Math.PI * 2);
      ctx.stroke();
      const rot = (this.elapsedTime || 0) * 0.5;
      for (let a = 0; a < 8; a++) {
        const ang = rot + (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(fWheelX, fWheelY);
        ctx.lineTo(fWheelX + Math.cos(ang) * 55, fWheelY + Math.sin(ang) * 55);
        ctx.stroke();
      }

      // Striped Carnival Big-Top Tent peaks
      [-200, 100, 480, 750].forEach(tx => {
        const cx = tx + pierOffset;
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.moveTo(cx, 280);
        ctx.lineTo(cx + 45, 220);
        ctx.lineTo(cx + 90, 280);
        ctx.closePath();
        ctx.fill();
      });
    } else if (theme === 'industrial') {
      // Factory Smokestacks puffing steam
      const indOffset = -(this.cameraX * 0.18) % 280;
      ctx.fillStyle = '#455a64';
      for (let x = -280 + indOffset; x < w + 280; x += 140) {
        ctx.fillRect(x, 180, 38, 120);
        // Smokestack bands
        ctx.fillStyle = '#ff5722';
        ctx.fillRect(x, 195, 38, 8);
        ctx.fillStyle = '#455a64';
        // Steam clouds
        ctx.fillStyle = 'rgba(236, 239, 241, 0.5)';
        const puff = Math.sin((this.elapsedTime || 0) * 4 + x) * 6;
        ctx.beginPath();
        ctx.arc(x + 19, 160 + puff, 16, 0, Math.PI * 2);
        ctx.arc(x + 30, 145 + puff, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#455a64';
      }

      // High voltage transmission towers
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 3;
      for (let x = -100 + indOffset; x < w + 280; x += 220) {
        ctx.beginPath();
        ctx.moveTo(x + 30, 290);
        ctx.lineTo(x + 60, 180);
        ctx.lineTo(x + 90, 290);
        ctx.moveTo(x + 40, 230);
        ctx.lineTo(x + 80, 230);
        ctx.moveTo(x + 48, 205);
        ctx.lineTo(x + 72, 205);
        ctx.stroke();
      }
    } else if (theme === 'rooftop') {
      // Midnight skyline with glowing golden office windows
      const roofOffset = -(this.cameraX * 0.2) % 260;
      ctx.fillStyle = '#0d1b2a';
      for (let x = -260 + roofOffset; x < w + 260; x += 85) {
        const bH = 200 + Math.sin(x * 0.08) * 60;
        ctx.fillRect(x, 300 - bH * 0.6, 75, bH);
        // Yellow office windows
        ctx.fillStyle = 'rgba(255, 214, 0, 0.6)';
        for (let wy = 300 - bH * 0.6 + 12; wy < 280; wy += 20) {
          for (let wx = x + 10; wx < x + 65; wx += 16) {
            if ((wx + wy) % 3 === 0) ctx.fillRect(wx, wy, 8, 10);
          }
        }
        ctx.fillStyle = '#0d1b2a';
      }

      // Moon in the sky
      ctx.fillStyle = '#fff9c4';
      ctx.beginPath();
      ctx.arc(w - 140, 80, 36, 0, Math.PI * 2);
      ctx.fill();

      // Sky Searchlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      const sAngle = Math.sin((this.elapsedTime || 0) * 1.5) * 0.35;
      ctx.beginPath();
      ctx.moveTo(180, 300);
      ctx.lineTo(260 + sAngle * 250, 0);
      ctx.lineTo(320 + sAngle * 250, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Downtown Far Skyline
      const farOffset = -(this.cameraX * 0.15) % 240;
      ctx.fillStyle = '#b0bec5';
      for (let x = -240 + farOffset; x < w + 240; x += 90) {
        const bH = 180 + Math.sin(x * 0.05) * 50;
        ctx.fillRect(x, 260 - bH * 0.4, 75, bH);
      }

      // Midground Buildings
      const midOffset = -(this.cameraX * 0.35) % 320;
      ctx.fillStyle = '#78909c';
      for (let x = -320 + midOffset; x < w + 320; x += 110) {
        const bH = 220 + Math.cos(x * 0.04) * 60;
        ctx.fillRect(x, 320 - bH * 0.5, 95, bH);
        ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
        for (let wy = 320 - bH * 0.5 + 15; wy < 320; wy += 22) {
          for (let wx = x + 10; wx < x + 85; wx += 18) {
            ctx.fillRect(wx, wy, 8, 10);
          }
        }
        ctx.fillStyle = '#78909c';
      }
    }
  }

  drawStreetAndBuildings(ctx) {
    const groundY = 480;
    const totalW = this.worldWidth;
    const theme = this.currentLevelConfig ? this.currentLevelConfig.theme : 'downtown';

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';

    if (theme === 'suburbia') {
      // Suburban homes and picket fences
      for (let x = 0; x < totalW; x += 260) {
        // House wall
        ctx.fillStyle = (x / 260) % 2 === 0 ? '#fff9c4' : '#e1f5fe';
        ctx.fillRect(x, 290, 245, 190);
        ctx.strokeRect(x, 290, 245, 190);

        // Pitched roof gable
        ctx.fillStyle = '#b71c1c';
        ctx.beginPath();
        ctx.moveTo(x - 10, 290);
        ctx.lineTo(x + 122, 230);
        ctx.lineTo(x + 255, 290);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Suburban Signboard
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(x + 20, 295, 205, 26);
        ctx.strokeRect(x + 20, 295, 205, 26);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 13px "Bangers", cursive';
        ctx.textAlign = 'center';
        const subSigns = ['HIGGINS HYDRANGEAS', 'BARBECUE PIT', 'MAPLE GROVE HOA', 'GNOME HAVEN', 'GARDEN ESTATE'];
        ctx.fillText(subSigns[(x / 260) % subSigns.length], x + 122, 312);

        // White picket fence
        ctx.fillStyle = '#ffffff';
        for (let fx = x + 10; fx < x + 235; fx += 18) {
          ctx.fillRect(fx, 430, 10, 50);
          ctx.strokeRect(fx, 430, 10, 50);
        }
      }

      // Red brick paver sidewalk
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(0, groundY - 8, totalW, 40);
      ctx.strokeRect(0, groundY - 8, totalW, 40);
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 1.5;
      for (let bx = 0; bx < totalW; bx += 22) {
        ctx.beginPath();
        ctx.moveTo(bx, groundY - 8);
        ctx.lineTo(bx, groundY + 32);
        ctx.stroke();
      }
    } else if (theme === 'boardwalk') {
      // Pier concession shacks
      for (let x = 0; x < totalW; x += 260) {
        ctx.fillStyle = (x / 260) % 2 === 0 ? '#ffccbc' : '#b2dfdb';
        ctx.fillRect(x, 280, 245, 200);
        ctx.strokeRect(x, 280, 245, 200);

        // Carnival striped awning
        ctx.fillStyle = (x / 260) % 2 === 0 ? '#e91e63' : '#ff9800';
        ctx.fillRect(x, 270, 245, 24);
        ctx.strokeRect(x, 270, 245, 24);

        // Neon Signboard
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(x + 15, 235, 215, 30);
        ctx.strokeRect(x + 15, 235, 215, 30);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px "Bangers", cursive';
        ctx.textAlign = 'center';
        const pierSigns = ['SALTWATER TAFFY', 'CORNDOG PALACE', 'FUNHOUSE ARCADE', 'COTTON CANDY', 'RING TOSS 25¢'];
        ctx.fillText(pierSigns[(x / 260) % pierSigns.length], x + 122, 255);
      }

      // Weathered wood boardwalk planks
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, groundY - 8, totalW, 40);
      ctx.strokeRect(0, groundY - 8, totalW, 40);
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 2.5;
      for (let px = 0; px < totalW; px += 35) {
        ctx.beginPath();
        ctx.moveTo(px, groundY - 8);
        ctx.lineTo(px, groundY + 32);
        ctx.stroke();
        // Planks nail dots
        ctx.fillStyle = '#212121';
        ctx.fillRect(px + 4, groundY - 2, 3, 3);
        ctx.fillRect(px + 4, groundY + 26, 3, 3);
      }
    } else if (theme === 'industrial') {
      // Industrial factory blocks & caution stripes
      for (let x = 0; x < totalW; x += 260) {
        ctx.fillStyle = '#546e7a';
        ctx.fillRect(x, 270, 245, 210);
        ctx.strokeRect(x, 270, 245, 210);

        // Hazard Chevron Stripes (Yellow/Black)
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(x, 260, 245, 18);
        ctx.strokeRect(x, 260, 245, 18);
        ctx.fillStyle = '#000000';
        for (let chx = x; chx < x + 245; chx += 24) {
          ctx.beginPath();
          ctx.moveTo(chx, 260);
          ctx.lineTo(chx + 12, 260);
          ctx.lineTo(chx, 278);
          ctx.closePath();
          ctx.fill();
        }

        // Metal Warning Signboard
        ctx.fillStyle = '#ff3d00';
        ctx.fillRect(x + 20, 226, 205, 30);
        ctx.strokeRect(x + 20, 226, 205, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Bangers", cursive';
        ctx.textAlign = 'center';
        const indSigns = ['VALVE: DO NOT KICK', 'CHEMICAL TANK #9', 'HIGH VOLTAGE GRID', 'MOLTEN FOUNDRY', 'ACID VATS AREA'];
        ctx.fillText(indSigns[(x / 260) % indSigns.length], x + 122, 246);

        // Steam pipes along wall
        ctx.strokeStyle = '#78909c';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x, 340);
        ctx.lineTo(x + 245, 340);
        ctx.stroke();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 336, 245, 8);
      }

      // Steel diamond plate sidewalk
      ctx.fillStyle = '#90a4ae';
      ctx.fillRect(0, groundY - 8, totalW, 40);
      ctx.strokeRect(0, groundY - 8, totalW, 40);
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 2;
      for (let sx = 0; sx < totalW; sx += 40) {
        ctx.beginPath();
        ctx.moveTo(sx, groundY - 8);
        ctx.lineTo(sx + 20, groundY + 32);
        ctx.moveTo(sx + 20, groundY - 8);
        ctx.lineTo(sx, groundY + 32);
        ctx.stroke();
      }
    } else if (theme === 'rooftop') {
      // Rooftop penthouses & mechanical rooms
      for (let x = 0; x < totalW; x += 260) {
        ctx.fillStyle = '#37474f';
        ctx.fillRect(x, 290, 245, 190);
        ctx.strokeRect(x, 290, 245, 190);

        // AC Ventilation ducts
        ctx.fillStyle = '#cfd8dc';
        ctx.fillRect(x + 15, 320, 80, 50);
        ctx.strokeRect(x + 15, 320, 80, 50);
        // Fan grill
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 55, 345, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Rooftop Billboard Signboard
        ctx.fillStyle = '#ffd600';
        ctx.fillRect(x + 20, 240, 205, 32);
        ctx.strokeRect(x + 20, 240, 205, 32);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 15px "Bangers", cursive';
        ctx.textAlign = 'center';
        const roofSigns = ['MEGA-CORP TOWER', 'ACTION 9 HELIPAD', 'SKYLINE FINALE', 'CALAMITY CLASH', 'CITY VIEW PENTHOUSE'];
        ctx.fillText(roofSigns[(x / 260) % roofSigns.length], x + 122, 261);
      }

      // Rooftop Parapet / Coping gravel ledge
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(0, groundY - 8, totalW, 40);
      ctx.strokeRect(0, groundY - 8, totalW, 40);

      // Helipad "H" painted at world center
      const hpx = totalW * 0.5;
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(hpx, groundY + 12, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffd600';
      ctx.font = 'bold 22px "Bangers", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', hpx, groundY + 12);
    } else {
      // Classic Downtown Storefronts
      for (let x = 0; x < totalW; x += 260) {
        ctx.fillStyle = (x / 260) % 2 === 0 ? '#eceff1' : '#ffe0b2';
        ctx.fillRect(x, 280, 250, 200);
        ctx.strokeRect(x, 280, 250, 200);

        ctx.fillStyle = (x / 260) % 2 === 0 ? '#e53935' : '#1e88e5';
        ctx.fillRect(x, 270, 250, 24);
        ctx.strokeRect(x, 270, 250, 24);

        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(x + 20, 236, 210, 28);
        ctx.strokeRect(x + 20, 236, 210, 28);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px "Bangers", cursive';
        ctx.textAlign = 'center';
        const signs = ['BAKERY DELIGHT', 'DAILY NEWS STAND', 'METRO JEWELRY', 'HERO SOUVENIRS', 'SMASH TACOS', 'CHAD 9 STUDIOS'];
        ctx.fillText(signs[(x / 260) % signs.length], x + 125, 255);
      }

      // Concrete Sidewalk
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(0, groundY - 8, totalW, 40);
      ctx.strokeRect(0, groundY - 8, totalW, 40);
      ctx.strokeStyle = '#90a4ae';
      ctx.lineWidth = 2;
      for (let sx = 0; sx < totalW; sx += 70) {
        ctx.beginPath();
        ctx.moveTo(sx, groundY - 8);
        ctx.lineTo(sx - 15, groundY + 32);
        ctx.stroke();
      }
    }

    // Street Asphalt Road
    const roadColor = this.currentLevelConfig ? this.currentLevelConfig.roadColor : '#37474f';
    ctx.fillStyle = roadColor;
    ctx.fillRect(0, groundY + 32, totalW, 100);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, groundY + 32, totalW, 100);

    // Yellow Road Dash Line
    ctx.fillStyle = '#fbc02d';
    for (let rx = 20; rx < totalW; rx += 90) {
      ctx.fillRect(rx, groundY + 70, 50, 8);
    }
  }

  drawAttackEffects(ctx) {
    this.attackEffects.forEach(eff => {
      ctx.save();
      const alpha = eff.timer / eff.maxTimer;

      // Comic Laser / Impact blast line
      ctx.strokeStyle = `rgba(255, 23, 68, ${alpha})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(eff.startX, eff.startY);
      ctx.lineTo(eff.targetX, eff.targetY);
      ctx.stroke();

      // White core
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Ground impact starburst
      ctx.fillStyle = `rgba(255, 214, 0, ${alpha})`;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      this.hazardManager.drawStarburst(ctx, eff.targetX, eff.targetY - 10, 36 * (1 - alpha + 0.5), 10);

      ctx.restore();
    });
  }
}
