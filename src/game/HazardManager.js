// Hazard and Collateral Damage Physics & Repair Micro-Task Engine

export class HazardManager {
  constructor(engine) {
    this.engine = engine;
    this.hazards = [];
    this.debrisParticles = [];
    this.trashCans = [];
    this.comicPopups = [];
    this.sparkParticles = [];
    this.draggedDebris = null;
  }

  reset() {
    this.hazards = [];
    this.debrisParticles = [];
    this.comicPopups = [];
    this.sparkParticles = [];
    this.draggedDebris = null;
    this.initTrashCans();
  }

  initTrashCans() {
    this.trashCans = [];
    // Place mobile dumpsters/trash cans along the sidewalk
    const step = 380;
    for (let x = 180; x < this.engine.worldWidth; x += step) {
      this.trashCans.push({
        x: x,
        y: 476,
        width: 38,
        height: 48,
        bounceTimer: 0,
        collectedCount: 0
      });
    }
  }

  spawnCollateralDamage(x) {
    const config = this.engine.currentLevelConfig;
    const allowedTypes = config ? config.hazardTypes : ['window', 'fire', 'debris', 'wire', 'sign'];
    const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];

    const id = Date.now() + Math.random();
    let hazard = null;

    if (chosenType === 'window') {
      hazard = {
        id,
        type: 'window',
        x: x,
        y: 340 + Math.random() * 50,
        width: 65,
        height: 75,
        health: 3, // Requires 3 tape strips (or less with upgrades)
        maxHealth: 3,
        tapeStrips: [],
        isRepaired: false,
        timer: 0
      };
      this.engine.soundEngine.playKapow();
      this.engine.spawnComicText(x, hazard.y - 20, "CRACK!!", "#ffeb3b");
    } else if (chosenType === 'fire') {
      hazard = {
        id,
        type: 'fire',
        x: x,
        y: 472,
        width: 50,
        height: 50,
        health: 100, // Extinguish percentage
        maxHealth: 100,
        isRepaired: false,
        timer: 0
      };
      this.engine.soundEngine.playKapow();
      this.engine.spawnComicText(x, hazard.y - 25, "BLAZE!!", "#ff3d00");
    } else if (chosenType === 'debris') {
      // Scatter 4-8 physical debris chunks (bricks, rubble)
      const count = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        this.debrisParticles.push({
          x: x + (Math.random() * 40 - 20),
          y: 450 + Math.random() * 20,
          vx: (Math.random() * 160 - 80),
          vy: -(60 + Math.random() * 90),
          size: 8 + Math.random() * 10,
          angle: Math.random() * Math.PI * 2,
          vAngle: (Math.random() - 0.5) * 8,
          color: Math.random() > 0.5 ? '#b71c1c' : '#78909c' // Brick red or concrete grey
        });
      }
      hazard = {
        id,
        type: 'debris',
        x: x,
        y: 480,
        width: 60,
        height: 30,
        isRepaired: false,
        timer: 0
      };
      this.engine.soundEngine.playKapow();
      this.engine.spawnComicText(x, hazard.y - 20, "RUBBLE!!", "#ff9800");
    } else if (chosenType === 'wire') {
      hazard = {
        id,
        type: 'wire',
        x: x,
        y: 400 + Math.random() * 40,
        width: 48,
        height: 55,
        health: 2, // 2 wrench cranks
        maxHealth: 2,
        isRepaired: false,
        timer: 0
      };
      this.engine.soundEngine.playKapow();
      this.engine.spawnComicText(x, hazard.y - 25, "SPARKS!!", "#00e5ff");
    } else if (chosenType === 'sign') {
      hazard = {
        id,
        type: 'sign',
        x: x,
        y: 440,
        width: 55,
        height: 80,
        tiltAngle: 0.55, // Tilted sideways
        health: 2,
        maxHealth: 2,
        isRepaired: false,
        timer: 0
      };
      this.engine.soundEngine.playKapow();
      this.engine.spawnComicText(x, hazard.y - 30, "TOURNIQUET!!", "#e040fb");
    }

    if (hazard) {
      this.hazards.push(hazard);
    }
  }

  getHazardAt(worldX, worldY) {
    for (const h of this.hazards) {
      if (h.isRepaired) continue;
      const hit = (
        worldX >= h.x - h.width / 2 - 25 &&
        worldX <= h.x + h.width / 2 + 25 &&
        worldY >= h.y - h.height / 2 - 25 &&
        worldY <= h.y + h.height / 2 + 25
      );
      if (hit) return h;
    }
    return null;
  }

  startDebrisDrag(worldX, worldY) {
    for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
      const p = this.debrisParticles[i];
      const d = Math.hypot(p.x - worldX, p.y - worldY);
      if (d < Math.max(30, p.size + 15)) {
        this.draggedDebris = p;
        p.isDragged = true;
        p.vx = 0;
        p.vy = 0;
        return true;
      }
    }
    return false;
  }

  updateDebrisDrag(worldX, worldY) {
    if (this.draggedDebris) {
      this.draggedDebris.x = worldX;
      this.draggedDebris.y = worldY;
      this.draggedDebris.vx = 0;
      this.draggedDebris.vy = 0;
    }
  }

  endDebrisDrag(throwVx = 0, throwVy = 0) {
    if (this.draggedDebris) {
      const p = this.draggedDebris;
      p.isDragged = false;
      p.vx = throwVx;
      p.vy = throwVy;

      // Check if dropped directly in or near trash can
      for (const tc of this.trashCans) {
        if (
          p.x >= tc.x - tc.width / 2 - 25 &&
          p.x <= tc.x + tc.width / 2 + 25 &&
          p.y >= tc.y - tc.height / 2 - 35 &&
          p.y <= tc.y + tc.height / 2 + 25
        ) {
          tc.bounceTimer = 0.35;
          tc.collectedCount++;
          this.engine.soundEngine.playChing();
          this.engine.spawnComicText(tc.x, tc.y - 30, "CLATTER! DUNK!", "#00e676");
          this.engine.addTips(1.00); // $1.00 tip for direct physical dunk
          this.engine.changeApprovalRating(3);
          const idx = this.debrisParticles.indexOf(p);
          if (idx !== -1) this.debrisParticles.splice(idx, 1);
          break;
        }
      }
      this.draggedDebris = null;
    }
  }

  // Handle interaction from player tool click or reach
  interactAt(worldX, worldY, tool) {
    let handled = false;

    // Check debris first if using broom
    if (tool === 'broom') {
      const broomLvl = this.engine.storage?.getUpgradeLevel('broom') || 1;
      const sweepRadius = 90 + (broomLvl - 1) * 35;
      const sweepForce = 220 + (broomLvl - 1) * 90;

      // Find nearest trash can direction
      let nearestCan = this.trashCans[0];
      let minDist = 999999;
      for (const tc of this.trashCans) {
        const d = Math.abs(tc.x - worldX);
        if (d < minDist) {
          minDist = d;
          nearestCan = tc;
        }
      }

      let sweptCount = 0;
      this.debrisParticles.forEach(p => {
        const dist = Math.hypot(p.x - worldX, p.y - worldY);
        if (dist < sweepRadius) {
          const pushDir = Math.sign(nearestCan.x - p.x) || 1;
          p.vx = pushDir * sweepForce + (Math.random() * 60 - 30);
          p.vy = -180 - Math.random() * 100;
          p.vAngle = (Math.random() - 0.5) * 15;
          sweptCount++;
        }
      });

      if (sweptCount > 0) {
        this.engine.soundEngine.playBroom();
        this.engine.spawnComicText(worldX, worldY - 30, "SWEEEEP!", "#ffea00");
        this.engine.sidekick.triggerAction('sweep', 0.25);
        handled = true;
      }
    }

    // Check other hazards
    for (const h of this.hazards) {
      if (h.isRepaired) continue;

      const hit = (
        worldX >= h.x - h.width / 2 - 25 &&
        worldX <= h.x + h.width / 2 + 25 &&
        worldY >= h.y - h.height / 2 - 25 &&
        worldY <= h.y + h.height / 2 + 25
      );

      if (!hit) continue;

      if (h.type === 'window' && tool === 'tape') {
        const tapeLvl = this.engine.storage?.getUpgradeLevel('ductTape') || 1;
        const damagePerClick = tapeLvl >= 3 ? 3 : (tapeLvl === 2 ? 2 : 1);
        h.health -= damagePerClick;

        h.tapeStrips.push({
          angle: (Math.random() - 0.5) * 0.8,
          offsetY: (Math.random() - 0.5) * (h.height * 0.5)
        });

        this.engine.soundEngine.playTape();
        this.engine.sidekick.triggerAction('tape', 0.25);

        if (h.health <= 0) {
          this.completeRepair(h, "DUCT-TASTIC!", "#00e5ff");
        } else {
          this.engine.spawnComicText(h.x, h.y - 20, "TAPE!", "#b0bec5");
        }
        handled = true;
        break;
      } else if (h.type === 'fire' && tool === 'juice') {
        const juiceLvl = this.engine.storage?.getUpgradeLevel('juiceJug') || 1;
        const quench = juiceLvl >= 3 ? 55 : (juiceLvl === 2 ? 35 : 22);
        h.health -= quench;

        this.engine.soundEngine.playJuice();
        this.engine.sidekick.triggerAction('spray', 0.25);

        if (h.health <= 0) {
          this.completeRepair(h, "SPLOOSH!", "#29b6f6");
        } else {
          this.engine.spawnComicText(h.x, h.y - 25, "SPRITZ!", "#4fc3f7");
        }
        handled = true;
        break;
      } else if (h.type === 'wire' && tool === 'wrench') {
        h.health -= 1;
        this.engine.soundEngine.playWrench();
        this.engine.sidekick.triggerAction('wrench', 0.3);

        if (h.health <= 0) {
          this.completeRepair(h, "BOLTED TIGHT!", "#ffd600");
        } else {
          this.engine.spawnComicText(h.x, h.y - 20, "CLANK!", "#ffd54f");
        }
        handled = true;
        break;
      } else if (h.type === 'sign' && (tool === 'wrench' || tool === 'broom')) {
        h.health -= 1;
        h.tiltAngle *= 0.3;
        this.engine.soundEngine.playWrench();
        this.engine.sidekick.triggerAction('wrench', 0.3);

        if (h.health <= 0) {
          h.tiltAngle = 0;
          this.completeRepair(h, "HERO RESTORED!", "#e040fb");
        } else {
          this.engine.spawnComicText(h.x, h.y - 25, "SHOVE!", "#ce93d8");
        }
        handled = true;
        break;
      } else if (tool === 'megaphone') {
        const prLvl = this.engine.storage?.getUpgradeLevel('prPass') || 0;
        const duration = prLvl >= 2 ? 8 : (prLvl >= 1 ? 6 : 4);
        const approvalBoost = prLvl >= 2 ? 6 : 3;
        this.engine.newsChopper.distract(duration);
        this.engine.changeApprovalRating(approvalBoost);
        this.engine.soundEngine.playMegaphone();
        this.engine.spawnComicText(worldX, worldY - 35, prLvl >= 2 ? "VIP SPIN! +6%" : "PR SPIN! +3%", "#ff4081");
        handled = true;
        break;
      }
    }

    return handled;
  }

  completeRepair(hazard, comicWord, color) {
    hazard.isRepaired = true;
    this.engine.onHazardRepaired(hazard);
    this.engine.spawnComicText(hazard.x, hazard.y - 30, comicWord, color);
    this.engine.newsChopper.onHazardRepairedInSpotlight(hazard);
  }

  update(dt) {
    // Update hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.timer += dt;

      // Spark particles for broken wires
      if (h.type === 'wire' && !h.isRepaired && Math.random() < 0.25) {
        this.sparkParticles.push({
          x: h.x + (Math.random() * 20 - 10),
          y: h.y + (Math.random() * 20 - 10),
          vx: (Math.random() - 0.5) * 120,
          vy: (Math.random() - 0.5) * 120,
          life: 0.25,
          color: Math.random() > 0.5 ? '#00e5ff' : '#ffd600'
        });
      }

      // Fade out repaired hazards
      if (h.isRepaired && h.timer > 3.0) {
        this.hazards.splice(i, 1);
      }
    }

    // Update debris physics particles
    for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
      const p = this.debrisParticles[i];
      p.vy += 850 * dt; // Gravity
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.vAngle * dt;

      // Ground bounce
      if (p.y >= 505) {
        p.y = 505;
        p.vy = -p.vy * 0.45;
        p.vx *= 0.8;
        if (Math.abs(p.vy) < 30) p.vy = 0;
      }

      // Check collision with trash cans
      for (const tc of this.trashCans) {
        if (
          p.x >= tc.x - tc.width / 2 &&
          p.x <= tc.x + tc.width / 2 &&
          p.y >= tc.y - tc.height / 2 &&
          p.y <= tc.y + tc.height / 2 + 10
        ) {
          // Debris swept into can!
          tc.bounceTimer = 0.3;
          tc.collectedCount++;
          this.engine.soundEngine.playChing();
          this.engine.spawnComicText(tc.x, tc.y - 30, "CLATTER!", "#00e676");
          this.engine.addTips(0.75);
          this.engine.changeApprovalRating(2);
          this.debrisParticles.splice(i, 1);
          break;
        }
      }
    }

    // Update trash can bounce
    this.trashCans.forEach(tc => {
      if (tc.bounceTimer > 0) {
        tc.bounceTimer -= dt;
      }
    });

    // Update spark particles
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      const sp = this.sparkParticles[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) {
        this.sparkParticles.splice(i, 1);
      }
    }

    // Update comic text popups
    for (let i = this.comicPopups.length - 1; i >= 0; i--) {
      const cp = this.comicPopups[i];
      cp.timer += dt;
      cp.y += cp.vy * dt;
      cp.scale += (cp.targetScale - cp.scale) * 0.2;
      if (cp.timer >= cp.duration) {
        this.comicPopups.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw trash cans
    this.trashCans.forEach(tc => {
      ctx.save();
      ctx.translate(tc.x, tc.y);
      const bounce = tc.bounceTimer > 0 ? Math.sin(tc.bounceTimer * 25) * 6 : 0;
      ctx.translate(0, -bounce);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';

      // Can body (comic green metal)
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.rect(-tc.width / 2, -tc.height / 2, tc.width, tc.height);
      ctx.fill();
      ctx.stroke();

      // Fluted ribs
      ctx.strokeStyle = '#1b5e20';
      [-8, 0, 8].forEach(rx => {
        ctx.beginPath();
        ctx.moveTo(rx, -tc.height / 2 + 5);
        ctx.lineTo(rx, tc.height / 2 - 5);
        ctx.stroke();
      });

      // Lid
      ctx.fillStyle = '#4caf50';
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(-tc.width / 2 - 3, -tc.height / 2 - 8, tc.width + 6, 8, 3);
      ctx.fill();
      ctx.stroke();

      // Recycle / Clean icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Bangers", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('TRASH', 0, 4);

      ctx.restore();
    });

    // Draw hazards
    this.hazards.forEach(h => {
      ctx.save();
      ctx.translate(h.x, h.y);

      if (h.type === 'window') {
        this.drawWindowHazard(ctx, h);
      } else if (h.type === 'fire') {
        this.drawFireHazard(ctx, h);
      } else if (h.type === 'wire') {
        this.drawWireHazard(ctx, h);
      } else if (h.type === 'sign') {
        this.drawSignHazard(ctx, h);
      }

      ctx.restore();
    });

    // Draw debris particles
    this.debrisParticles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Draw spark particles
    this.sparkParticles.forEach(sp => {
      ctx.save();
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw comic action popups ("KAPOW!", "DUCT TAPE!")
    this.comicPopups.forEach(cp => {
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.scale(cp.scale, cp.scale);
      ctx.rotate(cp.angle);

      // Starburst background
      ctx.fillStyle = cp.bgColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      this.drawStarburst(ctx, 0, 0, cp.textWidth * 0.7 + 16, 12);

      // Comic text
      ctx.font = 'bold 22px "Bangers", cursive, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Hard comic offset shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(cp.text, 3, 3);

      ctx.fillStyle = cp.color;
      ctx.fillText(cp.text, 0, 0);

      ctx.restore();
    });
  }

  drawWindowHazard(ctx, h) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Window frame
    ctx.fillStyle = '#e0f7fa';
    ctx.beginPath();
    ctx.rect(-h.width / 2, -h.height / 2, h.width, h.height);
    ctx.fill();
    ctx.stroke();

    // Inner mullions
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h.height / 2);
    ctx.lineTo(0, h.height / 2);
    ctx.moveTo(-h.width / 2, 0);
    ctx.lineTo(h.width / 2, 0);
    ctx.stroke();

    // Spiderweb cracks
    if (!h.isRepaired || h.tapeStrips.length < 3) {
      ctx.strokeStyle = '#006064';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, -12);
      ctx.lineTo(0, 0);
      ctx.lineTo(16, -18);
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 18);
      ctx.moveTo(0, 0);
      ctx.lineTo(-14, 15);
      ctx.stroke();
    }

    // Applied Duct Tape strips
    h.tapeStrips.forEach(ts => {
      ctx.save();
      ctx.rotate(ts.angle);
      ctx.fillStyle = '#cfd8dc'; // Silver duct tape
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.fillRect(-h.width / 2 - 6, ts.offsetY - 6, h.width + 12, 12);
      ctx.strokeRect(-h.width / 2 - 6, ts.offsetY - 6, h.width + 12, 12);
      ctx.restore();
    });

    // Tool Prompt indicator if unfixed
    if (!h.isRepaired) {
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 11px "Bangers", cursive';
      ctx.textAlign = 'center';
      ctx.fillText(`TAPE IT! (${h.health})`, 0, -h.height / 2 - 8);
    }
  }

  drawFireHazard(ctx, h) {
    if (h.isRepaired) {
      // Steaming embers
      ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Hydrant / Trash fire base
    ctx.fillStyle = '#b71c1c';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.fillRect(-12, 8, 24, 18);
    ctx.strokeRect(-12, 8, 24, 18);

    // Comic Fire Plume
    const fTimer = h.timer * 14;
    const fHeight = 35 + Math.sin(fTimer) * 8;

    // Outer Yellow flame
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.moveTo(-18, 12);
    ctx.quadraticCurveTo(-14, -fHeight, 0, -fHeight - 10);
    ctx.quadraticCurveTo(14, -fHeight, 18, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner Orange flame
    ctx.fillStyle = '#ff3d00';
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.quadraticCurveTo(-8, -fHeight * 0.7, 0, -fHeight * 0.8);
    ctx.quadraticCurveTo(8, -fHeight * 0.7, 10, 12);
    ctx.closePath();
    ctx.fill();

    // Health bar
    ctx.fillStyle = '#212121';
    ctx.fillRect(-20, -fHeight - 22, 40, 6);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(-19, -fHeight - 21, 38 * (h.health / h.maxHealth), 4);
    ctx.strokeRect(-20, -fHeight - 22, 40, 6);
  }

  drawWireHazard(ctx, h) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Wall electrical box
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(-16, -16, 32, 32);
    ctx.strokeRect(-16, -16, 32, 32);

    // Lightning bolt emblem on box
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.moveTo(2, -12);
    ctx.lineTo(-4, 0);
    ctx.lineTo(2, 0);
    ctx.lineTo(-2, 12);
    ctx.lineTo(6, -2);
    ctx.lineTo(0, -2);
    ctx.closePath();
    ctx.fill();

    // Dangling wire
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    const wave = !h.isRepaired ? Math.sin(h.timer * 18) * 8 : 0;
    ctx.quadraticCurveTo(12 + wave, 28, 4 + wave, 40);
    ctx.stroke();

    if (!h.isRepaired) {
      // Spark burst at tip
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(4 + wave, 40, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd600';
      ctx.font = 'bold 11px "Bangers", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('WRENCH!', 0, -24);
    }
  }

  drawSignHazard(ctx, h) {
    ctx.save();
    ctx.rotate(h.tiltAngle);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Signpost pole
    ctx.fillStyle = '#78909c';
    ctx.fillRect(-4, -50, 8, 50);
    ctx.strokeRect(-4, -50, 8, 50);

    // Billboard sign
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(-28, -85, 56, 35);
    ctx.strokeRect(-28, -85, 56, 35);

    // Face of Captain Calamity
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(0, -68, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.arc(0, -70, 10, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawStarburst(ctx, cx, cy, radius, points = 12) {
    const innerRadius = radius * 0.6;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? radius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
