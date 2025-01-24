let zIndex = 1000;
const openWindows = new Set();

const windowPositions = {
    'Tarot Reader': { left: '10%', top: '10%' },
    'Sigil Forge': { left: '20%', top: '20%' },
    'Terminal': { left: '30%', top: '30%' },
    'Astral Projection': { left: '40%', top: '15%' },
    'Alchemical Lab': { left: '50%', top: '25%' },
    'Magick Search': { left: '60%', top: '35%' }
};

const openWindow = (name, url, content = null) => {
    const window = document.createElement('div');
    window.className = 'window';
    window.style.cssText = `
        width: 600px;
        height: 400px;
        left: ${windowPositions[name]?.left || '10%'};
        top: ${windowPositions[name]?.top || '10%'};
        z-index: ${++zIndex};
    `;

    window.innerHTML = `
        <div class="window-header">
            <h3 class="window-title">${name}</h3>
            <div class="window-controls">
                <span class="minimize">_</span>
                <span class="maximize">□</span>
                <span class="close">×</span>
            </div>
        </div>
        <div class="window-content">
            <div class="loading">Loading...</div>
        </div>
    `;

    const desktop = document.querySelector('.desktop');
    desktop.appendChild(window);
    makeDraggable(window);
    makeResizable(window);

    const closeBtn = window.querySelector('.close');
    closeBtn.onclick = () => {
        desktop.removeChild(window);
        openWindows.delete(name);
        updateTaskbar();
    };

    const maximizeBtn = window.querySelector('.maximize');
    maximizeBtn.onclick = () => {
        const isMaximized = window.style.width === '100%';
        window.style.cssText = isMaximized ? `
            width: 600px;
            height: 400px;
            left: ${windowPositions[name]?.left || '10%'};
            top: ${windowPositions[name]?.top || '10%'};
            z-index: ${++zIndex};
        ` : `
            width: 100%;
            height: calc(100% - 30px);
            left: 0;
            top: 0;
            z-index: ${++zIndex};
        `;
    };

    window.addEventListener('mousedown', () => window.style.zIndex = ++zIndex);

    openWindows.add(name);
    updateTaskbar();

    if (content) {
        window.querySelector('.window-content').innerHTML = '';
        window.querySelector('.window-content').appendChild(content);
    } else if (url) {
        setTimeout(() => {
            const windowContent = window.querySelector('.window-content');
            windowContent.innerHTML = `<iframe src="${url}" sandbox="allow-scripts allow-same-origin" allow="geolocation; microphone; camera" allowfullscreen></iframe>`;
        }, 100);
    }
};

const createIcon = (name, emoji, x, y, appUrl) => {
    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.style.cssText = `left: ${x}px; top: ${y}px;`;
    icon.innerHTML = `
        <div class="icon-emoji">${emoji}</div>
        <div>${name}</div>
    `;
    icon.onclick = () => openWindow(name, appUrl);
    document.querySelector('.desktop').appendChild(icon);
};

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.querySelector('.window-header').onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function makeResizable(element) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.width = '10px';
    resizer.style.height = '10px';
    resizer.style.background = 'purple';
    resizer.style.position = 'absolute';
    resizer.style.right = 0;
    resizer.style.bottom = 0;
    resizer.style.cursor = 'se-resize';
    element.appendChild(resizer);

    resizer.addEventListener('mousedown', initResize, false);

    function initResize(e) {
        window.addEventListener('mousemove', resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }

    function resize(e) {
        element.style.width = (e.clientX - element.offsetLeft) + 'px';
        element.style.height = (e.clientY - element.offsetTop) + 'px';
    }

    function stopResize(e) {
        window.removeEventListener('mousemove', resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
}

const createTaskbar = () => {
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    document.body.appendChild(taskbar);
    return taskbar;
};

const updateTaskbar = () => {
    let taskbar = document.querySelector('.taskbar');
    if (!taskbar) {
        taskbar = createTaskbar();
    }
    taskbar.innerHTML = '<button class="start-button">Start</button>';
    openWindows.forEach(windowName => {
        const taskbarItem = document.createElement('button');
        taskbarItem.className = 'taskbar-item';
        taskbarItem.textContent = windowName;
        taskbarItem.onclick = () => {
            const windowElement = document.querySelector(`.window:has(.window-title:contains("${windowName}"))`);
            if (windowElement) {
                windowElement.style.zIndex = ++zIndex;
            }
        };
        taskbar.appendChild(taskbarItem);
    });

    taskbar.querySelector('.start-button').onclick = toggleStartMenu;
};

const toggleStartMenu = () => {
    const startMenu = document.querySelector('.start-menu');
    startMenu.style.display = startMenu.style.display === 'none' ? 'block' : 'none';
};

const createUpdateNote = () => {
    const note = document.createElement('div');
    note.className = 'update-note';
    note.innerHTML = `
        <h3>
            v1.9.9 update
            <span class="minimize-btn">_</span>
        </h3>
        <div class="update-note-content">
            <ul>
                <li>New customization options! Change themes, colors, and background image.</li>
                <li>Look for the new paint palette icon in the bottom-right corner to access these features.</li>
            </ul>
            <p>Enjoy personalizing your Unix-Magic OS experience!</p>
        </div>
    `;
    document.querySelector('.desktop').appendChild(note);

    const minimizeBtn = note.querySelector('.minimize-btn');
    minimizeBtn.onclick = () => {
        note.classList.toggle('minimized');
        minimizeBtn.textContent = note.classList.contains('minimized') ? '+' : '_';
    };
};

const themes = {
    default: {
        primaryColor: '#8a2be2',
        textColor: '#ffffff',
        windowBg: 'rgba(25, 25, 25, 0.8)'
    },
    light: {
        primaryColor: '#4a90e2',
        textColor: '#333333',
        windowBg: 'rgba(255, 255, 255, 0.8)'
    },
    dark: {
        primaryColor: '#555555',
        textColor: '#ffffff',
        windowBg: 'rgba(40, 40, 40, 0.9)'
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.documentElement.style.setProperty('--window-bg', theme.windowBg);
}

function createThemeSelector() {
    const selector = document.createElement('select');
    selector.id = 'theme-selector';
    Object.keys(themes).forEach(themeName => {
        const option = document.createElement('option');
        option.value = themeName;
        option.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
        selector.appendChild(option);
    });
    selector.onchange = (e) => applyTheme(e.target.value);
    return selector;
}

function createCustomizationPanel() {
    const panel = document.createElement('div');
    panel.className = 'customization-panel';
    panel.appendChild(createBgUploader());
    panel.appendChild(document.createElement('br'));
    panel.appendChild(createColorPicker('Primary Color: ', '--primary-color'));
    panel.appendChild(createColorPicker('Text Color: ', '--text-color'));
    panel.appendChild(createColorPicker('Window Background: ', '--window-bg'));
    panel.appendChild(document.createElement('br'));
    panel.appendChild(createResetButton());
    return panel;
}

function createBgUploader() {
    const uploader = document.createElement('input');
    uploader.type = 'file';
    uploader.accept = 'image/*';
    uploader.id = 'bg-uploader';
    uploader.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.body.style.backgroundImage = `url('${e.target.result}')`;
            };
            reader.readAsDataURL(file);
        }
    };
    const label = document.createElement('label');
    label.htmlFor = 'bg-uploader';
    label.textContent = 'Upload Background';
    const wrapper = document.createElement('div');
    wrapper.appendChild(label);
    wrapper.appendChild(uploader);
    return wrapper;
}

