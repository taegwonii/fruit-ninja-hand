// main.js
// Entry point — initialises everything and runs the main game loop

let currentMode = 'single';

// ── Mode switcher (called from index.html buttons) ───────────
function setMode(m) {
  currentMode = m;
  GameModule.setMode(m);

  document.getElementById('btnSingle').className = m === 'single' ? 'active' : '';
  document.getElementById('btnMulti').className  = m === 'multi'  ? 'active' : '';
  document.getElementById('lobby').style.display = m === 'multi'  ? 'flex'   : 'none';

  // Hide opponent panel when switching back to single
  if (m === 'single') {
    document.getElementById('opponentPanel').style.display = 'none';
    MultiplayerModule.disconnect();
  }
}

// ── Main game loop ───────────────────────────────────────────
function gameLoop() {
  // 1. Draw mirrored camera feed as background
  CameraModule.drawFeed();

  // 2. Get current blade state from hand tracking
  const blade = HandsModule.blade;

  // 3. Update game logic
  GameModule.update(blade);

  // 4. Draw everything
  GameModule.draw(blade);

  // 5. In multiplayer, send our state to opponent each frame
  if (currentMode === 'multi' && MultiplayerModule.isConnected()) {
    MultiplayerModule.send({
      score: GameModule.getScore(),
      stage: GameModule.getStage(),
      blade: {
        active: blade.active,
        tip:    blade.tip
      }
    });
  }

  requestAnimationFrame(gameLoop);
}

// ── Boot ─────────────────────────────────────────────────────
(async () => {
  await CameraModule.start();          // start camera
  HandsModule.setup();                 // start MediaPipe hand tracking
  gameLoop();                          // start the game loop
})();
