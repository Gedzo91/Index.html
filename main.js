document.addEventListener('DOMContentLoaded', () => {
  const mapHeaderBtns = document.querySelectorAll('.maps-header-btn');
  mapHeaderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and sections
      mapHeaderBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.maps-section').forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked button and corresponding section
      btn.classList.add('active');
      const sectionId = `${btn.dataset.section}-maps`;
      document.getElementById(sectionId).classList.add('active');
      
      // Update chapter subtitle
      const chapterSubtitle = document.querySelector('.chapter-subtitle');
      if (btn.dataset.section === 'chapter1') {
        chapterSubtitle.textContent = "Chapter 1: The Abandoned Camera's";
      } else {
        chapterSubtitle.textContent = "Chapter 2: The Crazy Scare";
      }
    });
  });

  const buttons = {
    start: document.getElementById('startBtn'),
    settings: document.getElementById('settingsBtn'),
    maps: document.getElementById('mapsBtn'),
    instructions: document.getElementById('instructionsBtn'),
    anomaly: document.getElementById('anomalyBtn')
  };

  // Add hover sound effect
  Object.values(buttons).forEach(button => {
    button.addEventListener('mouseenter', () => {
      playHoverSound();
    });
    
    button.addEventListener('click', (e) => {
      playClickSound();
      handleButtonClick(e.target.id);
    });
  });

  // Modal close button functionality
  const closeBtn = document.querySelector('.close-btn');
  const modalOverlay = document.querySelector('.modal-overlay');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  // Settings functionality
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        localStorage.setItem('cameraFilter', filter);
        playClickSound();
      });
    });

    // Set initial active state based on saved preference
    const savedFilter = localStorage.getItem('cameraFilter') || 'color';
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${savedFilter}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  const monochromeToggle = document.getElementById('monochromeToggle');
  if (monochromeToggle) {
    monochromeToggle.addEventListener('change', () => {
      document.body.classList.toggle('monochrome');
      playClickSound();
      // Save setting to localStorage
      localStorage.setItem('monochrome', monochromeToggle.checked);
    });

    // Load saved setting
    const savedMonochrome = localStorage.getItem('monochrome');
    if (savedMonochrome === 'true') {
      monochromeToggle.checked = true;
      document.body.classList.add('monochrome');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Add fullscreen button listener
  const fullscreenToggle = document.querySelector('.fullscreen-toggle');
  if (fullscreenToggle) {
    fullscreenToggle.addEventListener('click', toggleFullscreen);
  }

  // Update fullscreen button text when fullscreen state changes
  document.addEventListener('fullscreenchange', () => {
    const fullscreenToggle = document.querySelector('.fullscreen-toggle');
    if (fullscreenToggle) {
      fullscreenToggle.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }
  });

  let deviceMode = localStorage.getItem('deviceMode') || 'keyboard';

  function setupDeviceMode() {
    const deviceBtns = document.querySelectorAll('.device-btn');
    
    // Set initial active state
    deviceBtns.forEach(btn => {
      if (btn.dataset.mode === deviceMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    deviceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        deviceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        deviceMode = btn.dataset.mode;
        localStorage.setItem('deviceMode', deviceMode);
        updateInstructions();
      });
    });

    // Initial instructions update
    updateInstructions();
  }

  function updateInstructions() {
    const instructionsContent = document.querySelector('.instructions-content');
    
    if (deviceMode === 'keyboard') {
      instructionsContent.innerHTML = `
        <div class="instruction-section">
          <h3>Overview</h3>
          <p>Your job is to monitor security cameras and report any anomalies you observe. Stay vigilant and report anything suspicious!</p>
        </div>
        
        <div class="instruction-section">
          <h3>Controls</h3>
          <p>Use <span class="key-binding">1-9</span> to switch between cameras</p>
          <p>Press <span class="key-binding">Space</span> to open the report menu</p>
          <p>Use <span class="key-binding">ESC</span> to pause the game</p>
        </div>
        
        <div class="instruction-section">
          <h3>Reporting Anomalies</h3>
          <p>1. When you notice something unusual, open the report menu</p>
          <p>2. Select the camera where you spotted the anomaly</p>
          <p>3. Choose the correct type of anomaly from the list</p>
          <p>4. Submit your report</p>
        </div>
        
        <div class="instruction-section">
          <h3>Tips</h3>
          <p>- Pay attention to the initial state of each room</p>
          <p>- Watch for sudden camera blackouts</p>
          <p>- Keep track of object positions</p>
          <p>- Check mirrors regularly</p>
          <p>- Monitor any screens or electronic devices</p>
        </div>
      `;
    } else {
      instructionsContent.innerHTML = `
        <div class="instruction-section">
          <h3>Overview</h3>
          <p>Your job is to monitor security cameras and report any anomalies you observe. Stay vigilant and report anything suspicious!</p>
        </div>
        
        <div class="instruction-section">
          <h3>Mobile Controls</h3>
          <p>Tap camera numbers (1-6) to switch views</p>
          <p>Tap the REPORT button to report anomalies</p>
          <p>Tap the PAUSE button to pause the game</p>
        </div>
        
        <div class="instruction-section">
          <h3>Reporting Anomalies</h3>
          <p>1. When you notice something unusual, tap the REPORT button</p>
          <p>2. Select the camera where you spotted the anomaly</p>
          <p>3. Choose the correct type of anomaly from the list</p>
          <p>4. Tap Submit to send your report</p>
        </div>
        
        <div class="instruction-section">
          <h3>Tips</h3>
          <p>- Pay attention to the initial state of each room</p>
          <p>- Watch for sudden camera blackouts</p>
          <p>- Keep track of object positions</p>
          <p>- Check mirrors regularly</p>
          <p>- Monitor any screens or electronic devices</p>
        </div>
      `;
    }
  }

  setupDeviceMode();

  function playHoverSound() {
    const hoverSound = new Audio();
    hoverSound.volume = 0.2;
    const frequency = 440;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  function playClickSound() {
    const clickSound = new Audio();
    clickSound.volume = 0.3;
    const frequency = 220;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  function handleButtonClick(buttonId) {
    switch(buttonId) {
      case 'startBtn':
        openMapSelection();
        break;
      case 'settingsBtn':
        openSettings();
        break;
      case 'mapsBtn':
        openMaps();
        break;
      case 'instructionsBtn':
        openInstructions();
        break;
      case 'anomalyBtn':
        openAnomalyList();
        break;
    }
  }

  function openAnomalyList() {
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.modal-overlay');
    if (modal && overlay) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
    }
  }

  function openInstructions() {
    const modal = document.querySelector('.instructions-modal');
    const overlay = document.querySelector('.modal-overlay');
    if (modal && overlay) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
    }
  }

  function openMaps() {
    const modal = document.querySelector('.maps-modal');
    const overlay = document.querySelector('.modal-overlay');
    if (modal && overlay) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
    }
  }

  function openSettings() {
    const modal = document.querySelector('.settings-modal');
    const overlay = document.querySelector('.modal-overlay');
    if (modal && overlay) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
    }
  }

  function closeModal() {
    const modals = document.querySelectorAll('.modal, .instructions-modal, .maps-modal, .settings-modal');
    const overlay = document.querySelector('.modal-overlay');
    modals.forEach(modal => {
      if (modal) modal.style.display = 'none';
    });
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  function openMapSelection() {
    const modal = document.createElement('div');
    modal.className = 'game-start-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title">Choose a Map</h2>
        <div class="map-selection-grid">
          <div class="map-choice" data-map="home">
            <div class="map-preview">
              <svg viewBox="0 0 200 150" class="map-svg home-svg">
                <rect x="50" y="50" width="100" height="80" fill="none" stroke="#00ff00" stroke-width="2"/>
                <path d="M100 30 L50 50 L150 50 Z" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="85" y="90" width="30" height="40" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="60" y="60" width="20" height="20" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="120" y="60" width="20" height="20" fill="none" stroke="#00ff00" stroke-width="2"/>
              </svg>
            </div>
            <h3>Home</h3>
          </div>
        <div class="map-choice" data-map="mall">
            <div class="map-preview">
              <svg viewBox="0 0 200 150" class="map-svg mall-svg">
                <rect x="20" y="20" width="160" height="110" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="40" y="40" width="30" height="30" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="130" y="40" width="30" height="30" fill="none" stroke="#00ff00" stroke-width="2"/>
                <path d="M20 75 L180 75" stroke="#00ff00" stroke-width="2"/>
                <rect x="85" y="85" width="30" height="30" fill="none" stroke="#00ff00" stroke-width="2"/>
              </svg>
            </div>
            <h3>Mall</h3>
          </div>
          <div class="map-choice" data-map="hotel">
            <div class="map-preview">
              <svg viewBox="0 0 200 150" class="map-svg hotel-svg">
                <rect x="30" y="20" width="140" height="110" fill="none" stroke="#00ff00" stroke-width="2"/>
                <line x1="100" y1="20" x2="100" y2="130" stroke="#00ff00" stroke-width="2"/>
                <rect x="45" y="35" width="20" height="25" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="45" y="85" width="20" height="25" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="135" y="35" width="20" height="25" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="135" y="85" width="20" height="25" fill="none" stroke="#00ff00" stroke-width="2"/>
              </svg>
            </div>
            <h3>Hotel</h3>
          </div>
          <div class="map-choice" data-map="city">
            <div class="map-preview">
              <svg viewBox="0 0 200 150" class="map-svg city-svg">
                <rect x="30" y="20" width="40" height="110" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="80" y="40" width="40" height="90" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="130" y="10" width="40" height="120" fill="none" stroke="#00ff00" stroke-width="2"/>
                <line x1="0" y1="130" x2="200" y2="130" stroke="#00ff00" stroke-width="2"/>
                <path d="M10 130 C50 90 150 90 190 130" stroke="#00ff00" fill="none" stroke-width="2"/>
                <rect x="60" y="70" width="15" height="15" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="140" y="50" width="15" height="15" fill="none" stroke="#00ff00" stroke-width="2"/>
              </svg>
            </div>
            <h3>City</h3>
          </div>
          <div class="map-choice" data-map="forsale">
            <div class="map-preview">
              <svg viewBox="0 0 200 150" class="map-svg forsale-svg">
                <rect x="40" y="40" width="120" height="90" fill="none" stroke="#00ff00" stroke-width="2"/>
                <path d="M40 40 L100 10 L160 40" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="70" y="90" width="25" height="40" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="120" y="60" width="20" height="20" fill="none" stroke="#00ff00" stroke-width="2"/>
              </svg>
            </div>
            <h3>For Sale House</h3>
          </div>
          <div class="map-choice" data-map="forestresort">
            <div class="map-preview">
              <svg viewBox="0 0 200 150" class="map-svg resort-svg">
                <rect x="20" y="20" width="160" height="110" fill="none" stroke="#00ff00" stroke-width="2"/>
                <path d="M100 20 L20 70 L180 70 Z" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="40" y="80" width="30" height="30" fill="none" stroke="#00ff00" stroke-width="2"/>
                <rect x="130" y="80" width="30" height="30" fill="none" stroke="#00ff00" stroke-width="2"/>
                <path d="M20 130 C60 110 140 110 180 130" stroke="#00ff00" fill="none" stroke-width="2"/>
              </svg>
            </div>
            <h3>Forest Resort</h3>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);

    const mapChoices = modal.querySelectorAll('.map-choice');
    mapChoices.forEach(choice => {
      choice.addEventListener('click', () => {
        const selectedMap = choice.dataset.map;
        modal.remove();
        overlay.remove();
        showDarkModePrompt(selectedMap);
      });
    });
  }

  function showDarkModePrompt(selectedMap) {
    const modal = document.createElement('div');
    modal.className = 'dark-mode-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title">Enable Dark Mode?</h2>
        <div class="dark-mode-buttons">
          <button class="menu-btn dark-mode-btn" data-choice="yes">Yes</button>
          <button class="menu-btn dark-mode-btn" data-choice="no">No</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);

    const buttons = modal.querySelectorAll('.dark-mode-btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const darkMode = button.dataset.choice === 'yes';
        modal.remove();
        overlay.remove();
        startGame(selectedMap, darkMode);
      });
    });
  }

  function startGame(map, darkMode) {
    // Save game settings
    localStorage.setItem('selectedMap', map);
    localStorage.setItem('darkMode', darkMode);
    
    // Transition to game screen
    document.querySelector('.menu-container').style.animation = 'fadeOut 1s forwards';
    setTimeout(() => {
      window.location.href = 'game.html';
    }, 1000);
  }
});