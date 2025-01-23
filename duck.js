export default class Duck {
  constructor() {
    this.x = 100;
    this.y = 300;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSwimming = false;
    this.isFlying = false;
    
    // Animation properties
    this.wingAngle = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    
    // Wobble effect for hand-drawn look
    this.wobbleOffset = 0;
    this.baseX = 400;  // Start in middle
    
    // Add hitbox properties
    this.width = 15;  // Even smaller hitbox width
    this.height = 20; // Smaller hitbox height
    this.hitboxOffsetX = 10; // Offset from left edge
    this.hitboxOffsetY = 5;  // Offset from top edge
    
    this.minX = 120;  // Left boundary (after left dispenser)
    this.maxX = 680;  // Right boundary (before right dispenser)
    
    this.facingRight = true;  // New property to track direction
    this.isPecking = false;   // New property for pecking animation
    this.peckAngle = 0;      // For pecking animation
    this.peckSpeed = 0.2;    // Controls peck animation speed
    this.isWalking = true; // New property to control side-to-side movement
    
  }

  draw(ctx) {
    ctx.save();
    
    // Only do side-to-side movement if walking is enabled
    if (this.isWalking) {
      let newX = this.baseX + Math.sin(Date.now() / 1000) * 30;
      let prevX = this.x;
      this.x = Math.max(this.minX, Math.min(this.maxX, newX));
      
      // Update facing direction based on movement
      if (this.x !== prevX) {
        this.facingRight = this.x > prevX;
      }
    } else {
      this.x = this.baseX;
    }

    ctx.translate(this.x, this.y);
    
    // Flip the duck if facing left
    if (!this.facingRight) {
      ctx.scale(-1, 1);
    }

    // Update wobble for hand-drawn effect
    this.wobbleOffset = Math.sin(Date.now() / 150) * 2;

    // Wing animation with hand-drawn effect
    this.wingAngle = (this.isFlying || this.isSwimming) 
      ? Math.sin(Date.now() / 100) * 0.5 
      : Math.sin(Date.now() / 300) * 0.2;

    // Update blink animation
    if (Math.random() < 0.005 && !this.isBlinking) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }
    if (this.isBlinking) {
      this.blinkTimer++;
      if (this.blinkTimer > 10) {
        this.isBlinking = false;
      }
    }

    // Update pecking animation with improved head movement
    if (this.isPecking) {
      const peckTime = Date.now() * this.peckSpeed;
      this.peckAngle = Math.sin(peckTime) * 0.5;
      
      // Move the whole duck slightly down when pecking
      ctx.translate(0, Math.abs(Math.sin(peckTime) * 3));
    }

    // Draw wing with sketchy effect
    ctx.fillStyle = '#FFC125';
    ctx.strokeStyle = '#CC9900';
    ctx.lineWidth = 2;
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(this.wingAngle);
    
    // Sketchy wing
    ctx.beginPath();
    ctx.moveTo(-5 + this.wobbleOffset, 0);
    ctx.bezierCurveTo(
      -20 + Math.random() * 2, -5 + Math.random() * 2,
      -12 + Math.random() * 2, 15 + Math.random() * 2,
      5 + Math.random() * 2, 0 + Math.random() * 2
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Draw body (slimmer proportions)
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#CC9900';
    ctx.beginPath();
    ctx.moveTo(-15 + this.wobbleOffset, -5);  
    ctx.bezierCurveTo(
      -10 + Math.random() * 2, -15 + Math.random() * 2,  
      10 + Math.random() * 2, -15 + Math.random() * 2,
      15 + Math.random() * 2, -5 + Math.random() * 2    
    );
    ctx.bezierCurveTo(
      20 + Math.random() * 2, 15 + Math.random() * 2,   
      -10 + Math.random() * 2, 15 + Math.random() * 2,
      -15 + this.wobbleOffset, -5                       
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw sketchy head (adjusted proportions)
    ctx.save();
    if (this.isPecking) {
      // Pivot point for head rotation during pecking
      ctx.translate(12, -20);
      ctx.rotate(this.peckAngle);
      ctx.translate(-12, 20);
    }
    
    ctx.beginPath();
    ctx.moveTo(12, -20 + this.wobbleOffset);
    ctx.bezierCurveTo(
      20 + Math.random() * 2, -28 + Math.random() * 2,
      35 + Math.random() * 2, -20 + Math.random() * 2,
      28 + Math.random() * 2, -5 + Math.random() * 2
    );
    ctx.bezierCurveTo(
      20 + Math.random() * 2, 0 + Math.random() * 2,
      12 + Math.random() * 2, -12 + Math.random() * 2,
      12, -20 + this.wobbleOffset
    );
    ctx.fill();
    ctx.stroke();

    // Draw eye and beak within the same transformation
    if (!this.isBlinking) {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(25 + this.wobbleOffset, -15, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(26 + this.wobbleOffset, -15 + Math.sin(Date.now()/200), 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(22 + this.wobbleOffset, -15);
      ctx.lineTo(28 + this.wobbleOffset, -15);
      ctx.stroke();
    }

    // Draw beak with more pronounced movement during pecking
    ctx.fillStyle = '#FF8C00';
    ctx.strokeStyle = '#CC6600';
    ctx.beginPath();
    ctx.moveTo(28 + this.wobbleOffset, -13);
    ctx.lineTo(38 + Math.random() * 2, -12 + Math.random() * 2);
    ctx.lineTo(28 + this.wobbleOffset, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Draw feet
    if (!this.isSwimming) {
      ctx.strokeStyle = '#CC6600';
      ctx.lineWidth = 2;
      // Left foot
      ctx.beginPath();
      ctx.moveTo(-5, 15);
      ctx.quadraticCurveTo(
        -2 + Math.random() * 2, 
        20 + Math.random() * 2,
        0 + Math.random() * 2, 
        25 + this.wobbleOffset
      );
      ctx.stroke();
      
      // Right foot
      ctx.beginPath();
      ctx.moveTo(5, 15);
      ctx.quadraticCurveTo(
        8 + Math.random() * 2,
        20 + Math.random() * 2,
        10 + Math.random() * 2,
        25 + this.wobbleOffset
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  update() {
    if (this.isJumping) {
      this.y += this.velocityY;
      this.velocityY += 0.5;
      
      if (this.y > 480) { 
        this.y = 480;
        this.isJumping = false;
        this.velocityY = 0;
      }
    }
    
    if (this.isSwimming) {
      this.y = Math.sin(Date.now() / 500) * 10 + 300;
    }
    
    if (this.isFlying) {
      this.y += this.velocityY;
      this.velocityY = Math.sin(Date.now() / 300) * 3;
    }
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocityY = -12; 
    }
  }

  startPecking() {
    this.isPecking = true;
    this.peckSpeed = 0.01; // Slower, more deliberate pecking
    this.peckAngle = 0;
  }

  stopPecking() {
    this.isPecking = false;
    this.peckAngle = 0;
  }
}