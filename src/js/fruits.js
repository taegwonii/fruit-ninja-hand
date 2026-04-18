// fruits.js
// Handles: fruit/bomb definitions, spawning, physics update, drawing

const FruitsModule = (() => {

  // ── Canvas fruit drawers (coordinate space: centered at 0,0, unit = radius) ──

  function drawApple(ctx, r) {
    // Body
    ctx.beginPath();
    ctx.arc(0, 2, r, 0, Math.PI * 2);
    ctx.fillStyle = '#d63031';
    ctx.fill();
    ctx.strokeStyle = '#a52010';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Stem
    ctx.beginPath();
    ctx.moveTo(0, 2 - r);
    ctx.quadraticCurveTo(5, 2 - r - 10, 3, 2 - r - 14);
    ctx.strokeStyle = '#6b3a1f';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    // Leaf
    ctx.beginPath();
    ctx.ellipse(7, 2 - r - 8, 7, 4, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }

  function drawOrange(ctx, r) {
    // Body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#e67e22';
    ctx.fill();
    ctx.strokeStyle = '#ca6a10';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Segment lines
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
    // Navel dot
    ctx.beginPath();
    ctx.arc(0, r * 0.55, r * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#ca6a10';
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  }

  function drawLemon(ctx, r) {
    // Oval body
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.78, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f9ca24';
    ctx.fill();
    ctx.strokeStyle = '#d4a800';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Tip bumps
    ctx.beginPath();
    ctx.arc(0, -r, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#f9ca24';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#f9ca24';
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.arc(-r * 0.22, -r * 0.3, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }

  function drawGrapes(ctx, r) {
    const gr = r * 0.36;
    const positions = [
      [-gr * 1.1, gr * 0.6], [0, gr * 0.6], [gr * 1.1, gr * 0.6],
      [-gr * 0.55, -gr * 0.3], [gr * 0.55, -gr * 0.3],
      [0, -gr * 1.2],
    ];
    positions.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y + r * 0.1, gr, 0, Math.PI * 2);
      ctx.fillStyle = '#8e44ad';
      ctx.fill();
      ctx.strokeStyle = '#6c3483';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Highlight per grape
      ctx.beginPath();
      ctx.arc(x - gr * 0.3, y + r * 0.1 - gr * 0.3, gr * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fill();
    });
    // Stem
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(0, -r);
    ctx.strokeStyle = '#6b3a1f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawWatermelon(ctx, r) {
    // Green rind
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    // Dark green stripes
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = r * 0.2;
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 4) * i;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();
      ctx.restore();
    }
    // Red flesh (inner circle)
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    // Seeds
    const seedAngles = [0, 60, 120, 180, 240, 300];
    seedAngles.forEach(deg => {
      const a = (deg * Math.PI) / 180;
      ctx.save();
      ctx.translate(Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38);
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.065, r * 0.13, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      ctx.restore();
    });
  }

  function drawStrawberry(ctx, r) {
    // Body (rounded triangle / teardrop)
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.bezierCurveTo(-r * 1.1, r * 0.3, -r * 1.1, -r * 0.5, 0, -r * 0.4);
    ctx.bezierCurveTo(r * 1.1, -r * 0.5, r * 1.1, r * 0.3, 0, r);
    ctx.fillStyle = '#c0392b';
    ctx.fill();
    ctx.strokeStyle = '#922b21';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Seeds
    const seedPos = [
      [-r*0.3, 0], [r*0.3, 0], [0, r*0.4],
      [-r*0.5, r*0.55], [r*0.5, r*0.55],
      [0, -r*0.1], [-r*0.15, r*0.7], [r*0.15, r*0.7],
    ];
    seedPos.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r * 0.055, r * 0.09, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f9ca24';
      ctx.fill();
    });
    // Leaves
    [[-0.4, -1], [0, -1.1], [0.4, -1]].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.ellipse(lx * r, ly * r * 0.72, r * 0.18, r * 0.32, lx * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#27ae60';
      ctx.fill();
    });
  }

  function drawPeach(ctx, r) {
    // Body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#f0a07a';
    ctx.fill();
    ctx.strokeStyle = '#c97d50';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Crease
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.15, 0, 0, r * 0.85);
    ctx.strokeStyle = '#c97d50';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Stem & leaf
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, -r - 10);
    ctx.strokeStyle = '#6b3a1f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(6, -r - 6, 7, 3.5, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.28, r * 0.17, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  }

  function drawKiwi(ctx, r) {
    // Outer skin
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#6d4c1f';
    ctx.fill();
    // Inner flesh
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    ctx.fillStyle = '#5cb85c';
    ctx.fill();
    // White center
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f0e8';
    ctx.fill();
    // Seeds radiating outward
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 / 10) * i;
      ctx.save();
      ctx.translate(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.055, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      ctx.restore();
    }
    // Flesh lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 / 10) * i;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.22, Math.sin(a) * r * 0.22);
      ctx.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
      ctx.stroke();
    }
  }

  function drawBombShape(ctx, r) {
    // Body
    ctx.beginPath();
    ctx.arc(0, 4, r, 0, Math.PI * 2);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Shine
    ctx.beginPath();
    ctx.arc(-r * 0.28, 4 - r * 0.28, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    // Fuse
    ctx.beginPath();
    ctx.moveTo(r * 0.2, 4 - r);
    ctx.quadraticCurveTo(r * 0.7, 4 - r - 10, r * 0.5, 4 - r - 20);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    // Spark
    const sx = r * 0.5, sy = 4 - r - 20;
    [0, 60, 120, 180, 240, 300].forEach(deg => {
      const a = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a) * 5, sy + Math.sin(a) * 5);
      ctx.strokeStyle = '#f9ca24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // ── Type definitions ─────────────────────────────────────────
  const FRUIT_TYPES = [
    { draw: drawApple,      color: '#e74c3c', radius: 30, isBomb: false },
    { draw: drawOrange,     color: '#e67e22', radius: 30, isBomb: false },
    { draw: drawLemon,      color: '#f1c40f', radius: 28, isBomb: false },
    { draw: drawGrapes,     color: '#8e44ad', radius: 28, isBomb: false },
    { draw: drawWatermelon, color: '#2ecc71', radius: 34, isBomb: false },
    { draw: drawStrawberry, color: '#c0392b', radius: 26, isBomb: false },
    { draw: drawPeach,      color: '#f0a07a', radius: 28, isBomb: false },
    { draw: drawKiwi,       color: '#27ae60', radius: 26, isBomb: false },
  ];

  const BOMB_TYPE = { draw: drawBombShape, color: '#2c3e50', radius: 30, isBomb: true };

  function randomType(stage) {
    const bombChance = stage >= 2 ? Math.min(0.1 + (stage - 2) * 0.05, 0.35) : 0;
    if (Math.random() < bombChance) return BOMB_TYPE;
    return FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
  }

  function fallSpeed(stage) {
    return 1.8 + (stage - 1) * 0.5 + Math.random() * 1.5;
  }

  function create(stage, xMin, xMax) {
    const type = randomType(stage);
    const r    = type.radius;
    return {
      x:             xMin + r + Math.random() * (xMax - xMin - r * 2),
      y:             -r,
      vy:            fallSpeed(stage),
      radius:        r,
      draw:          type.draw,
      color:         type.color,
      isBomb:        type.isBomb,
      rotation:      Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      sliced:        false,
      missed:        false
    };
  }

  function update(fruits) {
    fruits.forEach(f => {
      f.y        += f.vy;
      f.rotation += f.rotationSpeed;
    });
    return fruits.filter(f => f.y < CameraModule.canvas.height + 80);
  }

  function draw(fruits) {
    const ctx = CameraModule.ctx;
    fruits.forEach(f => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      f.draw(ctx, f.radius);
      ctx.restore();
    });
  }

  return { create, update, draw };
})();
