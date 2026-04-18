// game.js
// Handles: game state machine, score, lives, stages, collision detection

const GameModule = (() => {
  const FRUITS_PER_STAGE = 5;   // slices needed to advance one stage
  const BOMB_START_STAGE = 2;   // bombs appear from this stage onward

  const STATE = {
    WAITING:  'waiting',
    PLAYING:  'playing',
    GAMEOVER: 'gameover'
  };

  let gameState      = STATE.WAITING;
  let score          = 0;
  let lives          = 3;
  let stage          = 1;
  let slicedThisStage = 0;
  let highScore      = 0;
  let frameCount     = 0;
  let fruits         = [];
  let stageBannerTimer = 0;  // frames to show the stage banner

  // Multiplayer
  let mode           = 'single';
  let opponentScore  = undefined;

  // Spawn interval shrinks each stage (faster spawns = harder)
  function spawnInterval() {
    return Math.max(30, 85 - (stage - 1) * 10);
  }

  // ── Collision ─────────────────────────────────────────────────
  // Check if the line from prev→tip passes through a fruit's circle
  function lineIntersectsCircle(x1,y1,x2,y2,cx,cy,r) {
    const dx=x2-x1, dy=y2-y1, fx=x1-cx, fy=y1-cy;
    const a=dx*dx+dy*dy, b=2*(fx*dx+fy*dy), c=fx*fx+fy*fy-r*r;
    let disc=b*b-4*a*c;
    if (disc < 0) return false;
    disc = Math.sqrt(disc);
    const t1 = (-b-disc)/(2*a);
    const t2 = (-b+disc)/(2*a);
    return (t1>=0&&t1<=1)||(t2>=0&&t2<=1);
  }

  function checkSlices(blade) {
    if (!blade.active || !blade.tip || !blade.prev) return;

    fruits.forEach(f => {
      if (f.sliced) return;

      if (lineIntersectsCircle(
        blade.prev.x, blade.prev.y,
        blade.tip.x,  blade.tip.y,
        f.x, f.y, f.radius
      )) {
        f.sliced = true;

        if (f.isBomb) {
          // Bomb hit — instant game over
          UIModule.spawnParticles(f.x, f.y, '#e74c3c');
          UIModule.spawnPopText(f.x, f.y - 50, '💥 BOOM!', '#e74c3c');
          lives = 0;
          triggerGameOver();
        } else {
          score++;
          slicedThisStage++;
          UIModule.spawnParticles(f.x, f.y, f.color);
          UIModule.spawnPopText(f.x, f.y - f.radius - 10, '+1', 'white');

          // Stage advance
          if (slicedThisStage >= FRUITS_PER_STAGE) {
            stage++;
            slicedThisStage = 0;
            stageBannerTimer = 90; // show banner for 90 frames
            UIModule.spawnPopText(
              CameraModule.canvas.width / 2,
              CameraModule.canvas.height / 2 - 20,
              `⭐ Stage ${stage}!`, '#f1c40f'
            );
          }
        }
      }
    });

    fruits = fruits.filter(f => !f.sliced);
  }

  function updateFruits() {
    frameCount++;

    // Spawn new fruit on interval
    if (frameCount % spawnInterval() === 0) {
      fruits.push(FruitsModule.create(stage, 0, CameraModule.canvas.width));
    }

    fruits = FruitsModule.update(fruits);

    // Check for missed fruits (fell off bottom)
    fruits.forEach(f => {
      if (!f.missed && !f.isBomb && f.y - f.radius > CameraModule.canvas.height) {
        f.missed = true;
        lives--;
        UIModule.spawnPopText(f.x, CameraModule.canvas.height - 50, '✗ Miss!', '#e74c3c');
        if (lives <= 0) triggerGameOver();
      }
    });

    fruits = fruits.filter(f => !f.missed);
  }

  function triggerGameOver() {
    gameState = STATE.GAMEOVER;
    if (score > highScore) highScore = score;
    fruits = [];
    UIModule.clearEffects();
  }

  function reset() {
    score           = 0;
    lives           = 3;
    stage           = 1;
    slicedThisStage = 0;
    frameCount      = 0;
    fruits          = [];
    stageBannerTimer = 0;
    opponentScore   = undefined;
    UIModule.clearEffects();
    gameState = STATE.WAITING;
  }

  // ── Public update — called from main loop ─────────────────────
  function update(blade) {
    if (gameState === STATE.PLAYING) {
      updateFruits();
      UIModule.updateParticles();
      UIModule.updatePopTexts();
      checkSlices(blade);
      if (stageBannerTimer > 0) stageBannerTimer--;
    }
  }

  // ── Public draw — called from main loop ───────────────────────
  function draw(blade) {
    const hudState = {
      score, lives, stage, slicedThisStage, highScore,
      bladeActive: blade.active,
      opponentScore
    };

    if (gameState === STATE.PLAYING) {
      FruitsModule.draw(fruits);
      UIModule.drawParticles();
      UIModule.drawPopTexts();
      UIModule.drawBlade(blade);
      if (stageBannerTimer > 0) UIModule.drawStageBanner(stage);
      UIModule.drawHUD(hudState);

    } else if (gameState === STATE.WAITING) {
      UIModule.drawBlade(blade);
      UIModule.drawWaitingScreen(mode);
      if (blade.active) {
        gameState  = STATE.PLAYING;
        frameCount = 0;
      }

    } else if (gameState === STATE.GAMEOVER) {
      UIModule.drawBlade(blade);
      UIModule.drawGameOverScreen(hudState, mode);
      if (blade.active) reset();
    }
  }

  // ── Multiplayer hooks ────────────────────────────────────────
  function startMulti() {
    mode = 'multi';
    reset();
  }

  function onOpponentData(data) {
    if (data.score !== undefined) opponentScore = data.score;
  }

  function setMode(m) {
    mode = m;
    reset();
  }

  return {
    update, draw, reset, setMode, startMulti, onOpponentData,
    FRUITS_PER_STAGE,
    getState: () => gameState,
    getScore: () => score,
    getStage: () => stage,
    getLives: () => lives,
    isPlaying: () => gameState === STATE.PLAYING
  };
})();
