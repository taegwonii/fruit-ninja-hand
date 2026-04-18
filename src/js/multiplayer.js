// multiplayer.js
// Handles: PeerJS peer-to-peer connection, room codes, sending/receiving game data

const MultiplayerModule = (() => {
  let peer       = null;
  let conn       = null;
  let isHost     = false;
  let connected  = false;
  let onDataCb   = null;   // callback when data arrives from opponent
  let onConnCb   = null;   // callback when connection is established

  const opponentCanvas = document.getElementById('opponentCanvas');
  const opponentCtx    = opponentCanvas.getContext('2d');

  // Generate a readable 6-character room code from the peer ID
  function peerIdToCode(id) {
    return id.substring(0, 6).toUpperCase();
  }

  // Host a game — create a peer, display the room code
  function host(onConnected, onData) {
    onConnCb = onConnected;
    onDataCb = onData;
    isHost   = true;

    peer = new Peer(); // PeerJS assigns a random ID

    peer.on('open', id => {
      const code = peerIdToCode(id);
      document.getElementById('roomCodeDisplay').textContent = code;
      document.getElementById('lobbyStatus').textContent = 'Waiting for opponent to join...';
    });

    peer.on('connection', c => {
      conn = c;
      setupConn();
    });

    peer.on('error', err => {
      document.getElementById('lobbyStatus').textContent = 'Connection error: ' + err.message;
    });
  }

  // Join a game — connect to the host using their room code
  function join(code, onConnected, onData) {
    onConnCb = onConnected;
    onDataCb = onData;
    isHost   = false;

    peer = new Peer();

    peer.on('open', () => {
      // PeerJS IDs start with the code the host displayed
      // We need to find the full peer ID — we use the code as the peer ID prefix
      // by having the host use the code as their peer ID directly
      document.getElementById('lobbyStatus').textContent = 'Connecting...';
      conn = peer.connect(code.toLowerCase());
      setupConn();
    });

    peer.on('error', err => {
      document.getElementById('lobbyStatus').textContent = 'Could not connect. Check the room code.';
      console.error('PeerJS error:', err);
    });
  }

  // Host game using the room code as the peer ID so joining is easy
  function hostWithCode(onConnected, onData) {
    onConnCb = onConnected;
    onDataCb = onData;
    isHost   = true;

    // Generate a simple 6-char alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    peer = new Peer(code); // use code as peer ID so joiner can connect directly

    peer.on('open', () => {
      document.getElementById('roomCodeDisplay').textContent = code;
      document.getElementById('lobbyStatus').textContent = 'Waiting for opponent...';
    });

    peer.on('connection', c => {
      conn = c;
      setupConn();
    });

    peer.on('error', err => {
      document.getElementById('lobbyStatus').textContent = 'Error: ' + err.type + '. Try hosting again.';
      console.error(err);
    });
  }

  function joinWithCode(code, onConnected, onData) {
    onConnCb = onConnected;
    onDataCb = onData;
    isHost   = false;

    peer = new Peer();

    peer.on('open', () => {
      document.getElementById('lobbyStatus').textContent = 'Connecting to ' + code + '...';
      conn = peer.connect(code.toUpperCase());
      setupConn();
    });

    peer.on('error', err => {
      document.getElementById('lobbyStatus').textContent = 'Could not connect. Check the room code and try again.';
      console.error(err);
    });
  }

  // Wire up the data connection events
  function setupConn() {
    conn.on('open', () => {
      connected = true;
      document.getElementById('lobbyStatus').textContent = '✅ Connected! Starting soon...';
      if (onConnCb) onConnCb();
    });

    conn.on('data', data => {
      if (onDataCb) onDataCb(data);

      // Draw opponent's camera frame on the small preview canvas
      if (data.frame) {
        const img = new Image();
        img.onload = () => opponentCtx.drawImage(img, 0, 0, opponentCanvas.width, opponentCanvas.height);
        img.src = data.frame;
      }

      // Draw opponent's blade on the preview canvas
      if (data.blade && data.blade.tip) {
        const scale = opponentCanvas.width / 800;
        opponentCtx.beginPath();
        opponentCtx.arc(
          data.blade.tip.x * scale,
          data.blade.tip.y * scale,
          6, 0, Math.PI * 2
        );
        opponentCtx.fillStyle = '#f1c40f';
        opponentCtx.fill();
      }
    });

    conn.on('close', () => {
      connected = false;
      document.getElementById('lobbyStatus').textContent = 'Opponent disconnected.';
    });
  }

  // Send game state to opponent
  // We throttle camera frames to every 3 calls to save bandwidth
  let frameThrottle = 0;
  function send(data) {
    if (!conn || !connected) return;

    // Capture a low-res camera frame to send as opponent preview
    frameThrottle++;
    if (frameThrottle % 3 === 0) {
      const offscreen = document.createElement('canvas');
      offscreen.width  = 240;
      offscreen.height = 180;
      const octx = offscreen.getContext('2d');
      octx.save();
      octx.scale(-1, 1);
      octx.drawImage(CameraModule.video, -240, 0, 240, 180);
      octx.restore();
      data.frame = offscreen.toDataURL('image/jpeg', 0.4); // compressed
    }

    try { conn.send(data); } catch(e) { console.warn('Send error:', e); }
  }

  function disconnect() {
    if (conn)  { conn.close();  conn  = null; }
    if (peer)  { peer.destroy(); peer = null; }
    connected = false;
  }

  function isConnected() { return connected; }

  return {
    hostWithCode,
    joinWithCode,
    send,
    disconnect,
    isConnected
  };
})();

// ── Global lobby button handlers (called from index.html) ────
function hostGame() {
  document.getElementById('roomCodeDisplay').textContent = '...';
  MultiplayerModule.hostWithCode(
    () => {
      // Connected — start the game
      document.getElementById('opponentPanel').style.display = 'flex';
      GameModule.startMulti();
    },
    (data) => {
      // Received data from opponent
      GameModule.onOpponentData(data);
    }
  );
}

function joinGame() {
  const code = document.getElementById('roomCodeInput').value.trim();
  if (!code) {
    document.getElementById('lobbyStatus').textContent = 'Please enter a room code.';
    return;
  }
  MultiplayerModule.joinWithCode(
    code,
    () => {
      document.getElementById('opponentPanel').style.display = 'flex';
      GameModule.startMulti();
    },
    (data) => {
      GameModule.onOpponentData(data);
    }
  );
}
