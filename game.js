let currentCamera = 1;
let isPaused = false;
let gameTime = 0;
let darkMode = localStorage.getItem('darkMode') === 'true';
let selectedMap = localStorage.getItem('selectedMap');
let anomaliesActive = false;
let activeAnomalies = new Map();
let anomalyCount = 0;
let maxAnomalies = 6; // One per camera
let correctReports = 0;
let incorrectReports = 0;
const END_TIME = 360; // 6 minutes (360 seconds)
let cameraFilter = localStorage.getItem('cameraFilter') || 'color';

const mapData = {
  home: {
    cameras: 6,
    locations: [
      {
        name: 'Living Room',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'couch'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'tv'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'window'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'painting'}
          ]
        },
        anomalySpots: ['couch', 'tv', 'window', 'painting']
      },
      {
        name: 'Kitchen',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 200, width: 120, height: 60, label: 'sink'},
            {type: 'rect', x: 300, y: 150, width: 80, height: 120, label: 'fridge'},
            {type: 'rect', x: 500, y: 250, width: 150, height: 80, label: 'table'},
            {type: 'rect', x: 50, y: 150, width: 70, height: 100, label: 'mirror'}
          ]
        },
        anomalySpots: ['sink', 'fridge', 'table', 'mirror']
      },
      {
        name: 'Master Bedroom',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'bed'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'closet'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'mirror'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'window'}
          ]
        },
        anomalySpots: ['bed', 'closet', 'mirror', 'window']
      },
      {
        name: 'Bathroom',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'mirror'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'shower'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'sink'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'toilet'}
          ]
        },
        anomalySpots: ['mirror', 'shower', 'sink', 'toilet']
      },
      {
        name: 'Kids Room',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'bed'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'toys'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'closet'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'window'}
          ]
        },
        anomalySpots: ['bed', 'toys', 'closet', 'window']
      },
      {
        name: 'Basement',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'stairs'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'storage'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'furnace'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'corner'}
          ]
        },
        anomalySpots: ['stairs', 'storage', 'furnace', 'corner']
      }
    ]
  },
  mall: {
    cameras: 6,
    locations: [
      {
        name: 'Main Entrance',
        layout: {
          furniture: [
            {type: 'rect', x: 200, y: 350, width: 400, height: 20, label: 'doors'},
            {type: 'rect', x: 100, y: 250, width: 80, height: 40, label: 'benches'},
            {type: 'rect', x: 500, y: 150, width: 100, height: 60, label: 'signs'},
            {type: 'rect', x: 50, y: 100, width: 150, height: 200, label: 'windows'}
          ]
        },
        anomalySpots: ['doors', 'benches', 'signs', 'windows']
      },
      {
        name: 'Food Court',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'tables'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'counter'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'plants'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'trash'}
          ]
        },
        anomalySpots: ['tables', 'counter', 'plants', 'trash']
      },
      {
        name: 'Arcade',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'machines'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'prize corner'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'entrance'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'mirrors'}
          ]
        },
        anomalySpots: ['machines', 'prize corner', 'entrance', 'mirrors']
      },
      {
        name: 'Department Store',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'mannequins'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'clothes'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'mirrors'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'counter'}
          ]
        },
        anomalySpots: ['mannequins', 'clothes', 'mirrors', 'counter']
      },
      {
        name: 'Hallway',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'stores'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'benches'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'signs'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'plants'}
          ]
        },
        anomalySpots: ['stores', 'benches', 'signs', 'plants']
      },
      {
        name: 'Security Office',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'desk'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'monitors'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'door'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'lockers'}
          ]
        },
        anomalySpots: ['desk', 'monitors', 'door', 'lockers']
      }
    ]
  },
  hotel: {
    cameras: 6,
    locations: [
      {
        name: 'Lobby',
        layout: {
          furniture: [
            {type: 'rect', x: 150, y: 200, width: 200, height: 60, label: 'desk'},
            {type: 'rect', x: 400, y: 250, width: 120, height: 80, label: 'seats'},
            {type: 'rect', x: 600, y: 150, width: 80, height: 120, label: 'elevator'},
            {type: 'rect', x: 50, y: 150, width: 100, height: 120, label: 'painting'}
          ]
        },
        anomalySpots: ['desk', 'seats', 'elevator', 'painting']
      },
      {
        name: 'Hallway 1F',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'doors'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'paintings'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'window'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'cart'}
          ]
        },
        anomalySpots: ['doors', 'paintings', 'window', 'cart']
      },
      {
        name: 'Hallway 2F',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'doors'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'paintings'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'window'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'plant'}
          ]
        },
        anomalySpots: ['doors', 'paintings', 'window', 'plant']
      },
      {
        name: 'Pool',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'water'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'chairs'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'equipment'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'mirror'}
          ]
        },
        anomalySpots: ['water', 'chairs', 'equipment', 'mirror']
      },
      {
        name: 'Restaurant',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'tables'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'bar'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'kitchen'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'mirrors'}
          ]
        },
        anomalySpots: ['tables', 'bar', 'kitchen', 'mirrors']
      },
      {
        name: 'Elevator Hall',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'elevator'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'seats'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'plants'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'mirror'}
          ]
        },
        anomalySpots: ['elevator', 'seats', 'plants', 'mirror']
      }
    ]
  },
  city: {
    cameras: 6,
    locations: [
      {
        name: 'Main Street',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'storefront'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'bus stop'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'streetlight'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'bench'}
          ]
        },
        anomalySpots: ['storefront', 'bus stop', 'streetlight', 'bench']
      },
      {
        name: 'Metro Station',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'platform'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'ticket booth'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'escalator'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'advertisements'}
          ]
        },
        anomalySpots: ['platform', 'ticket booth', 'escalator', 'advertisements']
      },
      {
        name: 'Park',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'fountain'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'playground'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'benches'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'statue'}
          ]
        },
        anomalySpots: ['fountain', 'playground', 'benches', 'statue']
      },
      {
        name: 'Parking Garage',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'cars'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'elevator'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'pillars'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'exit sign'}
          ]
        },
        anomalySpots: ['cars', 'elevator', 'pillars', 'exit sign']
      },
      {
        name: 'Office Tower',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'lobby desk'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'elevator'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'windows'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'waiting area'}
          ]
        },
        anomalySpots: ['lobby desk', 'elevator', 'windows', 'waiting area']
      },
      {
        name: 'Alleyway',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'dumpster'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'fire escape'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'doorway'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'graffiti'}
          ]
        },
        anomalySpots: ['dumpster', 'fire escape', 'doorway', 'graffiti']
      }
    ]
  },
  forsale: {
    cameras: 6,
    locations: [
      {
        name: 'Front Entrance',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'door'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'plants'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'window'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'mailbox'}
          ]
        },
        anomalySpots: ['door', 'plants', 'window', 'mailbox']
      },
      {
        name: 'Living Room',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'couch'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'tv'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'fireplace'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'window'}
          ]
        },
        anomalySpots: ['couch', 'tv', 'fireplace', 'window']
      },
      {
        name: 'Kitchen',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'counter'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'fridge'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'sink'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'cabinets'}
          ]
        },
        anomalySpots: ['counter', 'fridge', 'sink', 'cabinets']
      },
      {
        name: 'Master Bedroom',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'bed'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'closet'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'dresser'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'mirror'}
          ]
        },
        anomalySpots: ['bed', 'closet', 'dresser', 'mirror']
      },
      {
        name: 'Attic',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'boxes'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'chest'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'window'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'trunk'}
          ]
        },
        anomalySpots: ['boxes', 'chest', 'window', 'trunk']
      },
      {
        name: 'Garage',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'car'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'workbench'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'tools'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'shelves'}
          ]
        },
        anomalySpots: ['car', 'workbench', 'tools', 'shelves']
      }
    ]
  },
  forestresort: {
    cameras: 6,
    locations: [
      {
        name: 'Main Lodge',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'reception'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'fireplace'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'window'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'stairs'}
          ]
        },
        anomalySpots: ['reception', 'fireplace', 'window', 'stairs']
      },
      {
        name: 'Pool Area',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'pool'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'loungers'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'cabana'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'equipment'}
          ]
        },
        anomalySpots: ['pool', 'loungers', 'cabana', 'equipment']
      },
      {
        name: 'Restaurant',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'tables'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'bar'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'kitchen'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'storage'}
          ]
        },
        anomalySpots: ['tables', 'bar', 'kitchen', 'storage']
      },
      {
        name: 'Nature Trail',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'path'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'bench'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'trees'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'shed'}
          ]
        },
        anomalySpots: ['path', 'bench', 'trees', 'shed']
      },
      {
        name: 'Spa Center',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'massage tables'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'sauna'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'lockers'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'mirrors'}
          ]
        },
        anomalySpots: ['massage tables', 'sauna', 'lockers', 'mirrors']
      },
      {
        name: 'Forest View',
        layout: {
          furniture: [
            {type: 'rect', x: 100, y: 300, width: 200, height: 80, label: 'clearing'},
            {type: 'rect', x: 350, y: 250, width: 120, height: 80, label: 'gazebo'},
            {type: 'rect', x: 50, y: 100, width: 100, height: 150, label: 'fountain'},
            {type: 'rect', x: 500, y: 150, width: 80, height: 100, label: 'statue'}
          ]
        },
        anomalySpots: ['clearing', 'gazebo', 'fountain', 'statue']
      }
    ]
  }
};

