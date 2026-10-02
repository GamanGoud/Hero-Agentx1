// Action 9 Eyewitness News Helicopter - The Public Approval Threat!

export class NewsChopper {
  constructor(engine) {
    this.engine = engine;
    this.x = 300;
    this.y = 70;
    this.vx = 90;
    this.spotlightX = 300;
    this.spotlightWidth = 140;
    this.rotorAngle = 0;

    this.timer = 0;
    this.flashTimer = 0;
    this.distractedTimer = 0; // Triggered by PR Megaphone / Donuts
    this.spottedCooldown = 0;

    this.anchorLine = null;
    this.anchorTimer = 0;
  }

  reset() {
    this.x = 250;
    this.y = 70;
    this.vx = 100;
    this.spotlightX = 250;
    this.rotorAngle = 0;
    this.timer = 0;
    this.flashTimer = 0;
    this.distractedTimer = 0;
    this.spottedCooldown = 0;
    this.anchorLine = null;
    this.anchorTimer = 0;
  }

  distract(seconds = 5) {
    this.distractedTimer = seconds;
    this.anchorLine = "CHOPPER 9: 'Camera lens covered in cream donuts! Blinded!'";
    this.anchorTimer = seconds;
  }

  update(dt) {
    this.timer += dt;
    this.rotorAngle += dt * 35;

    if (this.distractedTimer > 0) {
      this.distractedTimer -= dt;
    }
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }
    if (this.spottedCooldown > 0) {
      this.spottedCooldown -= dt;
    }
    if (this.anchorTimer > 0) {
      this.anchorTimer -= dt;
      if (this.anchorTimer <= 0) this.anchorLine = null;
    }

    // Chopper movement: sweeps across stage based on level's media scrutiny
    const baseInterval = this.engine.currentLevelConfig?.chopperInterval || 12.0;
    const targetSpeed = Math.min(220, (14.0 / baseInterval) * 115);
    const dir = Math.sign(this.vx) || 1;
    this.vx = dir * targetSpeed;

    this.x += this.vx * dt;
    this.y = 65 + Math.sin(this.timer * 3) * 12;

    const minX = 160;
    const maxX = this.engine.worldWidth - 160;
    if (this.x > maxX) {
      this.vx = -Math.abs(this.vx);
    } else if (this.x < minX) {
      this.vx = Math.abs(this.vx);
    }

    // Spotlight sways slightly ahead of chopper
    const swaySpeed = 2.5 + (targetSpeed / 100) * 0.8;
    this.spotlightX = this.x + Math.sin(this.timer * swaySpeed) * 85;

