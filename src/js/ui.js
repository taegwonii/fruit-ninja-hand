// ui.js
// Handles: HUD, waiting/gameover screens, blade trail, particles, pop texts

const UIModule = (() => {
  let particles = [];
  let popTexts  = [];

  // ── Particles ───────────────────────────────────────────────
  function spawnParticles(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 / 14) * i + Math.random() * 0.4;
      const speed = 2.5 + Math.random() * 5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 3 + Math.random() * 5,
        color,
        life: 1
      });
    }
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.25;       // gravity
      p.life -= 0.025;
    });
    particles = particles.filter(p => p.life > 0);
  }

  function drawParticles() {
    const ctx = CameraModule.ctx;
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });
  }

  // ── Pop texts ────────────────────────────────────────────────
  function spawnPopText(x, y, text, color = 'white') {
    popTexts.push({ x, y, text, color, life: 1, vy: -1.8 });
  }

  function updatePopTexts() {
    popTexts.forEach(t => { t.y += t.vy; t.life -= 0.022; });
    popTexts = popTexts.filter(t => t.life > 0);
  }

  function drawPopTexts() {
    const ctx = CameraModule.ctx;
    popTexts.forEach(t => {
      ctx.save();
      ctx.globalAlpha    = Math.min(t.life, 1);
      ctx.font           = 'bold 22px sans-serif';
      ctx.fillStyle      = t.color;
      ctx.textAlign      = 'center';
      ctx.shadowColor    = 'black';
      ctx.shadowBlur     = 6;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }

  // ── Blade trail ──────────────────────────────────────────────
  function drawBlade(blade) {
    const ctx = CameraModule.ctx;
    if (!blade.active || blade.trail.length < 2 || !blade.tip) return;

    for (let i = 1; i < blade.trail.length; i++) {
      const alpha = i / blade.trail.length;
      ctx.beginPath();
      ctx.moveTo(blade.trail[i-1].x, blade.trail[i-1].y);
      ctx.lineTo(blade.trail[i].x,   blade.trail[i].y);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth   = alpha * 7;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }

    // Glow ring
    ctx.beginPath();
    ctx.arc(blade.tip.x, blade.tip.y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,220,0,0.35)';
    ctx.lineWidth   = 3;
    ctx.stroke();

    // Tip dot
    ctx.beginPath();
    ctx.arc(blade.tip.x, blade.tip.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f1c40f';
    ctx.fill();
  }

  // ── HUD ──────────────────────────────────────────────────────
  function drawHUD(state) {
    const ctx    = CameraModule.ctx;
    const canvas = CameraModule.canvas;
    const FRUITS_PER_STAGE = GameModule.FRUITS_PER_STAGE;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, 54);

    // Score (left)
    ctx.fillStyle  = 'white';
    ctx.font       = 'bold 20px sans-serif';
    ctx.textAlign  = 'left';
    ctx.fillText(`Score: ${state.score}`, 14, 24);

    // Stage + progress bar (left below score)
    ctx.fillStyle = '#f1c40f';
    ctx.font      = 'bold 14px sans-serif';
    ctx.fillText(`Stage ${state.stage}`, 14, 44);

    const barX = 82, barY = 36, barW = 110, barH = 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(barX, barY, barW * (state.slicedThisStage / FRUITS_PER_STAGE), barH);

    // Lives (center)
    let hearts = '';
    for (let i = 0; i < 3; i++) hearts += i < state.lives ? '❤️' : '🖤';
    ctx.font      = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hearts, canvas.width / 2, 32);

    // Blade indicator (right)
    ctx.font      = 'bold 14px sans-serif';
    ctx.fillStyle = state.bladeActive ? '#f1c40f' : '#555';
    ctx.textAlign = 'right';
    ctx.fillText(state.bladeActive ? '🗡️ BLADE ON' : 'blade off', canvas.width - 14, 32);

    // Online multiplayer — opponent score top right
    if (state.opponentScore !== undefined) {
      ctx.fillStyle = '#e74c3c';
      ctx.font      = 'bold 13px sans-serif';
      ctx.fillText(`Opponent: ${state.opponentScore}`, canvas.width - 14, 50);
    }

    ctx.textAlign = 'left';
  }

  // ── Waiting screen ───────────────────────────────────────────
  function drawWaitingScreen(mode) {
    const ctx    = CameraModule.ctx;
    const canvas = CameraModule.canvas;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font      = 'bold 38px sans-serif';
    ctx.fillText('🍉 Fruit Ninja AR', canvas.width/2, canvas.height/2 - 90);

    ctx.font      = '18px sans-serif';
    ctx.fillStyle = '#ccc';

    if (mode === 'single') {
      ctx.fillText('Raise your index finger to start', canvas.width/2, canvas.height/2 - 20);
      ctx.fillText('Slice 5 fruits to advance a stage', canvas.width/2, canvas.height/2 + 14);
      ctx.fillText('Avoid 💣 bombs — they end the game!', canvas.width/2, canvas.height/2 + 48);
    } else {
      ctx.fillText('Connected! Raise your index finger to start', canvas.width/2, canvas.height/2 - 20);
      ctx.fillText('Each player sees their own camera', canvas.width/2, canvas.height/2 + 14);
      ctx.fillText('Slice 5 fruits per stage • Avoid 💣 bombs', canvas.width/2, canvas.height/2 + 48);
    }

    ctx.font      = '14px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('☝️ index finger = blade   ✌️ = off', canvas.width/2, canvas.height/2 + 90);
    ctx.textAlign = 'left';
  }

  // ── Game over screen ─────────────────────────────────────────
  function drawGameOverScreen(state, mode) {
    const ctx    = CameraModule.ctx;
    const canvas = CameraModule.canvas;

    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';

    ctx.font      = 'bold 46px sans-serif';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 100);

    ctx.font      = 'bold 26px sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${state.score}  •  Stage ${state.stage}`, canvas.width/2, canvas.height/2 - 40);

    ctx.font      = '20px sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`Best: ${state.highScore}`, canvas.width/2, canvas.height/2);

    if (mode === 'multi' && state.opponentScore !== undefined) {
      ctx.font      = '18px sans-serif';
      ctx.fillStyle = '#e74c3c';
      ctx.fillText(`Opponent score: ${state.opponentScore}`, canvas.width/2, canvas.height/2 + 34);

      ctx.font      = 'bold 22px sans-serif';
      ctx.fillStyle = '#f1c40f';
      const result  = state.score > state.opponentScore ? '🏆 You Win!'
                    : state.score < state.opponentScore ? '😔 Opponent Wins'
                    : '🤝 Tie!';
      ctx.fillText(result, canvas.width/2, canvas.height/2 + 70);
    }

    ctx.font      = '16px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Raise your index finger to play again', canvas.width/2, canvas.height/2 + 110);
    ctx.textAlign = 'left';
  }

  // ── Stage clear banner ───────────────────────────────────────
  function drawStageBanner(stage) {
    const ctx    = CameraModule.ctx;
    const canvas = CameraModule.canvas;

    ctx.save();
    ctx.textAlign  = 'center';
    ctx.font       = 'bold 48px sans-serif';
    ctx.fillStyle  = '#f1c40f';
    ctx.shadowColor = 'black';
    ctx.shadowBlur  = 12;
    ctx.fillText(`⭐ Stage ${stage}!`, canvas.width/2, canvas.height/2);
    ctx.restore();
  }

  function clearEffects() {
    particles = [];
    popTexts  = [];
  }

  return {
    spawnParticles, updateParticles, drawParticles,
    spawnPopText,   updatePopTexts,  drawPopTexts,
    drawBlade,
    drawHUD, drawWaitingScreen, drawGameOverScreen, drawStageBanner,
    clearEffects
  };
})();
