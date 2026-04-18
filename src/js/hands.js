// hands.js
// Handles: MediaPipe Hands setup, gesture detection, blade trail management

const HandsModule = (() => {
  const TRAIL_LENGTH = 14;

  // Blade state — updated every frame by MediaPipe
  const blade = {
    active: false,
    tip:    null,   // { x, y } current fingertip position
    prev:   null,   // { x, y } previous frame fingertip position
    trail:  []      // last N positions for drawing the slash trail
  };

  // A finger is "up" if its tip Y is above its PIP (middle) joint Y
  function isFingerUp(lm, tipIdx, pipIdx) {
    return lm[tipIdx].y < lm[pipIdx].y;
  }

  // Blade gesture = ONLY index finger raised, all others curled
  function isIndexOnly(lm) {
    return  isFingerUp(lm, 8, 6)   &&   // index up
           !isFingerUp(lm, 12, 10) &&   // middle down
           !isFingerUp(lm, 16, 14) &&   // ring down
           !isFingerUp(lm, 20, 18);     // pinky down
  }

  // Update blade state from a MediaPipe landmark set
  function updateBlade(lm) {
    const canvas = CameraModule.canvas;
    const tip = lm[8];

    blade.prev   = blade.tip ? { ...blade.tip } : null;
    blade.tip    = {
      x: (1 - tip.x) * canvas.width,  // mirror to match flipped camera
      y: tip.y * canvas.height
    };
    blade.active = isIndexOnly(lm);

    if (blade.active) {
      blade.trail.push({ ...blade.tip });
      if (blade.trail.length > TRAIL_LENGTH) blade.trail.shift();
    } else {
      blade.trail  = [];
      blade.prev   = null;
    }
  }

  function resetBlade() {
    blade.active = false;
    blade.tip    = null;
    blade.prev   = null;
    blade.trail  = [];
  }

  // Set up MediaPipe Hands — maxNumHands:1 (single player only needs one)
  function setup(onResults) {
    const hands = new Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    hands.onResults(results => {
      if (results.multiHandLandmarks?.length > 0) {
        updateBlade(results.multiHandLandmarks[0]);
        document.getElementById('status').textContent = '☝️ index finger = blade';
      } else {
        resetBlade();
        document.getElementById('status').textContent = 'Show your hand to the camera...';
      }
      if (onResults) onResults(blade);
    });

    // MediaPipe camera utility feeds video frames into the model
    const mpCam = new Camera(CameraModule.video, {
      onFrame: async () => { await hands.send({ image: CameraModule.video }); },
      width: 800,
      height: 600
    });

    mpCam.start();
  }

  return { setup, blade, isIndexOnly };
})();
