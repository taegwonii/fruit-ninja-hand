# 🛠 Development Guide

## Git Workflow (main + develop + feature)

### 브랜치 구조
```
main      ─●─────●─────●────────●───  (배포 가능한 안정 버전)
           │     │     │        │
develop   ─●──●──●──●──●──●──●──●───  (개발 통합)
              │     │     │
feature/   ●──●     │     │
step1              ●──●   │
                  step2   │
                         ●──●
                        step3
```

### 각 Step별 개발 플로우

각 단계(Step 1~6)를 개별 feature 브랜치로 작업합니다.

```bash
# 1. develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 2. feature 브랜치 생성
git checkout -b feature/step1-camera

# 3. 개발 & 커밋
git add .
git commit -m "feat(camera): 웹캠 피드 연결 및 셀피 미러링"

# 4. 원격 푸시
git push -u origin feature/step1-camera

# 5. GitHub에서 PR 생성: feature/step1-camera → develop

# 6. 머지 후 로컬 동기화
git checkout develop
git pull origin develop
git branch -d feature/step1-camera
```

### 배포 (develop → main)

Step 6 완성 또는 중간 릴리스 때:

```bash
git checkout main
git merge develop
git tag -a v0.1.0 -m "Step 1-2 완료: 카메라 + 손 추적"
git push origin main --tags
```

## Commit Message Convention

[Conventional Commits](https://www.conventionalcommits.org/) 규칙 사용:

- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 포맷 (기능 변화 X)
- `refactor:` 리팩토링
- `chore:` 빌드/설정 변경

예시:
```
feat(hands): MediaPipe 손가락 제스처 감지 추가
fix(fruits): 과일 스폰 좌표 오류 수정
docs: README에 실행 방법 추가
```

## 각 Step별 체크리스트

### Step 1 — Camera Feed
- [ ] `getUserMedia`로 웹캠 권한 요청
- [ ] video 태그에 스트림 연결
- [ ] CSS로 `scaleX(-1)` 미러링
- [ ] 에러 처리 (권한 거부 시)

### Step 2 — Hand Tracking
- [ ] MediaPipe Hands CDN 스크립트 추가
- [ ] 손 인식 초기화
- [ ] 검지 손가락 끝(landmark 8) 좌표 추출
- [ ] Canvas에 점 그리기

### Step 3 — Gesture Detection
- [ ] 검지만 펴진 상태 감지 로직
- [ ] 다른 손가락 구부림 체크
- [ ] 제스처 ON/OFF에 따라 blade 활성화

### Step 4 — Falling Fruits
- [ ] 일정 간격으로 과일 스폰
- [ ] 중력 물리 적용
- [ ] 화면 밖 과일 제거

### Step 5 — Slice Detection
- [ ] 손가락 궤적(trail) 배열 저장
- [ ] 선분-원 교차 판정
- [ ] 슬라이스 시 점수 추가 + 애니메이션

### Step 6 — Polish
- [ ] UI (점수, 목숨 표시)
- [ ] 사운드 효과
- [ ] 게임 오버 화면
- [ ] 재시작 기능
