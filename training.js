export class TrainingGame {
  constructor(canvas, ctx, type, duck, onComplete) {
    if (type === 'running') {
      // Create locked notification screen
      const lockedScreen = document.createElement('div');
      lockedScreen.className = 'locked-screen';
      lockedScreen.innerHTML = `
        <div class="locked-content">
          <h2>🚧 Training Area Closed 🚧</h2>
          <p>Our ducks are hard at work upgrading the running track!</p>
          <p>⚠️ Under Construction ⚠️</p>
          <p>We're adding more exciting obstacles and challenges.</p>
          <p>Please waddle back later when construction is complete!</p>
          <button class="close-button">Got it, I'll come back later! 🦆</button>
        </div>
      `;
      
      document.body.appendChild(lockedScreen);

      const closeButton = lockedScreen.querySelector('.close-button');
      closeButton.addEventListener('click', () => {
        if (lockedScreen && lockedScreen.parentNode) {
          lockedScreen.remove();
        }
        onComplete();
      });

      return;
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.type = type;
    this.duck = duck;
    this.onComplete = onComplete;
    
    // Hide stats and dispensers
    document.getElementById('stats').style.display = 'none';
    document.querySelectorAll('.dispenser').forEach(d => d.style.display = 'none');
    
    if (type === 'swimming') {
      // Add pool background
      const pool = document.createElement('div');
      pool.className = 'swimming-pool';
      document.getElementById('game').appendChild(pool);
      
      // Add water surface
      const surface = document.createElement('div');
      surface.className = 'water-surface';
      pool.appendChild(surface);
      
      // Add pool lanes
      for (let i = 0; i < 3; i++) {
        const lane = document.createElement('div');
        lane.className = 'pool-lane';
        lane.style.top = `${(i * 33) + 17}%`;
        pool.appendChild(lane);
      }
      
      this.waterLevel = this.canvas.height - 300;
      this.duck.isSwimming = true;
      
      // Set up lanes
      this.lanes = [
        this.canvas.height * 0.3,  // Top lane
        this.canvas.height * 0.5,  // Middle lane
        this.canvas.height * 0.7   // Bottom lane
      ];
      this.currentLane = 1;  // Start in middle lane
      this.duck.y = this.lanes[this.currentLane];
      
      // Initialize score display
      this.scoreDisplay = document.createElement('div');
      this.scoreDisplay.className = 'swimming-score';
      this.scoreDisplay.textContent = 'Score: 0';
      document.getElementById('game').appendChild(this.scoreDisplay);
      
      // Reset duck position for swimming - moved more to left like Subway Surfers
      this.duck.x = 100;
      this.duck.baseX = 100;
      this.duck.facingRight = true;
      this.duck.isWalking = false;
    }
    
    this.obstacles = [];
    this.score = 0;
    this.gameOver = false;
    this.spawnTimer = 0;
    
    this.setupControls();
    this.gameLoop();
  }

  setupControls() {
    this.handleKeyDown = (e) => {
      if (this.gameOver) return;
      
      if (this.type === 'swimming') {
        if (e.code === 'ArrowUp' && this.currentLane > 0) {
          // Smoother lane transition
          const prevLane = this.currentLane;
          this.currentLane--;
          // Animate the duck's vertical movement
          const startY = this.duck.y;
          const endY = this.lanes[this.currentLane];
          const duration = 200; // ms
          const startTime = Date.now();
          
          const animateLaneChange = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth movement
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.duck.y = startY + (endY - startY) * eased;
            
            if (progress < 1) {
              requestAnimationFrame(animateLaneChange);
            }
          };
          
          requestAnimationFrame(animateLaneChange);
        } else if (e.code === 'ArrowDown' && this.currentLane < 2) {
          // Similar smooth animation for downward movement
          const prevLane = this.currentLane;
          this.currentLane++;
          const startY = this.duck.y;
          const endY = this.lanes[this.currentLane];
          const duration = 200;
          const startTime = Date.now();
          
          const animateLaneChange = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.duck.y = startY + (endY - startY) * eased;
            
            if (progress < 1) {
              requestAnimationFrame(animateLaneChange);
            }
          };
          
          requestAnimationFrame(animateLaneChange);
        }
      }
    };
    
    window.addEventListener('keydown', this.handleKeyDown);
  }

  generateObstacle() {
    if (this.type === 'swimming') {
      const types = ['fish', 'ring', 'seaweed'];
      const type = types[Math.floor(Math.random() * types.length)];
      const lane = Math.floor(Math.random() * 3);
      
      return {
        x: this.canvas.width,
        y: this.lanes[lane],
        width: type === 'ring' ? 60 : 40,
        height: type === 'seaweed' ? 80 : 30,
        type: type,
        lane: lane,
        passed: false
      };
    }
  }

  drawObstacle(obstacle) {
    const element = document.createElement('div');
    element.className = `swimming-obstacle ${obstacle.type}`;
    element.style.top = `${obstacle.y}px`;
    element.style.left = `${obstacle.x}px`;
    document.getElementById('game').appendChild(element);
    obstacle.element = element;
  }

  showGameOver() {
    // Remove any existing game over screen first
    const existingGameOver = document.querySelector('.game-over');
    if (existingGameOver) {
      existingGameOver.remove();
    }

    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    
    const coins = this.score * 5;
    let increase = Math.floor(this.score / 10);
    
    gameOverDiv.innerHTML = `
      <h2>Game Over!</h2>
      <div class="stats">Coins earned: ${coins}</div>
      <div class="stats">Swimming level increased by ${increase}</div>
      <button class="continue-button">Continue</button>
    `;
    
    document.body.appendChild(gameOverDiv);

    const continueButton = gameOverDiv.querySelector('.continue-button');
    continueButton.addEventListener('click', () => {
      if (gameOverDiv && gameOverDiv.parentNode) {
        gameOverDiv.remove();
      }
      
      this.cleanup();
      this.onComplete(coins, increase);
    });
  }

  checkCollision(duck, obstacle) {
    const duckX = duck.x + duck.hitboxOffsetX;
    const duckY = duck.y + duck.hitboxOffsetY;
    
    const hitboxWidth = duck.width - 10;  // Smaller hitbox
    const hitboxHeight = duck.height - 10;  // Smaller hitbox
    
    return (duckX < (obstacle.x + obstacle.width) &&
           (duckX + hitboxWidth) > obstacle.x &&
           duckY < (obstacle.y + obstacle.height) &&
           (duckY + hitboxHeight) > obstacle.y);
  }

  gameLoop() {
    if (this.gameOver) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Generate new obstacle
    if (Math.random() < 0.02) {
      const obstacle = this.generateObstacle();
      this.drawObstacle(obstacle);
      this.obstacles.push(obstacle);
    }
    
    // Update and check obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= 5;
      
      if (obstacle.element) {
        obstacle.element.style.transform = `translateX(${obstacle.x}px)`;
      }
      
      // Check collision
      if (this.checkCollision(this.duck, obstacle)) {
        this.gameOver = true;
        this.showGameOver();
        return;
      }
      
      // Update score
      if (!obstacle.passed && obstacle.x < this.duck.x) {
        obstacle.passed = true;
        this.score++;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
      }
      
      // Remove off-screen obstacles
      if (obstacle.x < -100) {
        if (obstacle.element && obstacle.element.parentNode) {
          obstacle.element.remove();
        }
        this.obstacles.splice(i, 1);
      }
    }
    
    this.duck.update();
    this.duck.draw(this.ctx);
    
    if (!this.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    document.getElementById('stats').style.display = 'block';
    document.querySelectorAll('.dispenser').forEach(d => d.style.display = 'block');
    
    // Clean up swimming elements
    const pool = document.querySelector('.swimming-pool');
    if (pool) pool.remove();
    
    const score = document.querySelector('.swimming-score');
    if (score) score.remove();
    
    // Remove all obstacles
    this.obstacles.forEach(obstacle => {
      if (obstacle.element && obstacle.element.parentNode) {
        obstacle.element.remove();
      }
    });
    
    // Reset duck state
    this.duck.isSwimming = false;
    this.duck.isWalking = true;
    this.duck.x = 400;
    this.duck.baseX = 400;
  }
}