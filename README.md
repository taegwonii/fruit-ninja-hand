# 🍉 Fruit Ninja Hand Tracking Game

웹캠과 MediaPipe 손 인식을 활용한 Fruit Ninja 스타일 게임입니다.
손가락을 검으로 사용해서 화면에 떨어지는 과일을 슬라이스하세요!

## 🎮 Features

- 📹 실시간 웹캠 피드 (셀피 모드)
- ✋ MediaPipe 기반 손가락 추적
- 👆 검지 손가락 제스처 감지
- 🍎 떨어지는 과일 스폰
- ⚔️ 슬라이스 감지 및 점수 시스템
- 💥 게임 오버 및 사운드 효과

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

### 로컬 실행
HTTPS가 필요하므로 로컬 서버를 사용하세요.

```bash
# Python이 있다면
python3 -m http.server 8000

# 또는 Node.js의 live-server
npx live-server
```

브라우저에서 `http://localhost:8000` 접속

> ⚠️ 카메라 권한이 필요합니다. HTTPS 또는 localhost 환경에서만 작동합니다.

## 📁 Project Structure

```
fruit-ninja-hand/
├── index.html          # 메인 HTML
├── src/
│   ├── js/
│   │   ├── main.js     # 게임 엔트리 포인트
│   │   ├── camera.js   # Step 1: 카메라 모듈
│   │   ├── hands.js    # Step 2-3: MediaPipe 손 인식
│   │   ├── fruits.js   # Step 4-5: 과일 스폰 & 슬라이스
│   │   └── game.js     # Step 6: 게임 상태 관리
│   ├── css/
│   │   └── style.css
│   └── assets/
│       ├── sounds/
│       └── images/
└── docs/               # 프로젝트 문서
```

## 🌿 Branch Strategy

- `main` — 배포 가능한 안정 버전
- `develop` — 개발 통합 브랜치
- `feature/*` — 각 Step별 기능 개발

## 📝 License

MIT
