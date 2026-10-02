// Player entity: Barnaby "Budge" Higgins - The Overworked Sidekick

export class Sidekick {
  constructor(engine) {
    this.engine = engine;
    this.width = 46;
    this.height = 68;
    this.x = 200;
    this.y = 480;
    this.vx = 0;
    this.vy = 0;
    this.groundY = 480;
    this.isGrounded = true;
    this.facing = 1; // 1 = right, -1 = left

    this.state = 'idle'; // 'idle', 'run', 'jump', 'sweep', 'spray', 'tape', 'wrench', 'shocked'
    this.actionTimer = 0;
    this.animTimer = 0;

    // Upgrades
    this.speedMultiplier = 1.0;
    this.reachRadius = 85;

    // Movement controls
    this.targetX = null;
  }

  reset(startX = 200, groundY = 480) {
    this.x = startX;
    this.y = groundY;
    this.groundY = groundY;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.state = 'idle';
    this.actionTimer = 0;
    this.targetX = null;
    this.facing = 1;
  }

  applyUpgrades(upgrades) {
    const skateLvl = upgrades.skates || 1;
    this.speedMultiplier = 1.0 + (skateLvl - 1) * 0.35; // +35% per skate level
    const broomLvl = upgrades.broom || 1;
    this.reachRadius = 85 + (broomLvl - 1) * 25; // larger interaction radius
  }

  moveTo(targetX, onArrival = null) {
    this.targetX = targetX;
    this.onArrival = onArrival;
  }

  jump() {
    if (this.isGrounded) {
      this.vy = -420;
      this.isGrounded = false;
      this.state = 'jump';
    }
  }

  triggerAction(actionType, duration = 0.3) {
    this.state = actionType;
    this.actionTimer = duration;
  }

  update(dt, input) {
    this.animTimer += dt;

    if (this.actionTimer > 0) {
      this.actionTimer -= dt;
      if (this.actionTimer <= 0) {
        this.state = this.isGrounded ? 'idle' : 'jump';
      }
    }

    // Keyboard inputs
    let moveDir = 0;
    if (input.keys['ArrowLeft'] || input.keys['KeyA'] || input.keys['a'] || input.keys['A'] || input.keys['Left']) {
      moveDir -= 1;
      this.targetX = null;
      this.onArrival = null;
    }
    if (input.keys['ArrowRight'] || input.keys['KeyD'] || input.keys['d'] || input.keys['D'] || input.keys['Right']) {
      moveDir += 1;
      this.targetX = null;
      this.onArrival = null;
    }
    if ((input.keys['Space'] || input.keys['ArrowUp'] || input.keys['KeyW'] || input.keys['w'] || input.keys['W'] || input.keys[' ']) && this.isGrounded) {
      this.jump();
    }

    // Pointer target tracking
    if (this.targetX !== null) {
      const dx = this.targetX - this.x;
      const reachDist = this.onArrival ? Math.min(28, this.reachRadius * 0.45) : 12;
      if (Math.abs(dx) > reachDist) {
        moveDir = Math.sign(dx);
      } else {
        this.targetX = null;
        if (this.onArrival) {
          const cb = this.onArrival;
          this.onArrival = null;
          cb();
        }
      }
    }

    // Horizontal acceleration
    const baseSpeed = 260 * this.speedMultiplier;
    if (moveDir !== 0) {
      this.vx = moveDir * baseSpeed;
      this.facing = moveDir;
      if (this.isGrounded && this.actionTimer <= 0) {
        this.state = 'run';
      }
    } else {
      this.vx *= 0.75;
      if (Math.abs(this.vx) < 5) this.vx = 0;
      if (this.isGrounded && this.actionTimer <= 0) {
        this.state = 'idle';
      }
    }

    // Gravity
    this.vy += 980 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Ground landing
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.isGrounded = true;
      if (this.state === 'jump') {
        this.state = moveDir !== 0 ? 'run' : 'idle';
      }
    }

