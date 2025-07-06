const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 12;
const BALL_RADIUS = 10;
const PLAYER_COLOR = '#00ff99';
const AI_COLOR = '#ff0055';
const BALL_COLOR = '#fff';
const NET_COLOR = '#fff';
const NET_WIDTH = 4;
const NET_SEGMENT = 20;

// Paddle objects
let player = {
    x: PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PLAYER_COLOR,
    score: 0
};

let ai = {
    x: canvas.width - PADDLE_WIDTH - PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: AI_COLOR,
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: BALL_RADIUS,
    speed: 6,
    velocityX: 6 * (Math.random() > 0.5 ? 1 : -1),
    velocityY: 4 * (Math.random() > 0.5 ? 1 : -1),
    color: BALL_COLOR
};

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += NET_SEGMENT * 2) {
        drawRect(canvas.width / 2 - NET_WIDTH / 2, i, NET_WIDTH, NET_SEGMENT, NET_COLOR);
    }
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = '32px Arial';
    ctx.fillText(text, x, y);
}

function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#111');
    drawNet();
    drawText(player.score, canvas.width * 0.25, 60, PLAYER_COLOR);
    drawText(ai.score, canvas.width * 0.75, 60, AI_COLOR);

    // Draw paddles & ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Mouse controls for player paddle
canvas.addEventListener('mousemove', function(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Collision helper
function collisionDetect(p, b) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
    );
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 6;
    ball.velocityX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// AI movement - simple proportional controller
function moveAI() {
    let target = ball.y - (ai.height / 2);
    ai.y += (target - ai.y) * 0.08;

    // Clamp
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Main update
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Top/bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY *= -1;
    }

    // Left paddle collision
    if (collisionDetect(player, ball)) {
        ball.x = player.x + player.width + ball.radius; // place outside paddle
        // Calculate collision point
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angle = collidePoint * (Math.PI / 4); // max bounce angle = 45deg
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
        ball.speed += 0.3;
    }

    // Right paddle collision
    if (collisionDetect(ai, ball)) {
        ball.x = ai.x - ball.radius; // place outside paddle
        let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        let angle = collidePoint * (Math.PI / 4);
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
        ball.speed += 0.3;
    }

    // Left/right goal
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    moveAI();
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();