// Step 4-5: Fruits Module
// 과일 스폰, 물리 이동, 슬라이스 감지

const FRUIT_EMOJIS = ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🥝', '🍑'];

export class Fruit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = -15 - Math.random() * 5;
        this.gravity = 0.4;
        this.emoji = FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];
        this.sliced = false;
    }

    update() {
        // TODO: 물리 이동 (중력 적용)
    }

    draw(ctx) {
        // TODO: Canvas에 과일 그리기
    }
}

export function checkSlice(fruit, trail) {
    // TODO: 손가락 궤적이 과일을 관통하는지 체크
    return false;
}
