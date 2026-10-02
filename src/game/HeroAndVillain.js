// Captain Calamity (Hero) & Doctor Disaster (Villain) Dogfight AI & Destruction Spawner

export class HeroAndVillain {
  constructor(engine) {
    this.engine = engine;

    // Captain Calamity
    this.heroX = 150;
    this.heroY = 120;
    this.heroVx = 180;
    this.heroFacing = 1;
    this.heroSpeech = null;
    this.heroSpeechTimer = 0;

    // Doctor Disaster
    this.villainX = 600;
    this.villainY = 100;
    this.villainVx = 160;
    this.villainSpeech = null;
    this.villainSpeechTimer = 0;

    this.timer = 0;
    this.nextAttackTimer = 2.5;
  }

  reset() {
    this.heroX = 100;
    this.heroY = 110;
    this.villainX = 650;
    this.villainY = 90;
    this.heroVx = 190;
    this.villainVx = 170;
    this.heroSpeech = null;
    this.heroSpeechTimer = 0;
    this.villainSpeech = null;
    this.villainSpeechTimer = 0;
    this.timer = 0;
    this.nextAttackTimer = 2.0;
  }

  sayHero(text, duration = 3.0) {
    this.heroSpeech = text;
    this.heroSpeechTimer = duration;
  }

  sayVillain(text, duration = 2.5) {
    this.villainSpeech = text;
    this.villainSpeechTimer = duration;
  }

  update(dt) {
    this.timer += dt;

    if (this.heroSpeechTimer > 0) {
      this.heroSpeechTimer -= dt;
      if (this.heroSpeechTimer <= 0) this.heroSpeech = null;
    }
    if (this.villainSpeechTimer > 0) {
      this.villainSpeechTimer -= dt;
      if (this.villainSpeechTimer <= 0) this.villainSpeech = null;
    }

    // Villain flight pattern (swirling, taunting)
    this.villainX += Math.sin(this.timer * 1.5) * 140 * dt + this.villainVx * dt * 0.4;
    this.villainY = 95 + Math.sin(this.timer * 3.0) * 35;

    // Bounds clamp for villain
    if (this.villainX > this.engine.worldWidth - 120) {
      this.villainVx = -Math.abs(this.villainVx);
    } else if (this.villainX < 200) {
      this.villainVx = Math.abs(this.villainVx);
    }

    // Hero pursues villain with slight overshoot and comic swerves
    const dx = this.villainX - this.heroX;
    this.heroFacing = dx >= 0 ? 1 : -1;
    this.heroX += (dx * 1.2) * dt;
    this.heroY = 120 + Math.sin(this.timer * 2.2 + 1) * 30;

    // Attack / Collateral trigger
    this.nextAttackTimer -= dt;
    if (this.nextAttackTimer <= 0) {
      this.triggerHeroMiss();
      // Reset attack interval based on issue configuration & overtime
      const baseInterval = this.engine.currentLevelConfig?.hazardSpawnInterval || 3.0;
      let scaledInterval = baseInterval;
      if (this.engine.isEndless) {
        const overtimeElapsed = this.engine.elapsedTime || 0;
        scaledInterval = Math.max(1.4, baseInterval - (overtimeElapsed / 60) * 0.4);
      }
      this.nextAttackTimer = scaledInterval * (0.8 + Math.random() * 0.4);
    }
  }

  triggerHeroMiss() {
    // Hero attacks, misses villain, hits the city below!
    const targetX = Math.max(100, Math.min(this.engine.worldWidth - 100, this.heroX + (Math.random() * 200 - 100)));

    // Choose dialogue
    const levelConfig = this.engine.currentLevelConfig;
    if (levelConfig && levelConfig.heroDialogue && Math.random() < 0.65) {
      const line = levelConfig.heroDialogue[Math.floor(Math.random() * levelConfig.heroDialogue.length)];
      this.sayHero(line, 2.5);
    } else if (levelConfig && levelConfig.villainDialogue && Math.random() < 0.5) {
      const line = levelConfig.villainDialogue[Math.floor(Math.random() * levelConfig.villainDialogue.length)];
      this.sayVillain(line, 2.2);
    }

    // Spawn destruction shockwave or laser impact
    this.engine.spawnAttackEffect({
      startX: this.heroX,
      startY: this.heroY,
      targetX: targetX,
      targetY: 480
    });

    // Spawn a collateral damage hazard at targetX
    this.engine.hazardManager.spawnCollateralDamage(targetX);
  }