function createColorPicker(label, cssVar) {
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.setAttribute('data-css-var', cssVar);
    picker.value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    picker.onchange = (e) => {
        document.documentElement.style.setProperty(cssVar, e.target.value);
    };
    const wrapper = document.createElement('div');
    wrapper.appendChild(document.createTextNode(label));
    wrapper.appendChild(picker);
    return wrapper;
}

const createSmallIcon = () => {
    const icon = document.createElement('div');
    icon.className = 'small-icon';
    icon.innerHTML = '<span class="small-icon-emoji">🎨</span>';
    icon.onclick = () => openWindow('Customize', '', createCustomizationPanel());
    document.body.appendChild(icon);
};

const defaultTheme = {
    primaryColor: '#8a2be2',
    textColor: '#ffffff',
    windowBg: 'rgba(25, 25, 25, 0.8)',
    backgroundImage: 'https://64.media.tumblr.com/c0502e4e71f5d9dc5f74da94d02e8733/49ca5cada7bd509a-50/s2048x3072/10f0268ef447985818a15631cc6a143df47f002c.gif'
};

function resetToDefault() {
    document.documentElement.style.setProperty('--primary-color', defaultTheme.primaryColor);
    document.documentElement.style.setProperty('--text-color', defaultTheme.textColor);
    document.documentElement.style.setProperty('--window-bg', defaultTheme.windowBg);
    document.body.style.backgroundImage = `url('${defaultTheme.backgroundImage}')`;
    
    document.querySelectorAll('.customization-panel input[type="color"]').forEach(picker => {
        const cssVar = picker.getAttribute('data-css-var');
        picker.value = defaultTheme[cssVar.substring(2)];
    });
}

function createResetButton() {
    const button = document.createElement('button');
    button.textContent = 'Reset to Default';
    button.onclick = resetToDefault;
    return button;
}

window.onload = () => {
    const icons = [
        ['Tarot Reader', '🃏', 20, 20, 'https://websim.ai/@input_source/tarotreader'],
        ['Sigil Forge', '⛧', 20, 130, 'https://websim.ai/@input_source/advanced-purple-sigil-forge-unix-magic-os'],
        ['Terminal', '💻', 20, 240, 'https://websim.ai/@input_source/chaosmagick-terminal-unixmagick-os-1'],
        ['Astral Projection', '🧘', 20, 350, 'https://websim.ai/@input_source/astral-projection-guide-unix-magic-os'],
        ['Alchemical Lab', '⚗️', 20, 460, 'https://websim.ai/@input_source/alchemical-lab-unix-magic-os-responsive'],
        ['Magick Search', '🔮', 20, 570, 'https://websim.ai/@input_source/magicksearch']
    ];

    icons.forEach(icon => createIcon(...icon));

    const startMenu = document.createElement('div');
    startMenu.className = 'start-menu';
    startMenu.innerHTML = icons.map(([name, , , , url]) => 
        `<a href="#" onclick="openWindow('${name}', '${url}')">${name}</a>`
    ).join('');
    
    const themeSelector = createThemeSelector();
    const themeSelectorWrapper = document.createElement('div');
    themeSelectorWrapper.className = 'theme-selector-wrapper';
    themeSelectorWrapper.appendChild(document.createTextNode('Theme: '));
    themeSelectorWrapper.appendChild(themeSelector);
    startMenu.appendChild(themeSelectorWrapper);
    
    startMenu.style.display = 'none';
    document.body.appendChild(startMenu);

    createUpdateNote();
    createTaskbar();
    updateTaskbar();
    createSmallIcon();

    applyTheme('default');

    openWindow('Terminal', 'https://websim.ai/@input_source/chaosmagick-terminal-unixmagick-os-1');
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.start-button') && !e.target.closest('.start-menu')) {
        document.querySelector('.start-menu').style.display = 'none';
    }
});