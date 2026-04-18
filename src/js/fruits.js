// fruits.js
// Handles: fruit/bomb definitions, spawning, physics update, drawing

const FruitsModule = (() => {
  const FRUIT_TYPES = [
    { emoji: '🍎', color: '#e74c3c', radius: 30, isBomb: false },
    { emoji: '🍊', color: '#e67e22', radius: 30, isBomb: false },
    { emoji: '🍋', color: '#f1c40f', radius: 28, isBomb: false },
    { emoji: '🍇', color: '#8e44ad', radius: 28, isBomb: false },
    { emoji: '🍉', color: '#2ecc71', radius: 34, isBomb: false },
    { emoji: '🍓', color: '#c0392b', radius: 26, isBomb: false },
    { emoji: '🍑', color: '#e67e22', radius: 28, isBomb: false },
    { emoji: '🥝', color: '#27ae60', radius: 26, isBomb: false },
  ];

  const BOMB_TYPE = { emoji: '💣', color: '#2c3e50', radius: 30, isBomb: true };

  // Bombs start at stage 2, get more frequent each stage (max 35%)
  function randomType(stage) {
    const bombChance = stage >= 2 ? Math.min(0.1 + (stage - 2) * 0.05, 0.35) : 0;
    if (Math.random() < bombChance) return BOMB_TYPE;
    return FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
  }

  // Base fall speed increases per stage
  function fallSpeed(stage) {
    return 1.8 + (stage - 1) * 0.5 + Math.random() * 1.5;
  }

  // Create a new fruit object
  function create(stage, xMin, xMax) {
    const type = randomType(stage);
    const r    = type.radius;
    return {
      x:             xMin + r + Math.random() * (xMax - xMin - r * 2),
      y:             -r,
      vy:            fallSpeed(stage),
      radius:        r,
      emoji:         type.emoji,
      color:         type.color,
      isBomb:        type.isBomb,
      rotation:      Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      sliced:        false,
      missed:        false
    };
  }

  // Move fruits down, rotate them
  function update(fruits) {
    fruits.forEach(f => {
      f.y        += f.vy;
      f.rotation += f.rotationSpeed;
    });
    // Remove fruits far below the screen
    return fruits.filter(f => f.y < CameraModule.canvas.height + 80);
  }

  // Draw all fruits onto the canvas
  function draw(fruits) {
    const ctx = CameraModule.ctx;
    fruits.forEach(f => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);

      // Circle background
      ctx.beginPath();
      ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
      ctx.fillStyle  = f.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      // Red danger ring on bombs
      if (f.isBomb) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth   = 3;
        ctx.stroke();
      }

      // Emoji on top
      ctx.globalAlpha    = 1;
      ctx.font           = `${f.radius * 1.25}px sans-serif`;
      ctx.textAlign      = 'center';
      ctx.textBaseline   = 'middle';
      ctx.fillText(f.emoji, 0, 2);

      ctx.restore();
    });
  }

  return { create, update, draw };
})();