// Initialize game after loading animation
setTimeout(() => {
  document.querySelector('.loading').style.display = 'none';
  document.querySelector('.game-container').style.display = 'block';
  initGame();
}, 3000);

function updateAnomalyLevel() {
  const levelElement = document.querySelector('.anomaly-level');
  const ratio = anomalyCount / maxAnomalies;
  
  let level;
  if (anomalyCount === 0) {
    level = "None";
  } else if (ratio <= 0.3) {
    level = "Vague";
  } else if (ratio <= 0.7) {
    level = "Evident";
  } else if (ratio === 1) {
    level = "Fully Invaded";
  }
  
  levelElement.textContent = `Anomaly Level: ${level}`;
}

function setupEventListeners() {
  document.addEventListener('keydown', handleKeyPress);
  
  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', () => switchCamera(parseInt(btn.dataset.cam)));
  });
  
  document.querySelector('.report-btn').addEventListener('click', openReportMenu);
  
  // Ensure these event listeners are properly set up when the report menu is opened
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('submit-report')) {
      submitReport();
    } else if (e.target.classList.contains('cancel-report')) {
      closeReportMenu();
    }
  });

  // Add pause menu button listeners
  document.querySelector('.resume-btn').addEventListener('click', resumeGame);
  document.querySelector('.quit-btn').addEventListener('click', returnToMenu);
}

