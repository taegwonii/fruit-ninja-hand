# 🍉 Fruit Ninja Hand Tracking Game

A Fruit Ninja-style game powered by webcam and MediaPipe hand tracking.
Use your finger as a blade to slice falling fruits!

## 🎮 Features

- 📹 Real-time webcam feed (selfie mirror mode)
- ✋ MediaPipe-based finger tracking
- 👆 Index finger gesture detection
- 🍎 Falling fruit spawning system
- ⚔️ Slice detection and scoring
- 💥 Game over screen and sound effects

## 🛠 Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- CSS3

## 📋 Development Roadmap

- [ ] **Step 1** — Camera feed on screen (mirrored selfie mode)
- [ ] **Step 2** — Hand tracking dot on index fingertip
- [ ] **Step 3** — Gesture detection (index finger raised)
- [ ] **Step 4** — Falling fruits (emoji/circles)
- [ ] **Step 5** — Slice detection with fingertip trail
- [ ] **Step 6** — Polish (score, lives, sounds, graphics)

## 🚀 Getting Started

### Run Locally
HTTPS is required for webcam access, so use a local server.

```bash
# If you have Python
python3 -m http.server 8000

# Or use Node.js live-server
npx live-server
```

Open `http://localhost:8000` in your browser.

> ⚠️ Camera permission is required. Only works on HTTPS or localhost environments.

## 📁 Project Structure

```
fruit-ninja-hand/
├── index.html          # Main HTML
├── src/
│   ├── js/
│   │   ├── main.js     # Game entry point
│   │   ├── camera.js   # Step 1: Camera module
│   │   ├── hands.js    # Step 2-3: MediaPipe hand tracking
│   │   ├── fruits.js   # Step 4-5: Fruit spawning & slice detection
│   │   └── game.js     # Step 6: Game state management
│   ├── css/
│   │   └── style.css
│   └── assets/
│       ├── sounds/
│       └── images/
└── docs/               # Project documentation
```

## 🌿 Branch Strategy

- `main` — Stable, deployable version
- `develop` — Development integration branch
- `feature/*` — Feature branches for each Step

## 📝 License

MIT