    // Bounds check
    const minX = 40;
    const maxX = this.engine.worldWidth - 60;
    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.facing, 1);

    // Comic motion drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = (this.state === 'run') ? Math.sin(this.animTimer * 18) * 4 : Math.sin(this.animTimer * 4) * 2;
    const legSwing = (this.state === 'run') ? Math.sin(this.animTimer * 18) * 14 : 0;

    // --- LEGS & SHOES ---
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Left leg
    ctx.fillStyle = '#223355'; // Dark blue overalls pants
    ctx.beginPath();
    ctx.rect(-14, -24 + (legSwing > 0 ? -legSwing * 0.4 : 0), 9, 24 + (legSwing > 0 ? legSwing * 0.4 : 0));
    ctx.fill();
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.rect(3, -24 + (legSwing < 0 ? legSwing * 0.4 : 0), 9, 24 + (legSwing < 0 ? -legSwing * 0.4 : 0));
    ctx.fill();
    ctx.stroke();

    // Boots / Roller Skates
    const skateLvl = this.engine.storage?.getUpgradeLevel('skates') || 1;
    ctx.fillStyle = skateLvl >= 3 ? '#ff2a4b' : skateLvl === 2 ? '#ffdd00' : '#444444';
    ctx.fillRect(-17, -5, 14, 7);
    ctx.strokeRect(-17, -5, 14, 7);
    ctx.fillRect(2, -5, 14, 7);
    ctx.strokeRect(2, -5, 14, 7);

    // Wheels if roller skates
    if (skateLvl >= 2) {
      ctx.fillStyle = '#00e5ff';
      [-14, -6, 5, 13].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // --- CAPE / SAFETY VEST ---
    // High-vis yellow cape fluttering behind
    ctx.fillStyle = '#e8ff00';
    ctx.beginPath();
    const capeFlutter = (this.state === 'run' || !this.isGrounded) ? Math.sin(this.animTimer * 16) * 10 - 15 : -5;
    ctx.moveTo(-10, -50 + bob);
    ctx.lineTo(-26 + capeFlutter, -22 + bob);
    ctx.lineTo(-12, -26 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- TORSO (Sidekick Vest) ---
    ctx.fillStyle = '#ff7b00'; // Safety orange shirt
    ctx.beginPath();
    ctx.roundRect(-15, -52 + bob, 30, 30, 4);
    ctx.fill();
    ctx.stroke();

    // Vest reflection stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-13, -44 + bob, 26, 4);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(-13, -37 + bob, 26, 3);

    // "SIDEKICK" badge
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.arc(4, -46 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tool belt
    ctx.fillStyle = '#4a2c11';
    ctx.fillRect(-16, -26 + bob, 32, 6);
    ctx.strokeRect(-16, -26 + bob, 32, 6);
    // Buckle
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-4, -27 + bob, 8, 8);
    ctx.strokeRect(-4, -27 + bob, 8, 8);

    // Hanging tools on belt (tape roll & wrench)
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.arc(-11, -19 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // --- HEAD ---
    ctx.fillStyle = '#ffc599'; // Comic skin tone
    ctx.beginPath();
    ctx.arc(0, -64 + bob, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair / Cap
    ctx.fillStyle = '#3a2010';
    ctx.beginPath();
    ctx.arc(0, -69 + bob, 15, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Safety Goggles (Large round comic goggles with reflections)
    ctx.fillStyle = '#00e5ff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    // Goggle bridge
    ctx.beginPath();
    ctx.arc(3, -64 + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(14, -64 + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil eyes inside goggles
    ctx.fillStyle = '#000000';
    const lookOffset = (this.engine.approvalRating < 40) ? (Math.random() * 4 - 2) : 2;
    ctx.beginPath();
    ctx.arc(4 + lookOffset, -64 + bob, 2.5, 0, Math.PI * 2);
    ctx.arc(15 + lookOffset, -64 + bob, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Goggle highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(2, -66 + bob, 2, 0, Math.PI * 2);
    ctx.arc(13, -66 + bob, 2, 0, Math.PI * 2);
    ctx.fill();

    // Comic Mouth (nervous grin or shouting)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (this.engine.approvalRating < 35 || this.state === 'shocked') {
      // Wide nervous squiggly mouth
      ctx.moveTo(3, -56 + bob);
      ctx.lineTo(8, -53 + bob);
      ctx.lineTo(13, -57 + bob);
      ctx.stroke();

      // Sweat droplet flying off
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(-14, -68 + bob + Math.sin(this.animTimer * 12) * 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Determined smile
      ctx.arc(8, -58 + bob, 5, 0.2, Math.PI * 0.8);
      ctx.stroke();
    }

    // --- ARMS & HELD TOOLS ---
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ffe600'; // Bright yellow rubber cleaning gloves

    if (this.state === 'sweep') {
      // Sweeping broom animation
      const sweepAngle = Math.sin(this.animTimer * 24) * 0.6;
      ctx.save();
      ctx.translate(10, -40 + bob);
      ctx.rotate(sweepAngle);

      // Broom handle
      ctx.strokeStyle = '#8d5524';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-15, -20);
      ctx.lineTo(25, 40);
      ctx.stroke();

      // Broom head (bristles)
      ctx.fillStyle = '#ffcc00';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.fillRect(20, 32, 22, 16);
      ctx.strokeRect(20, 32, 22, 16);

      // Dust swoosh lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(35, 42, 12, 0, Math.PI);
      ctx.stroke();

      ctx.restore();
    } else if (this.state === 'spray') {
      // Squeezing juice carton / cannon
      ctx.save();
      ctx.translate(14, -40 + bob);

      // Arm reaching forward
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Juice box / turbo extinguisher
      const juiceLvl = this.engine.storage?.getUpgradeLevel('juiceJug') || 1;
      ctx.fillStyle = juiceLvl >= 3 ? '#e91e63' : '#ff5722';
      ctx.fillRect(4, -8, 16, 22);
      ctx.strokeRect(4, -8, 16, 22);

      // Straw / nozzle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, -12, 10, 4);
      ctx.strokeRect(18, -12, 10, 4);

      // Juice squirt droplets spray
      ctx.fillStyle = '#00e5ff';
      for (let i = 0; i < 4; i++) {
        const sx = 30 + i * 8 + Math.random() * 4;
        const sy = -10 + (Math.random() * 8 - 4);
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else if (this.state === 'tape') {
      // Slapping duct tape roll
      ctx.save();
      ctx.translate(14, -38 + bob);

      // Duct tape roll
      ctx.fillStyle = '#b0bec5';
      ctx.beginPath();
      ctx.arc(10, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pulled tape strip
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(14, -4, 20, 7);
      ctx.strokeRect(14, -4, 20, 7);

      ctx.restore();
    } else if (this.state === 'wrench') {
      // Wrench turning
      ctx.save();
      ctx.translate(15, -42 + bob);
      ctx.rotate(Math.sin(this.animTimer * 20) * 0.8);

      ctx.fillStyle = '#78909c';
      ctx.fillRect(0, -4, 24, 7);
      ctx.strokeRect(0, -4, 24, 7);

      ctx.beginPath();
      ctx.arc(24, 0, 8, 0.5, Math.PI * 1.5);
      ctx.stroke();

      ctx.restore();
    } else {
      // Normal arm swing
      const armSwing = (this.state === 'run') ? Math.sin(this.animTimer * 18 + Math.PI) * 12 : 0;
      ctx.beginPath();
      ctx.arc(8, -36 + bob + armSwing, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