  draw(ctx) {
    // --- DRAW DOCTOR DISASTER ---
    ctx.save();
    ctx.translate(this.villainX, this.villainY);

    // Villain Robot Pod
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Jet thrust flame
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.moveTo(-15, 20);
    ctx.lineTo(0, 38 + Math.sin(this.timer * 25) * 8);
    ctx.lineTo(15, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pod sphere (evil purple)
    ctx.fillStyle = '#8e24aa';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glass dome
    ctx.fillStyle = 'rgba(100, 255, 218, 0.6)';
    ctx.beginPath();
    ctx.arc(0, -6, 17, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Doctor Disaster face inside dome
    ctx.fillStyle = '#76ff03'; // Toxic green evil skin
    ctx.beginPath();
    ctx.arc(0, -8, 9, 0, Math.PI * 2);
    ctx.fill();
    // Evil goggles
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(-6, -11, 4, 3);
    ctx.fillRect(2, -11, 4, 3);
    // Mustache / cackle grin
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -6, 5, 0, Math.PI);
    ctx.stroke();

    // Mechanical claws
    ctx.fillStyle = '#424242';
    ctx.fillRect(-28, 4, 10, 5);
    ctx.fillRect(18, 4, 10, 5);

    // Villain speech balloon
    if (this.villainSpeech) {
      this.drawSpeechBubble(ctx, 0, -42, this.villainSpeech, '#ba68c8');
    }

    ctx.restore();

    // --- DRAW CAPTAIN CALAMITY ---
    ctx.save();
    ctx.translate(this.heroX, this.heroY);
    ctx.scale(this.heroFacing, 1);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Massive Crimson Cape fluttering
    ctx.fillStyle = '#d50000';
    ctx.beginPath();
    const capeRuffle = Math.sin(this.timer * 18) * 12;
    ctx.moveTo(-10, -10);
    ctx.lineTo(-45, -25 + capeRuffle);
    ctx.lineTo(-55, 10 - capeRuffle);
    ctx.lineTo(-12, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hero Flying Pose (Torso angled forward)
    ctx.fillStyle = '#ffd600'; // Gold heroic armor
    ctx.beginPath();
    ctx.ellipse(4, 0, 20, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // "CC" Emblem on Chest
    ctx.fillStyle = '#d50000';
    ctx.font = 'bold 12px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CC', 4, 1);

    // Punching Fist outstretched forward
    ctx.fillStyle = '#ffffff'; // White heroic gauntlets
    ctx.beginPath();
    ctx.arc(26, -4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Trailing speed lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    [-15, -25, -35].forEach((lx, idx) => {
      ctx.beginPath();
      ctx.moveTo(lx, -8 + idx * 8);
      ctx.lineTo(lx - 20, -8 + idx * 8);
      ctx.stroke();
    });

    // Heroic Chin / Head
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(10, -18, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Heroic Blue Cowl Mask
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.arc(10, -20, 12, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Giant White Teeth Smile (totally oblivious to destruction)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, -14, 10, 4);
    ctx.strokeRect(8, -14, 10, 4);

    // Hero speech balloon
    if (this.heroSpeech) {
      this.drawSpeechBubble(ctx, 10, -42, this.heroSpeech, '#fff59d');
    }

    ctx.restore();
  }

  drawSpeechBubble(ctx, x, y, text, bgColor = '#ffffff') {
    ctx.save();
    ctx.font = 'bold 13px "Bangers", cursive, sans-serif';
    const lines = this.wrapText(ctx, text, 180);
    const lineHeight = 16;
    const pad = 8;
    const boxW = Math.max(120, Math.min(220, lines.reduce((max, l) => Math.max(max, ctx.measureText(l).width), 0) + pad * 2));
    const boxH = lines.length * lineHeight + pad * 2;

    const bx = x - boxW / 2;
    const by = y - boxH;

    // Speech bubble background
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Little pointer tail
    ctx.beginPath();
    ctx.moveTo(x - 6, by + boxH);
    ctx.lineTo(x, by + boxH + 8);
    ctx.lineTo(x + 6, by + boxH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, idx) => {
      ctx.fillText(line, x, by + pad + lineHeight * (idx + 0.5));
    });

    ctx.restore();
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}
