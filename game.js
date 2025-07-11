/**
 * 贪吃蛇游戏 - 主要游戏逻辑
 */

class SnakeGame {
    constructor() {
        // 获取Canvas和上下文
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏配置
        this.gridSize = 20; // 网格大小
        this.canvasSize = 400; // Canvas尺寸
        this.gridCount = this.canvasSize / this.gridSize; // 网格数量
        
        // 游戏状态
        this.gameState = 'ready'; // ready, playing, gameover
        this.score = 0;
        this.baseSpeed = 150; // 基础速度(毫秒)
        this.currentSpeed = this.baseSpeed;
        
        // 蛇的初始状态
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 0, y: 0 }; // 当前移动方向
        this.nextDirection = { x: 0, y: 0 }; // 下一个移动方向
        
        // 食物位置
        this.food = this.generateFood();
        
        // 游戏循环定时器
        this.gameLoopId = null;
        
        // 获取DOM元素
        this.scoreElement = document.getElementById('score');
        this.statusElement = document.getElementById('status');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化游戏
     */
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.draw();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 按钮事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        // 防止方向键滚动页面
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * 处理键盘输入
     */
    handleKeyPress(event) {
        if (this.gameState !== 'playing') return;
        
        const { key } = event;
        
        // 防止反向移动
        switch (key) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.gameState = 'playing';
        this.direction = { x: 1, y: 0 }; // 初始向右移动
        this.nextDirection = { x: 1, y: 0 };
        this.updateUI();
        this.gameLoop();
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        // 清除游戏循环
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }
        
        // 重置游戏状态
        this.gameState = 'ready';
        this.score = 0;
        this.currentSpeed = this.baseSpeed;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.food = this.generateFood();
        
        // 隐藏游戏结束模态框
        this.gameOverModal.style.display = 'none';
        
        // 更新UI
        this.updateUI();
        this.draw();
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.draw();
        
        // 设置下一次循环
        this.gameLoopId = setTimeout(() => this.gameLoop(), this.currentSpeed);
    }
    
    /**
     * 更新游戏状态
     */
    update() {
        // 更新移动方向
        this.direction = { ...this.nextDirection };
        
        // 计算蛇头的新位置
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.gridCount || 
            head.y < 0 || head.y >= this.gridCount) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // 添加新头部
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateSpeed();
            this.updateUI();
        } else {
            // 如果没有吃到食物，移除尾部
            this.snake.pop();
        }
    }
    
    /**
     * 生成食物位置
     */
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    /**
     * 更新游戏速度
     */
    updateSpeed() {
        // 每得10分速度增加5%
        const speedMultiplier = 1 - (Math.floor(this.score / 100) * 0.05);
        this.currentSpeed = Math.max(this.baseSpeed * speedMultiplier, 80); // 最快80ms
    }
    
    /**
     * 游戏结束
     */
    gameOver() {
        this.gameState = 'gameover';
        this.updateUI();
        this.showGameOverModal();
    }
    
    /**
     * 显示游戏结束模态框
     */
    showGameOverModal() {
        this.finalScoreElement.textContent = this.score;
        this.gameOverModal.style.display = 'flex';
    }
    
    /**
     * 更新UI显示
     */
    updateUI() {
        this.scoreElement.textContent = this.score;
        
        // 更新状态显示
        let statusText = '';
        let statusClass = '';
        
        switch (this.gameState) {
            case 'ready':
                statusText = '准备开始';
                statusClass = 'status-ready';
                this.startBtn.style.display = 'inline-block';
                this.restartBtn.style.display = 'none';
                break;
            case 'playing':
                statusText = '游戏进行中';
                statusClass = 'status-playing';
                this.startBtn.style.display = 'none';
                this.restartBtn.style.display = 'inline-block';
                break;
            case 'gameover':
                statusText = '游戏结束';
                statusClass = 'status-gameover';
                this.startBtn.style.display = 'none';
                this.restartBtn.style.display = 'inline-block';
                break;
        }
        
        this.statusElement.textContent = statusText;
        this.statusElement.className = statusClass;
    }
    
    /**
     * 绘制游戏画面
     */
    draw() {
        // 清除画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制网格线（可选）
        // this.drawGrid();
    }
    
    /**
     * 绘制蛇
     */
    drawSnake() {
        this.snake.forEach((segment, index) => {
            // 蛇头使用不同颜色
            if (index === 0) {
                this.ctx.fillStyle = '#4CAF50'; // 绿色头部
            } else {
                this.ctx.fillStyle = '#8BC34A'; // 浅绿色身体
            }
            
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 绘制圆角矩形
            this.drawRoundedRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2, 3);
        });
    }
    
    /**
     * 绘制食物
     */
    drawFood() {
        this.ctx.fillStyle = '#F44336'; // 红色食物
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 绘制圆形食物
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2, 
            y + this.gridSize / 2, 
            (this.gridSize - 4) / 2, 
            0, 
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    /**
     * 绘制圆角矩形
     */
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 绘制网格线（调试用）
     */
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridCount; i++) {
            const pos = i * this.gridSize;
            
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvasSize);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvasSize, pos);
            this.ctx.stroke();
        }
    }
}

// 当页面加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});