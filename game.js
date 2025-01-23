import Duck from './duck.js';
import { TrainingGame } from './training.js';
import { RaceGame } from './race.js';
import { Shop } from './shop.js';

export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.duck = new Duck();
    this.currentMode = null;
    this.stats = {
      running: 1,
      swimming: 1,
      flying: 1,
      energyLevel: 1,
      coins: 0
    };

    // Add dispenser positions
    this.dispenserPositions = {
      left: { x: 100, width: 100 },
      right: { x: 600, width: 100 }
    };

    // Add audio elements
    this.eatSound = document.getElementById('eatSound');
    this.clickSound = document.getElementById('clickSound');
    this.backgroundMusic = document.getElementById('backgroundMusic');
    
    // Start background music
    this.backgroundMusic.volume = 0.5;
    this.backgroundMusic.play();
    
    this.setupEventListeners();
    this.updateStats();
    this.setupMenu();
    this.setupDispensers();
    
    // Start with menu animation
    this.animateMenu();
  }

  setupMenu() {
    const menuBackground = document.createElement('div');
    menuBackground.className = 'menu-background';
    document.getElementById('game').appendChild(menuBackground);

    const grass = document.createElement('div');
    grass.className = 'grass';
    menuBackground.appendChild(grass);

    const smallGrass = document.createElement('div');
    smallGrass.className = 'small-grass';
    grass.appendChild(smallGrass);
  }

  setupDispensers() {
    // Create left dispenser
    const leftDispenser = document.createElement('div');
    leftDispenser.className = 'dispenser';
    leftDispenser.style.left = '100px';
    leftDispenser.style.bottom = '120px';
    document.getElementById('game').appendChild(leftDispenser);

    // Create right dispenser
    const rightDispenser = document.createElement('div');
    rightDispenser.className = 'dispenser';
    rightDispenser.style.right = '100px';
    rightDispenser.style.bottom = '120px';
    document.getElementById('game').appendChild(rightDispenser);

    this.setupDispenserInteraction(leftDispenser);
    this.setupDispenserInteraction(rightDispenser);
  }

  setupDispenserInteraction(dispenser) {
    dispenser.addEventListener('click', () => {
      if (this.currentMode !== null) return;
      this.clickSound.currentTime = 0;
      this.clickSound.play();
      
      const food = document.createElement('div');
      food.className = 'food';
      food.style.top = '10px';
      food.style.left = '35px';  
      dispenser.appendChild(food);

      const dispenserRect = dispenser.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      const dispenserCenterX = dispenserRect.left + (dispenserRect.width / 2) - canvasRect.left;
      const targetX = dispenserCenterX;

      // Store the original walking behavior
      const originalBaseX = this.duck.baseX;
      const originalWalking = this.duck.isWalking;
      this.duck.isWalking = false; // Stop side-to-side movement

      // Drop food animation
      setTimeout(() => {
        food.style.top = '240px'; // Drop to ground level
        
        // Move duck to food
        const moveToFood = () => {
          const duckCenterX = this.duck.x + (this.duck.width / 2);
          const distance = targetX - duckCenterX;
          
          if (Math.abs(distance) > 5) {
            this.duck.baseX += Math.sign(distance) * 3;
            this.duck.facingRight = distance > 0;
            requestAnimationFrame(moveToFood);
          } else {
            // Duck has reached the food - start pecking
            this.duck.startPecking();
            
            // Start food eating animation
            let bites = 0;
            const totalBites = 5;
            const eatInterval = setInterval(() => {
              bites++;
              food.style.clipPath = `polygon(${bites * 20}% 0%, 100% 0%, 100% 100%, ${bites * 20}% 100%)`;
              
              if (bites >= totalBites) {
                clearInterval(eatInterval);
                this.stats.energyLevel++;  
                this.updateStats();
                this.duck.stopPecking();
                food.remove();
                
                // Walk back animation
                const walkBack = () => {
                  const distanceToOriginal = originalBaseX - this.duck.baseX;
                  if (Math.abs(distanceToOriginal) > 5) {
                    this.duck.baseX += Math.sign(distanceToOriginal) * 3;
                    this.duck.facingRight = distanceToOriginal > 0;
                    requestAnimationFrame(walkBack);
                  } else {
                    // Restore original position and behavior
                    this.duck.baseX = originalBaseX;
                    this.duck.isWalking = originalWalking;
                  }
                };
                
                walkBack();
              }
              
              // Play eating sound for each bite
              this.eatSound.currentTime = 0;
              this.eatSound.play();
            }, 400);
          }
        };

        // Wait for food to drop before moving duck
        setTimeout(() => {
          moveToFood();
        }, 500);
      }, 100);
    });
  }

  animateMenu() {
    if (this.currentMode === null) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.drawClouds();
      
      this.duck.y = this.canvas.height - 120; 
      
      this.duck.update();
      this.duck.draw(this.ctx);
      
      requestAnimationFrame(() => this.animateMenu());
    }
  }

  drawClouds() {
    const time = Date.now() / 2000;
    
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(200 + Math.sin(time) * 50, 100, 30, 0, Math.PI * 2);
    this.ctx.arc(240 + Math.sin(time) * 50, 100, 40, 0, Math.PI * 2);
    this.ctx.arc(280 + Math.sin(time) * 50, 100, 30, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(500 + Math.cos(time) * 50, 150, 30, 0, Math.PI * 2);
    this.ctx.arc(540 + Math.cos(time) * 50, 150, 40, 0, Math.PI * 2);
    this.ctx.arc(580 + Math.cos(time) * 50, 150, 30, 0, Math.PI * 2);
    this.ctx.fill();
  }

  setupEventListeners() {
    const playClickSound = () => {
      this.clickSound.currentTime = 0;
      this.clickSound.play();
    };

    document.getElementById('trainRunning').addEventListener('click', () => {
      playClickSound();
      if (this.currentMode !== null) return;
      this.startTraining('running');
    });
    
    document.getElementById('trainSwimming').addEventListener('click', () => {
      playClickSound();
      if (this.currentMode !== null) return;
      this.startTraining('swimming');
    });
    
    document.getElementById('trainFlying').addEventListener('click', () => {
      playClickSound();
      if (this.currentMode !== null) return;
      this.startTraining('flying');
    });
    
    document.getElementById('race').addEventListener('click', () => {
      playClickSound();
      if (this.currentMode !== null) return;
      this.startRace();
    });
    
    document.getElementById('shop').addEventListener('click', () => {
      playClickSound();
      if (this.currentMode !== null) return;
      this.openShop();
    });
  }

  startTraining(type) {
    if (this.stats.energyLevel < 1) {  
      alert('Not enough energy! Visit the dispensers to get food and recover energy.');
      return;
    }
    
    this.currentMode = new TrainingGame(this.canvas, this.ctx, type, this.duck, () => {
      this.stats[type]++;
      this.stats.energyLevel = Math.max(0, this.stats.energyLevel - 1);  
      this.updateStats();
      this.currentMode = null;
      this.animateMenu();
    });
  }

  startRace() {
    this.currentMode = new RaceGame(this.canvas, this.ctx, this.duck, this.stats, (coins) => {
      this.stats.coins += coins;
      this.updateStats();
      this.currentMode = null;
      this.animateMenu();
    });
  }

  openShop() {
    new Shop(this.stats, () => {
      this.updateStats();
    });
  }

  updateStats() {
    document.getElementById('runningLevel').textContent = this.stats.running;
    document.getElementById('swimmingLevel').textContent = this.stats.swimming;
    document.getElementById('flyingLevel').textContent = this.stats.flying;
    document.getElementById('energy').textContent = this.stats.energyLevel;  
    document.getElementById('coins').textContent = this.stats.coins;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
});