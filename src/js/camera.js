// camera.js
// Handles: getUserMedia camera stream, drawing mirrored video onto canvas

const CameraModule = (() => {
  const video  = document.getElementById('video');
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');

  // Draw the mirrored camera feed as the game background
  function drawFeed() {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Start the camera stream and feed it into the <video> element
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      video.srcObject = stream;
      await new Promise(resolve => { video.onloadedmetadata = resolve; });
      document.getElementById('status').textContent = 'Camera ready — show your hand!';
    } catch (err) {
      document.getElementById('status').textContent = 'Camera error: ' + err.message;
      console.error('Camera error:', err);
    }
  }

  return { start, drawFeed, video, canvas, ctx };
})();