function generateLocationSVG(location, isThumbnail = false) {
  const width = 800;
  const height = 600;
  const scale = isThumbnail ? 0.5 : 1;
  const isOutdoor = isOutdoorLocation(location.name);
  
  let svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="floorGradient" x1="0%" y1="60%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${darkMode ? '#002200' : '#444'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkMode ? '#001100' : '#222'};stop-opacity:1" />
        </linearGradient>
        
        <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${darkMode ? '#001100' : '#555'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkMode ? '#002200' : '#333'};stop-opacity:1" />
        </linearGradient>

        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${darkMode ? '#000033' : '#4a90e2'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkMode ? '#000022' : '#87ceeb'};stop-opacity:1" />
        </linearGradient>

        <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${darkMode ? '#001100' : '#3a5a40'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkMode ? '#000900' : '#2d4424'};stop-opacity:1" />
        </linearGradient>

        <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${darkMode ? '#001122' : '#8b7355'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkMode ? '#000911' : '#6b5842'};stop-opacity:1" />
        </linearGradient>

        <linearGradient id="furnitureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${darkMode ? '#003300' : '#666'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkMode ? '#001100' : '#444'};stop-opacity:1" />
        </linearGradient>

        <filter id="staticNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="${Math.random() * 100}"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.1"/>
            <feFuncG type="linear" slope="0.3"/>
            <feFuncB type="linear" slope="0.1"/>
          </feComponentTransfer>
        </filter>
      </defs>

      <!-- Background based on location type -->
      ${isOutdoor ? generateOutdoorBackground(location, width, height, scale) : generateIndoorBackground(location, width, height, scale)}
  `;

  // Add room-specific elements
  if (location.layout && location.layout.furniture) {
    const perspectivePoints = {
      vanishX: width / 2,
      vanishY: height / 3,
      depth: 0.7 // Perspective intensity
    };

    location.layout.furniture.forEach(item => {
      // Convert 2D coordinates to enhanced 3D perspective
      const depth = (item.y - 100) / 400; // Normalized depth value
      const perspectiveX = 150 + (item.x - 100) * (1 - depth * perspectivePoints.depth);
      const perspectiveY = 150 + (item.y - 100) * (1 - depth * perspectivePoints.depth);
      const scale3d = 1 - depth * 0.3; // Objects get smaller with depth

      switch(item.label) {
        case 'bed':
          svg += `
            <g class="furniture-item" data-label="${item.label}">
              <!-- Bed base with 3D effect -->
              <path d="M${perspectiveX},${perspectiveY} 
                       l${80 * scale3d},0 
                       l${20 * scale3d},${40 * scale3d} 
                       l-${80 * scale3d},0 Z" 
                    fill="url(#furnitureGradient)" 
                    stroke="${darkMode ? '#0f0' : '#666'}" 
                    stroke-width="2"/>
              <!-- Bed headboard with 3D effect -->
              <path d="M${perspectiveX},${perspectiveY} 
                       l0,${-40 * scale3d} 
                       l${80 * scale3d},0 
                       l0,${40 * scale3d}
                       M${perspectiveX},${perspectiveY - 40 * scale3d}
                       l${20 * scale3d},${-10 * scale3d}
                       l${80 * scale3d},0
                       l-${20 * scale3d},${10 * scale3d}" 
                    fill="url(#furnitureGradient)" 
                    stroke="${darkMode ? '#0f0' : '#666'}" 
                    stroke-width="2"/>
              <!-- Mattress with 3D effect -->
              <path d="M${perspectiveX},${perspectiveY - 10 * scale3d}
                       l${80 * scale3d},0
                       l${15 * scale3d},${30 * scale3d}
                       l-${80 * scale3d},0 Z"
                    fill="${darkMode ? '#002200' : '#555'}"
                    stroke="${darkMode ? '#0f0' : '#666'}"
                    stroke-width="1"/>
            </g>
          `;
          break;

        case 'mirror':
          svg += `
            <g class="furniture-item" data-label="${item.label}">
              <!-- Mirror frame with 3D effect -->
              <path d="M${perspectiveX},${perspectiveY}
                       l${60 * scale3d},0
                       l${15 * scale3d},${10 * scale3d}
                       l0,${80 * scale3d}
                       l-${15 * scale3d},-${10 * scale3d}
                       l-${60 * scale3d},0
                       l-${15 * scale3d},${10 * scale3d}
                       l0,-${80 * scale3d}
                       Z"
                    fill="url(#furnitureGradient)"
                    stroke="${darkMode ? '#0f0' : '#666'}"
                    stroke-width="2"/>
              <!-- Mirror surface with reflection effect -->
              <path d="M${perspectiveX + 5 * scale3d},${perspectiveY + 5 * scale3d}
                       l${50 * scale3d},0
                       l0,${70 * scale3d}
                       l-${50 * scale3d},0 Z"
                    fill="${darkMode ? '#004400' : '#aaa'}"
                    opacity="0.8">
                <animate attributeName="opacity" 
                         values="0.7;0.9;0.7" 
                         dur="5s" 
                         repeatCount="indefinite"/>
              </path>
            </g>
          `;
          break;

        case 'desk':
          svg += `
            <g class="furniture-item" data-label="${item.label}">
              <!-- Desk top with 3D effect -->
              <path d="M${perspectiveX},${perspectiveY}
                       l${100 * scale3d},0
                       l${20 * scale3d},${15 * scale3d}
                       l-${100 * scale3d},0 Z"
                    fill="url(#furnitureGradient)"
                    stroke="${darkMode ? '#0f0' : '#666'}"
                    stroke-width="2"/>
              <!-- Desk legs with 3D effect -->
              <path d="M${perspectiveX},${perspectiveY}
                       l0,${50 * scale3d}
                       l${10 * scale3d},${5 * scale3d}
                       l0,-${50 * scale3d} Z"
                    fill="url(#furnitureGradient)"
                    stroke="${darkMode ? '#0f0' : '#666'}"
                    stroke-width="1"/>
              <path d="M${perspectiveX + 90 * scale3d},${perspectiveY}
                       l0,${50 * scale3d}
                       l${10 * scale3d},${5 * scale3d}
                       l0,-${50 * scale3d} Z"
                    fill="url(#furnitureGradient)"
                    stroke="${darkMode ? '#0f0' : '#666'}"
                    stroke-width="1"/>
            </g>
          `;
          break;

        // Add more furniture cases with 3D effects...
        default:
          // Generic furniture representation with enhanced 3D effect
          svg += `
            <g class="furniture-item" data-label="${item.label}">
              <!-- Base with 3D depth -->
              <path d="M${perspectiveX},${perspectiveY}
                       l${60 * scale3d},0
                       l${20 * scale3d},${15 * scale3d}
                       l0,${30 * scale3d}
                       l-${60 * scale3d},0
                       l-${20 * scale3d},-${15 * scale3d}
                       Z"
                    fill="url(#furnitureGradient)"
                    stroke="${darkMode ? '#0f0' : '#666'}"
                    stroke-width="2"/>
              <!-- Top face -->
              <path d="M${perspectiveX},${perspectiveY}
                       l${60 * scale3d},0
                       l${20 * scale3d},${15 * scale3d}
                       l-${60 * scale3d},0
                       Z"
                    fill="${darkMode ? '#003300' : '#777'}"
                    stroke="${darkMode ? '#0f0' : '#666'}"
                    stroke-width="1"/>
              <text x="${perspectiveX + 30 * scale3d}"
                    y="${perspectiveY + 20 * scale3d}"
                    fill="${darkMode ? '#0f0' : '#fff'}"
                    font-family="VT323"
                    font-size="${isThumbnail ? '10px' : '14px'}"
                    text-anchor="middle">
                ${item.label}
              </text>
            </g>
          `;
      }
    });
  }

  // Add active anomaly if present
  if (activeAnomalies.has(currentCamera)) {
    const anomaly = activeAnomalies.get(currentCamera);
    svg += generateAnomalyEffect(anomaly, scale);
  }

  // Add enhanced static overlay
  svg += `
    <rect width="100%" height="100%" filter="url(#staticNoise)" opacity="0.05">
      <animate attributeName="opacity" 
               values="0.03;0.06;0.03" 
               dur="4s" 
               repeatCount="indefinite"/>
    </rect>
    </svg>
  `;
  
  return svg;
}

function isOutdoorLocation(locationName) {
  const outdoorLocations = [
    'Main Street',
    'Park',
    'Alleyway',
    'Front Entrance',
    'Parking Garage',
    'Nature Trail',
    'Forest View',
    'Pool Area'
  ];
  return outdoorLocations.includes(locationName);
}

function generateOutdoorBackground(location, width, height, scale) {
  const time = gameTime;
  const isNight = time >= 300; // Night time after 5:00 (300 seconds)
  
  let background = '';
  
  switch(location.name) {
    case 'Main Street':
      background = `
        <!-- Sky -->
        <rect width="100%" height="70%" fill="url(#skyGradient)"/>
        <!-- Ground -->
        <rect y="70%" width="100%" height="30%" fill="url(#groundGradient)"/>
        <!-- Buildings -->
        <path d="M50,100 L50,400 L200,400 L200,150 Z" fill="url(#buildingGradient)" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
        <path d="M220,80 L220,400 L350,400 L350,120 Z" fill="url(#buildingGradient)" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
        <!-- Street -->
        <path d="M0,400 L800,400" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="4"/>
        <!-- Street Lights -->
        ${isNight ? generateStreetLights() : ''}
      `;
      break;
      
    case 'Park':
      background = `
        <!-- Sky -->
        <rect width="100%" height="60%" fill="url(#skyGradient)"/>
        <!-- Ground -->
        <rect y="60%" width="100%" height="40%" fill="url(#groundGradient)"/>
        <!-- Trees -->
        ${generateTrees()}
        <!-- Path -->
        <path d="M100,400 C200,380 400,420 600,400" fill="none" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="3"/>
      `;
      break;
      
    case 'Alleyway':
      background = `
        <!-- Buildings -->
        <rect width="100%" height="100%" fill="url(#buildingGradient)"/>
        <path d="M0,0 L300,0 L300,600 L0,600 Z" fill="url(#buildingGradient)" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
        <path d="M500,0 L800,0 L800,600 L500,600 Z" fill="url(#buildingGradient)" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
        <!-- Ground -->
        <rect y="90%" width="100%" height="10%" fill="url(#groundGradient)"/>
      `;
      break;
      
    case 'Front Entrance':
      background = `
        <!-- Sky -->
        <rect width="100%" height="65%" fill="url(#skyGradient)"/>
        <!-- Lawn -->
        <rect y="65%" width="100%" height="35%" fill="url(#groundGradient)"/>
        <!-- House -->
        <path d="M200,100 L600,100 L600,400 L200,400 Z" fill="url(#buildingGradient)" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
        <path d="M400,50 L200,100 L600,100 Z" fill="url(#buildingGradient)" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
        <!-- Path -->
        <path d="M350,400 L450,400 L450,600 L350,600 Z" fill="${darkMode ? '#001100' : '#666'}" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
      `;
      break;
      
    case 'Parking Garage':
      background = `
        <!-- Concrete Structure -->
        <rect width="100%" height="100%" fill="${darkMode ? '#000911' : '#444'}"/>
        <!-- Parking Lines -->
        ${generateParkingLines()}
        <!-- Pillars -->
        ${generatePillars()}
        <!-- Ceiling Pipes -->
        ${generatePipes()}
      `;
      break;
      
    case 'Nature Trail':
    case 'Forest View':
    case 'Pool Area':
      background = `
        <!-- Sky -->
        <rect width="100%" height="70%" fill="url(#skyGradient)"/>
        <!-- Ground -->
        <rect y="70%" width="100%" height="30%" fill="url(#groundGradient)"/>
        <!-- Trees -->
        ${generateTrees()}
        <!-- Path -->
        <path d="M100,400 C200,380 400,420 600,400" fill="none" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="3"/>
      `;
      break;
      
    default:
      // Default outdoor background
      background = `
        <rect width="100%" height="100%" fill="${darkMode ? '#000' : '#111'}"/>
      `;
  }
  
  return background;
}

function generateIndoorBackground(location, width, height, scale) {
  return `
    <!-- Room background -->
    <rect width="100%" height="100%" fill="${darkMode ? '#000' : '#111'}"/>
    
    <!-- Floor (perspective trapezoid) -->
    <path d="M50,${height-50} L${width-50},${height-50} L${width-150},${height/2} L150,${height/2} Z" 
          fill="url(#floorGradient)" 
          stroke="${darkMode ? '#0f0' : '#666'}" 
          stroke-width="2"/>
    
    <!-- Left wall -->
    <path d="M50,50 L50,${height-50} L150,${height/2} L150,150 Z" 
          fill="url(#wallGradient)" 
          stroke="${darkMode ? '#0f0' : '#666'}" 
          stroke-width="2">
      <animate attributeName="opacity" values="0.95;1;0.95" dur="3s" repeatCount="indefinite"/>
    </path>
    
    <!-- Right wall -->
    <path d="M${width-50},50 L${width-50},${height-50} L${width-150},${height/2} L${width-150},150 Z" 
          fill="url(#wallGradient)" 
          stroke="${darkMode ? '#0f0' : '#666'}" 
          stroke-width="2">
      <animate attributeName="opacity" values="0.9;0.95;0.9" dur="3s" repeatCount="indefinite"/>
    </path>
    
    <!-- Back wall -->
    <path d="M150,150 L${width-150},150 L${width-150},${height/2} L150,${height/2} Z" 
          fill="url(#wallGradient)" 
          stroke="${darkMode ? '#0f0' : '#666'}" 
          stroke-width="2">
      <animate attributeName="opacity" values="0.85;0.9;0.85" dur="3s" repeatCount="indefinite"/>
    </path>
  `;
}

// Helper functions for outdoor elements
function generateStreetLights() {
  let lights = '';
  for(let i = 0; i < 4; i++) {
    lights += `
      <path d="M${150 + i * 200},380 L${150 + i * 200},300" 
            stroke="${darkMode ? '#0f0' : '#666'}" 
            stroke-width="2"/>
      <circle cx="${150 + i * 200}" cy="300" r="10" 
              fill="${darkMode ? '#0f0' : '#fff'}" 
              opacity="0.5">
        <animate attributeName="opacity" 
                 values="0.5;0.8;0.5" 
                 dur="2s" 
                 repeatCount="indefinite"/>
      </circle>
    `;
  }
  return lights;
}

function generateTrees() {
  let trees = '';
  for(let i = 0; i < 5; i++) {
    const x = 100 + i * 150;
    const y = 250;
    trees += `
      <path d="M${x},${y} L${x-30},${y+50} L${x+30},${y+50} Z" 
            fill="url(#groundGradient)" 
            stroke="${darkMode ? '#0f0' : '#666'}" 
            stroke-width="2"/>
      <rect x="${x-5}" y="${y+50}" width="10" height="30" 
            fill="${darkMode ? '#001100' : '#4a3728'}" 
            stroke="${darkMode ? '#0f0' : '#666'}" 
            stroke-width="1"/>
    `;
  }
  return trees;
}

function generateParkingLines() {
  let lines = '';
  for(let i = 0; i < 8; i++) {
    lines += `
      <path d="M${100 + i * 100},200 L${100 + i * 100},400" 
            stroke="${darkMode ? '#0f0' : '#fff'}" 
            stroke-width="2" 
            stroke-dasharray="20,10"/>
    `;
  }
  return lines;
}

function generatePillars() {
  let pillars = '';
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 3; j++) {
      pillars += `
        <rect x="${100 + i * 200}" y="${100 + j * 150}" 
              width="40" height="40" 
              fill="${darkMode ? '#001100' : '#555'}" 
              stroke="${darkMode ? '#0f0' : '#666'}" 
              stroke-width="2"/>
      `;
    }
  }
  return pillars;
}

function generatePipes() {
  return `
    <path d="M0,50 L800,50" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="3"/>
    <path d="M0,70 L800,70" stroke="${darkMode ? '#0f0' : '#666'}" stroke-width="2"/>
  `;
}

function generateAnomalyEffect(anomaly, scale = 1) {
  const baseColor = darkMode ? '#0f0' : '#fff';
  const perspectiveX = 150 + (anomaly.x - 100) * 0.7;
  const perspectiveY = 150 + (anomaly.y - 100) * 0.7;
  let effect = '';

  // Enhanced flawed anomaly effect for basement
  if (anomaly.type === 'flawed' && currentCamera === 6 && selectedMap === 'home') {
    // Distorted humanoid figure
    effect = `
      <g class="anomaly flawed" filter="url(#anomalyDistortion)">
        <!-- Distorted humanoid figure -->
        <path d="M${perspectiveX} ${perspectiveY} 
                 q${20 * scale},${-30 * scale} ${40 * scale},0
                 q${20 * scale},${30 * scale} ${40 * scale},0
                 l${-10 * scale},${50 * scale}
                 l${-60 * scale},0 Z"
              fill="none" 
              stroke="${baseColor}" 
              stroke-width="3"
              opacity="0.8">
          <animate attributeName="d" 
                   dur="3s" 
                   repeatCount="indefinite"
                   values="M${perspectiveX} ${perspectiveY} 
                           q${20 * scale},${-30 * scale} ${40 * scale},0
                           q${20 * scale},${30 * scale} ${40 * scale},0
                           l${-10 * scale},${50 * scale}
                           l${-60 * scale},0 Z;
                           M${perspectiveX} ${perspectiveY} 
                           q${20 * scale},-${20 * scale} ${40 * scale},${-10 * scale}
                           q${20 * scale},${40 * scale} ${40 * scale},${10 * scale}
                           l${-10 * scale},${60 * scale}
                           l${-60 * scale},0 Z;
                           M${perspectiveX} ${perspectiveY} 
                           q${20 * scale},${-30 * scale} ${40 * scale},0
                           q${20 * scale},${30 * scale} ${40 * scale},0
                           l${-10 * scale},${50 * scale}
                           l${-60 * scale},0 Z"/>
        </path>
        <!-- Glitchy head effect -->
        <ellipse cx="${perspectiveX + 40 * scale}" 
                 cy="${perspectiveY - 10 * scale}" 
                 rx="${15 * scale}" 
                 ry="${20 * scale}" 
                 fill="none" 
                 stroke="${baseColor}" 
                 stroke-width="2"
                 opacity="0.6">
          <animate attributeName="ry" 
                   values="${20 * scale};${30 * scale};${20 * scale}" 
                   dur="2s" 
                   repeatCount="indefinite"/>
        </ellipse>
        <!-- Disturbing details -->
        <path d="M${perspectiveX + 35 * scale} ${perspectiveY - 15 * scale} 
                 l${10 * scale},${5 * scale}"
              stroke="${baseColor}" 
              stroke-width="2"
              opacity="0.7">
          <animate attributeName="d" 
                   dur="1s" 
                   repeatCount="indefinite"
                   values="M${perspectiveX + 35 * scale} ${perspectiveY - 15 * scale} 
                           l${10 * scale},${5 * scale};
                           M${perspectiveX + 35 * scale} ${perspectiveY - 15 * scale} 
                           l${10 * scale},${-5 * scale};
                           M${perspectiveX + 35 * scale} ${perspectiveY - 15 * scale} 
                           l${10 * scale},${5 * scale}"/>
        </path>
      </g>
    `;
  } else {
    // ... existing anomaly effect code for other cases ...
    effect = generateRegularAnomalyEffect(anomaly, scale, baseColor, perspectiveX, perspectiveY);
  }

  return effect;
}

// Helper function to handle regular anomaly effects
function generateRegularAnomalyEffect(anomaly, scale, baseColor, perspectiveX, perspectiveY) {
  let effect = '';

  switch(anomaly.type) {
    case 'imagery':
      effect = `
        <g class="anomaly imagery" filter="url(#anomalyDistortion)">
          <path d="M${perspectiveX},${perspectiveY} 
                   q${40 * scale},${20 * scale} ${80 * scale},0 
                   t${80 * scale},${20 * scale}" 
                stroke="${baseColor}" fill="none" stroke-width="3">
            <animate attributeName="d" 
                     dur="3s" 
                     repeatCount="indefinite"
                     values="M${perspectiveX},${perspectiveY} 
                             q${40 * scale},${20 * scale} ${80 * scale},0 
                             t${80 * scale},${20 * scale};
                             M${perspectiveX},${perspectiveY} 
                             q${40 * scale},-${20 * scale} ${80 * scale},0 
                             t${80 * scale},-${20 * scale};
                             M${perspectiveX},${perspectiveY} 
                             q${40 * scale},${20 * scale} ${80 * scale},0 
                             t${80 * scale},${20 * scale}"/>
          </path>
        </g>
      `;
      break;

    case 'displacement':
      // Object that appears to be moving/floating
      effect = `
        <g class="anomaly displacement">
          <foreignObject x="${perspectiveX}" y="${perspectiveY}" width="100" height="100">
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: 60px; 
              height: 60px; 
              background: ${darkMode ? '#001100' : '#333'};
              border: 2px solid ${baseColor};
              animation: float 3s infinite ease-in-out;
              position: relative;
              opacity: 0.8;
            "></div>
          </foreignObject>
        </g>
      `;
      break;

    case 'mimic':
      // Multiple overlapping copies of an object
      effect = `
        <g class="anomaly mimic">
          ${Array.from({length: 3}).map((_, i) => `
            <rect 
              x="${perspectiveX + i * 10}" 
              y="${perspectiveY + i * 10}" 
              width="50" 
              height="70" 
              fill="none" 
              stroke="${baseColor}" 
              stroke-width="2" 
              opacity="${0.8 - i * 0.2}"
            >
              <animate attributeName="opacity"
                       values="${0.8 - i * 0.2};0.2;${0.8 - i * 0.2}"
                       dur="${1 + i * 0.5}s"
                       repeatCount="indefinite"/>
            </rect>
          `).join('')}
        </g>
      `;
      break;

    case 'flawed':
      // Distorted humanoid figure
      effect = `
        <g class="anomaly flawed" filter="url(#anomalyDistortion)">
          <path d="M${perspectiveX} ${perspectiveY} 
                   c20,0 40,${20 * scale} 60,0 
                   c20,-${20 * scale} 40,0 60,0" 
                fill="none" 
                stroke="${baseColor}" 
                stroke-width="3" 
                opacity="0.7"/>
          <ellipse cx="${perspectiveX + 45 * scale}" 
                   cy="${perspectiveY + 5 * scale}" 
                   rx="${40 * scale}" 
                   ry="${15 * scale}" 
                   fill="${darkMode ? '#001100' : '#222'}" 
                   stroke="${baseColor}" 
                   stroke-width="2" 
                   opacity="0.7"/>
        </g>
      `;
      break;

    case 'preacher':
      // Cloaked figure with whisper effect
      effect = `
        <g class="anomaly preacher">
          <path d="M${perspectiveX},${perspectiveY} 
                   l${30 * scale},${80 * scale} 
                   l${40 * scale},0 
                   l${30 * scale},-${80 * scale} Z" 
                fill="${darkMode ? '#001100' : '#222'}" 
                stroke="${baseColor}" 
                stroke-width="2"/>
          <circle cx="${perspectiveX + 50 * scale}" 
                  cy="${perspectiveY + 20 * scale}" 
                  r="${15 * scale}" 
                  fill="none" 
                  stroke="${baseColor}" 
                  stroke-width="2">
            <animate attributeName="r" 
                     values="${15 * scale};${20 * scale};${15 * scale}" 
                     dur="3s" 
                     repeatCount="indefinite"/>
          </circle>
        </g>
      `;
      break;

    case 'electrical':
      // Glitching electronic device
      effect = `
        <g class="anomaly electrical">
          <rect x="${perspectiveX}" 
                y="${perspectiveY}" 
                width="${60 * scale}" 
                height="${40 * scale}" 
                fill="${darkMode ? '#001100' : '#333'}" 
                stroke="${baseColor}" 
                stroke-width="2"/>
          <line x1="${perspectiveX}" 
                y1="${perspectiveY + 20 * scale}" 
                x2="${perspectiveX + 60 * scale}" 
                y2="${perspectiveY + 20 * scale}" 
                stroke="${baseColor}" 
                stroke-width="2">
            <animate attributeName="y1" 
                     values="${perspectiveY + 20 * scale};${perspectiveY};${perspectiveY + 20 * scale}" 
                     dur="0.2s" 
                     repeatCount="indefinite"/>
            <animate attributeName="y2" 
                     values="${perspectiveY + 20 * scale};${perspectiveY + 40 * scale};${perspectiveY + 20 * scale}" 
                     dur="0.2s" 
                     repeatCount="indefinite"/>
          </line>
        </g>
      `;
      break;

    case 'corpse':
      // Disturbing shape on the ground
      effect = `
        <g class="anomaly corpse">
          <path d="M${perspectiveX},${perspectiveY} 
                   c${30 * scale},${10 * scale} 
                   ${60 * scale},${10 * scale} 
                   ${90 * scale},0" 
                fill="none" 
                stroke="${baseColor}" 
                stroke-width="2" 
                opacity="0.7"/>
          <ellipse cx="${perspectiveX + 45 * scale}" 
                   cy="${perspectiveY + 5 * scale}" 
                   rx="${40 * scale}" 
                   ry="${15 * scale}" 
                   fill="${darkMode ? '#001100' : '#222'}" 
                   stroke="${baseColor}" 
                   stroke-width="2" 
                   opacity="0.7"/>
        </g>
      `;
      break;

    case 'unknown':
      // Abstract, unsettling pattern
      effect = `
        <g class="anomaly unknown" filter="url(#anomalyDistortion)">
          ${Array.from({length: 5}).map((_, i) => `
            <path d="M${perspectiveX + i * 20} ${perspectiveY} 
                     c${20 * scale},${20 * scale} 
                     ${40 * scale},-${20 * scale} 
                     ${60 * scale},0" 
                  stroke="${baseColor}" 
                  stroke-width="2" 
                  fill="none" 
                  opacity="${0.8 - i * 0.15}">
              <animate attributeName="d" 
                       dur="${2 + i * 0.5}s" 
                       repeatCount="indefinite"
                       values="M${perspectiveX + i * 20} ${perspectiveY} 
                               c${20 * scale},${20 * scale} 
                               ${40 * scale},-${20 * scale} 
                               ${60 * scale},0;
                               M${perspectiveX + i * 20} ${perspectiveY} 
                               c${20 * scale},-${20 * scale} 
                               ${40 * scale},${20 * scale} 
                               ${60 * scale},0;
                               M${perspectiveX + i * 20} ${perspectiveY} 
                               c${20 * scale},${20 * scale} 
                               ${40 * scale},-${20 * scale} 
                               ${60 * scale},0"/>
            </path>
          `).join('')}
        </g>
      `;
      break;

    case 'tulpa':
      // Only visible in mirrors
      const mirrorElements = document.querySelectorAll('.furniture-item[data-label="mirror"]');
      if (mirrorElements.length > 0) {
        effect = `
          <g class="anomaly tulpa">
            <path d="M${perspectiveX},${perspectiveY} 
                     l${30 * scale},${50 * scale} 
                     l-${60 * scale},0 z" 
                  fill="none" 
                  stroke="${baseColor}" 
                  stroke-width="2" 
                  opacity="0.5">
              <animate attributeName="opacity" 
                       values="0.5;0.1;0.5" 
                       dur="2s" 
                       repeatCount="indefinite"/>
            </path>
            <circle cx="${perspectiveX}" 
                    cy="${perspectiveY + 20 * scale}" 
                    r="${5 * scale}" 
                    fill="${baseColor}" 
                    opacity="0.5">
              <animate attributeName="r" 
                       values="${5 * scale};${8 * scale};${5 * scale}" 
                       dur="2s" 
                       repeatCount="indefinite"/>
            </circle>
          </g>
        `;
      }
      break;
  }

  return effect;
}

function startGameLoop() {
  let startTime = Date.now();
  
  function update() {
    if (!isPaused) {
      const previousTime = gameTime;
      gameTime = Math.floor((Date.now() - startTime) / 1000);
      
      // Start spawning anomalies after 1 minute (60 seconds)
      if (previousTime < 60 && gameTime >= 60) {
        anomaliesActive = true;
        console.log("Anomalies are now active!");
      }
      
      updateTimer();

      // Check if game should end
      if (gameTime >= END_TIME) {
        endGame();
        return; // Stop the game loop
      }
    }
    requestAnimationFrame(update);
  }
  
  update();
}

function updateTimer() {
  const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
  const seconds = (gameTime % 60).toString().padStart(2, '0');
  document.querySelector('.time').textContent = `${minutes}:${seconds}`;
}

function startAnomalySystem() {
  setInterval(() => {
    if (!isPaused && anomaliesActive && Math.random() < 0.1) {
      spawnAnomaly();
    }
  }, 5000);
}

function spawnAnomaly() {
  if (anomalyCount >= maxAnomalies) return;

  const availableCameras = Array.from(Array(mapData[selectedMap].cameras), (_, i) => i + 1)
    .filter(cam => !activeAnomalies.has(cam));
    
  if (availableCameras.length === 0) return;
  
  let cameraIndex;
  let anomalyType;
  
  // Special case for basement (Camera 6) in the home map
  if (selectedMap === 'home' && !activeAnomalies.has(6) && Math.random() < 0.3) {
    // Force basement camera and flawed anomaly type
    cameraIndex = 6;
    anomalyType = 'flawed';
  } else {
    // Regular random selection for other cases
    cameraIndex = availableCameras[Math.floor(Math.random() * availableCameras.length)];
    const anomalyTypes = ['imagery', 'displacement', 'mimic', 'flawed', 'preacher', 'electrical', 'corpse', 'unknown', 'tulpa'];
    anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
  }
  
  const location = mapData[selectedMap].locations[cameraIndex - 1];
  const anomalySpot = location.anomalySpots[Math.floor(Math.random() * location.anomalySpots.length)];
  
  // Enhanced positioning for the flawed anomaly in basement
  let x, y;
  if (selectedMap === 'home' && cameraIndex === 6 && anomalyType === 'flawed') {
    // Position the flawed anomaly near the stairs or in a darker corner
    const basementSpots = [
      {x: 150, y: 250}, // Near stairs
      {x: 450, y: 200}, // Dark corner
      {x: 300, y: 350}  // Center of room
    ];
    const spot = basementSpots[Math.floor(Math.random() * basementSpots.length)];
    x = spot.x;
    y = spot.y;
  } else {
    // Regular random positioning for other anomalies
    x = Math.random() * 600 + 100;
    y = Math.random() * 400 + 100;
  }

  activeAnomalies.set(cameraIndex, {
    type: anomalyType,
    spot: anomalySpot,
    x: x,
    y: y
  });

  anomalyCount++;
  updateAnomalyLevel();

  if (cameraIndex === currentCamera) {
    flashCamera();
    setTimeout(() => updateCameraFeed(), 100);
  }
  
  // Update thumbnail
  updateThumbnail(cameraIndex);
}

function handleKeyPress(e) {
  if (localStorage.getItem('deviceMode') === 'mobile') return;
  
  if (e.key === 'Escape') {
    togglePause();
  } else if (e.key === ' ') {
    openReportMenu();
  } else if (e.key >= '1' && e.key <= '6') {
    switchCamera(parseInt(e.key));
  }
}

function switchCamera(camNumber) {
  if (camNumber === currentCamera || camNumber > mapData[selectedMap].cameras) return;
  
  currentCamera = camNumber;
  document.querySelector('.camera-number').textContent = `CAM 0${camNumber}`;
  const locationName = mapData[selectedMap].locations[currentCamera - 1].name;
  document.querySelector('.location-name').textContent = locationName;
  updateCameraFeed();
}

function updateCameraFeed() {
  const feed = document.querySelector('.camera-feed');
  const location = mapData[selectedMap].locations[currentCamera - 1];
  
  // Apply camera filter
  document.querySelector('.game-container').classList.toggle('monochrome-filter', cameraFilter === 'monochrome');
  
  // Generate location SVG
  feed.innerHTML = generateLocationSVG(location);
}

function updateThumbnail(camNumber) {
  const thumbnail = document.querySelector(`.thumbnail[data-cam="${camNumber}"] .thumb-feed`);
  const location = mapData[selectedMap].locations[camNumber - 1];
  if (thumbnail) {
    thumbnail.innerHTML = generateLocationSVG(location, true);
  }
}

function initGame() {
  setupEventListeners();
  updateCameraFeed();
  updateAllThumbnails();
  startGameLoop();
  startAnomalySystem();
  initMobileControls();
  
  // Update location name for initial camera
  const locationName = mapData[selectedMap].locations[currentCamera - 1].name;
  document.querySelector('.location-name').textContent = locationName;
  
  // Apply saved camera filter
  if (cameraFilter === 'monochrome') {
    document.querySelector('.game-container').classList.add('monochrome-filter');
  }
}

function initMobileControls() {
  const mobileControls = document.querySelector('.mobile-controls');
  
  if (localStorage.getItem('deviceMode') === 'mobile') {
    mobileControls.classList.add('active');
    document.querySelector('.controls').style.display = 'none';
    
    // Set up mobile button handlers
    document.querySelectorAll('.mobile-cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchCamera(parseInt(btn.dataset.cam));
      });
    });
    
    document.querySelector('.mobile-controls .report-btn').addEventListener('click', openReportMenu);
    document.querySelector('.mobile-controls .pause-btn').addEventListener('click', togglePause);
  } else {
    mobileControls.classList.remove('active');
    document.querySelector('.controls').style.display = 'flex';
  }
}

function endGame() {
  isPaused = true;

  // Calculate score
  const maxScore = 1000;
  const anomalyPenalty = anomalyCount * 50; // -50 points per remaining anomaly
  const incorrectPenalty = incorrectReports * 100; // -100 points per incorrect report
  const correctBonus = correctReports * 100; // +100 points per correct report
  
  let finalScore = maxScore - anomalyPenalty - incorrectPenalty + correctBonus;
  finalScore = Math.max(0, Math.min(finalScore, maxScore)); // Clamp between 0 and maxScore
  
  // Calculate rating based on score
  let rating;
  if (finalScore >= 900) rating = "S";
  else if (finalScore >= 800) rating = "A";
  else if (finalScore >= 600) rating = "B";
  else if (finalScore >= 400) rating = "C";
  else if (finalScore >= 200) rating = "D";
  else rating = "F";

  // Create end game screen
  const endScreen = document.createElement('div');
  endScreen.className = 'end-screen';
  endScreen.innerHTML = `
    <div class="end-content">
      <h2>Shift Complete - 06:00</h2>
      <div class="score-details">
        <div class="score-item">
          <span>Base Score:</span>
          <span>${maxScore}</span>
        </div>
        <div class="score-item">
          <span>Correct Reports:</span>
          <span class="positive">+${correctReports * 100}</span>
        </div>
        <div class="score-item">
          <span>Incorrect Reports:</span>
          <span class="negative">-${incorrectPenalty}</span>
        </div>
        <div class="score-item">
          <span>Remaining Anomalies:</span>
          <span class="negative">-${anomalyPenalty}</span>
        </div>
        <div class="score-item total">
          <span>Final Score:</span>
          <span>${finalScore}</span>
        </div>
        <div class="rating">
          <span>Performance Rating:</span>
          <span class="rating-${rating}">${rating}</span>
        </div>
      </div>
      <button class="menu-btn" onclick="returnToMenu()">Return to Menu</button>
    </div>
  `;

  document.body.appendChild(endScreen);
}

function returnToMenu() {
  // Clear any game state from localStorage if needed
  localStorage.removeItem('selectedMap');
  localStorage.removeItem('darkMode');
  
  // Stop any running intervals or timeouts
  isPaused = true;
  
  // Redirect to menu
  window.location.href = 'index.html';
}

function togglePause() {
  isPaused = !isPaused;
  const pauseMenu = document.querySelector('.pause-menu');
  if (isPaused) {
    // Show pause menu with updated HTML
    pauseMenu.innerHTML = `
      <h2>PAUSED</h2>
      <button class="menu-btn resume-btn">Resume</button>
      <button class="menu-btn quit-btn">Main Menu</button>
    `;
    // Add event listeners to the new buttons
    pauseMenu.querySelector('.resume-btn').addEventListener('click', resumeGame);
    pauseMenu.querySelector('.quit-btn').addEventListener('click', returnToMenu);
    pauseMenu.style.display = 'block';
  } else {
    pauseMenu.style.display = 'none';
  }
}

function resumeGame() {
  isPaused = false;
  document.querySelector('.pause-menu').style.display = 'none';
}

function openReportMenu() {
  const reportMenu = document.querySelector('.report-menu');
  reportMenu.innerHTML = `
    <div class="modal-content">
      <h2>Report Anomaly</h2>
      <div class="report-options">
        <div class="room-selection">
          <label for="room-select">Select Room:</label>
          <select id="room-select" class="room-type">
            ${Array.from({length: mapData[selectedMap].cameras}, (_, i) => {
              const roomName = mapData[selectedMap].locations[i].name;
              return `<option value="${i+1}">Camera ${i+1} - ${roomName}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="anomaly-selection">
          <label for="anomaly-select">Select Anomaly Type:</label>
          <select id="anomaly-select" class="anomaly-type">
            <option value="">Select Anomaly Type</option>
            <option value="imagery">Imagery</option>
            <option value="displacement">Displacement</option>
            <option value="mimic">Mimic</option>
            <option value="flawed">Flawed</option>
            <option value="pure-form">Pure Form</option>
            <option value="preacher">Preacher</option>
            <option value="electrical">Electrical</option>
            <option value="tulpa">Tulpa</option>
            <option value="corpse">Corpse</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="report-buttons">
          <button class="submit-report menu-btn">Submit Report</button>
          <button class="cancel-report menu-btn">Cancel</button>
        </div>
      </div>
    </div>
  `;
  reportMenu.style.display = 'block';
}

function submitReport() {
  const roomSelect = document.getElementById('room-select');
  const anomalySelect = document.getElementById('anomaly-select');
  const selectedRoom = parseInt(roomSelect.value);
  const anomalyType = anomalySelect.value;
  
  if (!anomalyType || !selectedRoom) return;
  
  const reportedAnomaly = activeAnomalies.get(selectedRoom);
  if (reportedAnomaly && reportedAnomaly.type === anomalyType) {
    // Correct report
    correctReports++;
    showReportFeedback(true);
    activeAnomalies.delete(selectedRoom);
    anomalyCount--;
    updateAnomalyLevel();
    flashCamera();
    
    // Update both main feed and thumbnail if it's the current camera
    if (selectedRoom === currentCamera) {
      setTimeout(() => {
        updateCameraFeed();
      }, 100);
    }
    
    // Always update the thumbnail of the reported room
    updateThumbnail(selectedRoom);
    
  } else {
    // Incorrect report
    incorrectReports++;
    showReportFeedback(false);
  }
  
  closeReportMenu();
}

function showReportFeedback(isCorrect) {
  const feedback = document.createElement('div');
  feedback.className = 'report-feedback';
  
  if (isCorrect) {
    feedback.innerHTML = `
      <div class="feedback-content success">
        <h2>Anomaly Removed</h2>
        <div class="feedback-animation">
          <svg viewBox="0 0 100 100" class="checkmark">
            <path class="checkmark-path" d="M20,50 L40,70 L80,30" 
                  stroke="#0f0" fill="none" stroke-width="8"/>
          </svg>
        </div>
      </div>
    `;
  } else {
    feedback.innerHTML = `
      <div class="feedback-content error">
        <h2>Anomaly Not Found</h2>
        <div class="feedback-animation">
          <svg viewBox="0 0 100 100" class="error-image">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#ff0000" stroke-width="2"/>
            <path d="M25,25 C35,35 45,45 75,75 M75,25 C65,35 55,45 25,75" 
                  stroke="#ff0000" stroke-width="2"/>
            <g class="error-eyes">
              <circle cx="35" cy="40" r="5" fill="#ff0000"/>
              <circle cx="65" cy="40" r="5" fill="#ff0000"/>
            </g>
            <path d="M30,65 Q50,75 70,65" stroke="#ff0000" fill="none" stroke-width="2">
              <animate attributeName="d" 
                       values="M30,65 Q50,75 70,65;M30,60 Q50,45 70,60;M30,65 Q50,75 70,65"
                       dur="3s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
      </div>
    `;
  }

  document.body.appendChild(feedback);
  
  // Add glitch effect
  if (!isCorrect) {
    const glitchInterval = setInterval(() => {
      feedback.style.transform = `translate(-50%, -50%) skew(${Math.random() * 10 - 5}deg)`;
    }, 50);
    
    setTimeout(() => clearInterval(glitchInterval), 2000);
  }

  // Remove feedback after animation
  setTimeout(() => {
    feedback.classList.add('fade-out');
    setTimeout(() => feedback.remove(), 500);
  }, 2000);
}

function closeReportMenu() {
  document.querySelector('.report-menu').style.display = 'none';
}

function updateAllThumbnails() {
  for (let i = 1; i <= mapData[selectedMap].cameras; i++) {
    updateThumbnail(i);
  }
}

function flashCamera() {
  const feed = document.querySelector('.camera-feed');
  feed.style.backgroundColor = '#000';
  setTimeout(() => {
    feed.style.backgroundColor = '';
  }, 100);
}