    // Check for hazards inside spotlight
    if (this.distractedTimer <= 0 && this.spottedCooldown <= 0) {
      this.checkSpotlightHazards();
    }
  }

  checkSpotlightHazards() {
    const hazards = this.engine.hazardManager.hazards;
    const sLeft = this.spotlightX - this.spotlightWidth / 2;
    const sRight = this.spotlightX + this.spotlightWidth / 2;

    for (const h of hazards) {
      if (!h.isRepaired && h.x >= sLeft && h.x <= sRight) {
        // Spotlight caught collateral damage on live television!
        this.spottedCooldown = 3.5;
        this.flashTimer = 0.25;

        this.engine.soundEngine.playCameraSnap();
        this.engine.soundEngine.playOops();

        // Damage hero approval rating
        const penalty = 12 + Math.floor(Math.random() * 6);
        this.engine.changeApprovalRating(-penalty);

        // Generate news headline
        const headlines = [
          `BREAKING: Calamity shatters ${h.type === 'window' ? 'historic glass' : h.type === 'fire' ? 'gas main' : 'city property'}! Rating -${penalty}%!`,
          `ACTION 9 EYEWITNESS: "Hero or Menace? Millions in destruction!" (-${penalty}%)`,
          `LIVE REPORT: Mayor questions superhero budget after downtown ruins! (-${penalty}%)`,
          `CHAD CHISELED: "Disaster caught on 4K drone cam! Shocking reckless chaos!" (-${penalty}%)`
        ];
        const chosen = headlines[Math.floor(Math.random() * headlines.length)];
        this.anchorLine = chosen;
        this.anchorTimer = 3.5;
        this.engine.setBreakingNews(chosen);

        this.engine.spawnComicText(h.x, 380, "CAUGHT ON CAM!", "#ff1744");
        break;
      }
    }
  }

  onHazardRepairedInSpotlight(hazard) {
    if (this.distractedTimer > 0) return;
    const sLeft = this.spotlightX - this.spotlightWidth / 2;
    const sRight = this.spotlightX + this.spotlightWidth / 2;

    if (hazard.x >= sLeft && hazard.x <= sRight) {
      // Repaired right on camera! Massive PR boost!
      const bonus = 10;
      const tip = (3.5 + Math.random() * 4).toFixed(2);
      this.engine.changeApprovalRating(bonus);
      this.engine.addTips(parseFloat(tip));
      this.engine.soundEngine.playChing();

      const headlines = [
        `PR MIRACLE: "Hero's crew repairs destruction in 2.4 seconds!" (+${bonus}%)`,
        `BREAKING: Chad Chiseled impressed: "Spotless recovery! +$${tip} tip!"`,
        `ACTION 9: Public praises hyper-competent sidekick response! (+${bonus}%)`
      ];
      const chosen = headlines[Math.floor(Math.random() * headlines.length)];
      this.anchorLine = chosen;
      this.anchorTimer = 3.0;
      this.engine.setBreakingNews(chosen);

      this.engine.spawnComicText(hazard.x, 360, "CLEAN SAVE! +$", "#00e676");
    }
  }

  draw(ctx) {
    // --- DRAW SPOTLIGHT CONE ---
    ctx.save();
    if (this.distractedTimer > 0) {
      // Donut blind effect
      ctx.fillStyle = 'rgba(255, 105, 180, 0.25)';
    } else if (this.flashTimer > 0) {
      // White camera flash
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    } else {
      // Yellow searchlight
      const grad = ctx.createLinearGradient(this.x, this.y, this.spotlightX, 520);
      grad.addColorStop(0, 'rgba(255, 235, 59, 0.45)');
      grad.addColorStop(1, 'rgba(255, 235, 59, 0.15)');
      ctx.fillStyle = grad;
    }

    ctx.beginPath();
    ctx.moveTo(this.x, this.y + 12);
    ctx.lineTo(this.spotlightX - this.spotlightWidth / 2, 520);
    ctx.lineTo(this.spotlightX + this.spotlightWidth / 2, 520);
    ctx.closePath();
    ctx.fill();

    // Spotlight ground ellipse
    ctx.fillStyle = this.distractedTimer > 0 ? 'rgba(255, 105, 180, 0.35)' : 'rgba(255, 235, 59, 0.35)';
    ctx.beginPath();
    ctx.ellipse(this.spotlightX, 510, this.spotlightWidth / 2, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.distractedTimer > 0 ? '#ff4081' : '#fbc02d';
    ctx.stroke();

    // Camera reticle on ground
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 2;
    const rx = this.spotlightX;
    const ry = 510;
    // Corners
    [
      [-30, -10, 15, 0, 0, 10],
      [30, -10, -15, 0, 0, 10],
      [-30, 10, 15, 0, 0, -10],
      [30, 10, -15, 0, 0, -10]
    ].forEach(([cx, cy, dx, dy, dx2, dy2]) => {
      ctx.beginPath();
      ctx.moveTo(rx + cx, ry + cy);
      ctx.lineTo(rx + cx + dx, ry + cy + dy);
      ctx.moveTo(rx + cx, ry + cy);
      ctx.lineTo(rx + cx + dx2, ry + cy + dy2);
      ctx.stroke();
    });

    // REC indicator
    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('● LIVE REC', rx, ry - 14);

    ctx.restore();

    // --- DRAW HELICOPTER ---
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.vx >= 0 ? 1 : -1, 1);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Tail boom
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.moveTo(-15, -4);
    ctx.lineTo(-65, -8);
    ctx.lineTo(-65, 2);
    ctx.lineTo(-15, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail fin & tail rotor
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(-70, -22, 8, 26);
    ctx.strokeRect(-70, -22, 8, 26);

    // Small tail rotor spinning
    ctx.fillStyle = '#424242';
    const trSwing = Math.sin(this.rotorAngle * 2) * 12;
    ctx.fillRect(-72, -18 + trSwing, 3, 14);

    // Landing skids
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, 14);
    ctx.lineTo(-18, 24);
    ctx.lineTo(24, 24);
    ctx.lineTo(28, 14);
    ctx.stroke();
    // Skid runner
    ctx.beginPath();
    ctx.moveTo(-32, 24);
    ctx.lineTo(36, 24);
    ctx.stroke();

    // Main Cockpit Body
    ctx.fillStyle = '#0277bd'; // News Channel blue
    ctx.beginPath();
    ctx.roundRect(-25, -16, 52, 30, 8);
    ctx.fill();
    ctx.stroke();

    // Cockpit windshield glass
    ctx.fillStyle = '#b3e5fc';
    ctx.beginPath();
    ctx.arc(14, -2, 13, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.lineTo(6, 11);
    ctx.lineTo(6, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // "NEWS 9" logo badge
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(-18, -4, 22, 12);
    ctx.strokeRect(-18, -4, 22, 12);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('9 LIVE', -7, 5);

    // Main Rotor Mast & Spinning Blades
    ctx.fillStyle = '#212121';
    ctx.fillRect(-3, -24, 6, 9);
    ctx.strokeRect(-3, -24, 6, 9);

    // Main Blades
    const bladeW = Math.cos(this.rotorAngle) * 58;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-bladeW, -24);
    ctx.lineTo(bladeW, -24);
    ctx.stroke();

    // Searchlight unit mounted underneath
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(6, 16, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // --- DRAW CHAD CHISELED TALKING HEAD / CHYRON POPUP ---
    if (this.anchorLine && this.anchorTimer > 0) {
      this.drawAnchorBox(ctx);
    }
  }

  drawAnchorBox(ctx) {
    ctx.save();
    const boxW = Math.min(540, this.engine.worldWidth - 40);
    const boxH = 46;
    const bx = (this.engine.worldWidth - boxW) / 2;
    const by = 8;

    // News banner container
    ctx.fillStyle = '#b71c1c'; // Urgent News Red
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // News Anchor portrait icon
    ctx.fillStyle = '#ffecb3';
    ctx.fillRect(bx + 6, by + 5, 36, 36);
    ctx.strokeRect(bx + 6, by + 5, 36, 36);
    // Chad's hair
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(bx + 6, by + 5, 36, 10);
    // Smile & microphone
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx + 18, by + 26, 12, 4);
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.arc(bx + 36, by + 34, 4, 0, Math.PI * 2);
    ctx.fill();

    // News Title
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 12px "Bangers", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ACTION 9 EYEWITNESS CHOPPER EXCLUSIVE', bx + 50, by + 16);

    // Headline text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillText(this.anchorLine, bx + 50, by + 34);

    ctx.restore();
  }
}
