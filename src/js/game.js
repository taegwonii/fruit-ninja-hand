// Step 6: Game State Management
// 점수, 목숨, 게임 오버 등 전체 게임 상태 관리

export class GameState {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
    }

    addScore(points = 1) {
        this.score += points;
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.isGameOver = true;
        }
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
    }
}
