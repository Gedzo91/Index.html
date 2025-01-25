// First ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get all required DOM elements with null checks
  const poop = document.querySelector('.poop');
  const particleContainer = document.querySelector('.particle-container');
  const scoreElement = document.querySelector('.score span');
  const comboMeter = document.querySelector('.combo-meter');
  const multiplierElement = document.querySelector('.multiplier');
  const achievementElement = document.querySelector('.achievement');
  const chaosElement = document.querySelector('.chaos-mode');

  // Guard clause if required elements don't exist
  if (!poop || !particleContainer || !scoreElement || 
      !comboMeter || !multiplierElement || !achievementElement || !chaosElement) {
    console.error('Required DOM elements not found');
    return;
  }

  let isHappy = false;
  let score = 0;
  let clickCombo = 0;
  let lastClickTime = 0;
  let sparkles = [];
  let multiplier = 1;
  let partyMode = false;
  let chaosMode = false;
  let rgbMode = false;

  const achievements = [
    { score: 1000, message: "Pooptastic!" },
    { score: 5000, message: "Super Pooper!" },
    { score: 10000, message: "Poop Master!" },
    { score: 50000, message: "LEGENDARY POOPER!!!" }
  ];

  function showAchievement(message) {
    achievementElement.textContent = message;
    achievementElement.classList.add('show');
    setTimeout(() => {
      achievementElement.classList.remove('show');
    }, 2000);
  }

  function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = `particle ${rgbMode ? 'rgb' : ''}`;
    if (clickCombo > 15) particle.classList.add('rainbow');
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.background = rgbMode ? null : getRandomColor();
    particle.style.borderRadius = '50%';
    particleContainer.appendChild(particle);
    
    setTimeout(() => particle.remove(), 1000);
    
    if (clickCombo > 8) {
      createSparkle(x - 10 + Math.random() * 20, y - 10 + Math.random() * 20);
    }
  }

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 500);
  }

  function createChaosParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle chaos rainbow';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = Math.random() * 20 + 10 + 'px';
    particle.style.height = particle.style.width;
    particleContainer.appendChild(particle);
    
    setTimeout(() => particle.remove(), 500);
  }

  function createUltraChaosParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle ultra';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = Math.random() * 30 + 20 + 'px';
    particle.style.height = particle.style.width;
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    particleContainer.appendChild(particle);
    
    setTimeout(() => particle.remove(), 500);
  }

  function getRandomColor() {
    const colors = ['#8b4513', '#a1887f', '#3e2723', '#795548'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function updateComboMeter() {
    const percentage = Math.min((clickCombo / 10) * 100, 100);
    comboMeter.style.setProperty('--combo-width', `${percentage}%`);
    
    // Update multiplier
    multiplier = Math.floor(clickCombo / 5) + 1;
    multiplierElement.textContent = `x${multiplier}`;
    
    if (clickCombo >= 20 && !partyMode) {
      partyMode = true;
      poop.classList.add('party-mode');
      showAchievement("PARTY MODE ACTIVATED!!!");
    }
  }

  function toggleChaosMode() {
    if (clickCombo >= 30) {
      chaosMode = true;
      chaosElement.classList.add('active');
      poop.classList.add('chaos-spin');
      poop.classList.add('ultra-chaos');
      document.body.classList.add('screen-shake');
      showAchievement("ULTIMATE CHAOS MODE ACTIVATED!!!");
      
      // Create even more explosive particle burst
      for (let i = 0; i < 200; i++) {
        setTimeout(() => {
          const angle = (i / 200) * Math.PI * 4;
          const radius = Math.random() * 300 + 100;
          const x = window.innerWidth/2 + Math.cos(angle) * radius;
          const y = window.innerHeight/2 + Math.sin(angle) * radius;
          createUltraChaosParticle(x, y);
        }, i * 10);
      }
    } else {
      chaosMode = false;
      chaosElement.classList.remove('active');
      poop.classList.remove('chaos-spin', 'ultra-chaos');
      document.body.classList.remove('screen-shake');
    }
  }

  function toggleRGBMode() {
    if (clickCombo >= 25) {
      rgbMode = true;
      poop.classList.add('rgb-mode');
      document.querySelector('.poop-container').classList.add('rgb');
      scoreElement.classList.add('rgb-text');
      multiplierElement.classList.add('rgb-text');
      comboMeter.classList.add('rgb-border');
      showAchievement("🌈 RGB MODE ACTIVATED! 🌈");
    } else {
      rgbMode = false;
      poop.classList.remove('rgb-mode');
      document.querySelector('.poop-container').classList.remove('rgb');
      scoreElement.classList.remove('rgb-text');
      multiplierElement.classList.remove('rgb-text');
      comboMeter.classList.remove('rgb-border');
    }
  }

  function originalMakeItRain(e) {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 300) {
      clickCombo++;
    } else {
      clickCombo = 1;
      partyMode = false;
      poop.classList.remove('party-mode');
    }
    lastClickTime = currentTime;

    updateComboMeter();

    const rect = poop.getBoundingClientRect();
    const particleCount = Math.min(clickCombo * 5, 50);
    
    for (let i = 0; i < particleCount; i++) {
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + rect.height;
      createParticle(x, y);
    }
    
    if (clickCombo > 8) {
      poop.classList.add('mega-happy');
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 100;
        const x = rect.left + rect.width/2 + Math.cos(angle) * radius;
        const y = rect.top + rect.height/2 + Math.sin(angle) * radius;
        createSparkle(x, y);
      }
    } else {
      poop.classList.remove('mega-happy');
    }
    
    poop.style.animation = 'shake 0.5s infinite';
    setTimeout(() => {
      poop.style.animation = '';
    }, 1000);
    
    score += clickCombo * 100 * multiplier;
    scoreElement.textContent = score;
    
    // Check achievements
    achievements.forEach(achievement => {
      if (score >= achievement.score) {
        showAchievement(achievement.message);
      }
    });
    
    isHappy = !isHappy;
    poop.classList.toggle('happy');
    if (clickCombo > 5) {
      poop.classList.add('super-happy');
      setTimeout(() => poop.classList.remove('super-happy'), 2000);
    }
    
    if (clickCombo >= 30) {
      toggleChaosMode();
    }
    
    if (chaosMode) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      createChaosParticle(x, y);
    }
  };

  function makeItRain(e) {
    // Add RGB explosion effect
    const rgbExplosion = document.createElement('div');
    rgbExplosion.className = 'rgb-explosion';
    rgbExplosion.style.left = (e?.clientX || window.innerWidth/2) + 'px';
    rgbExplosion.style.top = (e?.clientY || window.innerHeight/2) + 'px';
    document.body.appendChild(rgbExplosion);
    setTimeout(() => rgbExplosion.remove(), 500);

    // Create RGB shockwave
    const shockwave = document.createElement('div');
    shockwave.className = 'rgb-shockwave';
    shockwave.style.left = (e?.clientX || window.innerWidth/2) + 'px';
    shockwave.style.top = (e?.clientY || window.innerHeight/2) + 'px';
    document.body.appendChild(shockwave);
    setTimeout(() => shockwave.remove(), 1000);

    // Always enable RGB mode
    rgbMode = true;
    poop.classList.add('rgb-mode');
    document.querySelector('.poop-container').classList.add('rgb');
    scoreElement.classList.add('rgb-text');
    multiplierElement.classList.add('rgb-text');
    comboMeter.classList.add('rgb-border');

    originalMakeItRain(e);
  }

  // Call makeItRain initially to enable RGB effects
  makeItRain();

  // Add floating RGB particles constantly
  setInterval(() => {
    if (rgbMode) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const particle = document.createElement('div');
      particle.className = 'particle rgb-ultra';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particleContainer.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }
  }, 100);

  // Add keyboard support with safeguards
  document.addEventListener('keydown', (e) => {
    if (!poop) return; // Guard clause
    makeItRain();
  });

  // Make the poop respond to rapid clicking with extra effects
  let clickTimer = null;
  let clickCount = 0;

  poop.addEventListener('click', (e) => {
    if (!clickTimer) {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        clickCount = 0;
      }, 500);
    }
    
    clickCount++;
    
    if (clickCount > 5) {
      poop.classList.add('ultra-chaos');
      setTimeout(() => poop.classList.remove('ultra-chaos'), 500);
    }
    
    makeItRain(e);
  });

  setInterval(() => {
    if (poop && !poop.classList.contains('super-happy') && !poop.classList.contains('mega-happy')) {
      poop.classList.add('wink');
      setTimeout(() => poop.classList.remove('wink'), 300);
    }
  }, 3000);

  // Auto-decrease combo meter
  setInterval(() => {
    if (clickCombo > 0 && Date.now() - lastClickTime > 1000) {
      clickCombo = Math.max(0, clickCombo - 1);
      updateComboMeter();
    }
  }, 1000);

  // Make background effects even more intense
  setInterval(() => {
    if (rgbMode) {
      const hue = (Date.now() / 10) % 360;
      document.body.style.backgroundColor = `hsl(${hue}, 70%, 90%)`;
      document.body.style.transition = 'background-color 0.1s';
    } else if (chaosMode) {
      const hue = Math.random() * 360;
      const saturation = Math.random() * 50 + 50;
      const lightness = Math.random() * 20 + 70;
      document.body.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      document.body.style.transition = 'background-color 0.1s';
    } else {
      document.body.style.backgroundColor = '#f0f0f0';
      document.body.style.transition = 'background-color 0.5s';
    }
  }, 16);

  const trail = document.createElement('div');
  trail.className = 'rgb-trails';
  document.body.appendChild(trail);

  let mousePos = { x: 0, y: 0 };
  document.addEventListener('mousemove', (e) => {
    if (rgbMode) {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      
      const dot = document.createElement('div');
      dot.className = 'particle rgb-ultra';
      dot.style.left = mousePos.x + 'px';
      dot.style.top = mousePos.y + 'px';
      dot.style.width = '10px';
      dot.style.height = '10px';
      trail.appendChild(dot);
      
      setTimeout(() => dot.remove(), 500);
    }
  });
});