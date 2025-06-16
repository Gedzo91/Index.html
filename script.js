class Windows11Desktop {
    constructor() {
        this.startMenu = document.querySelector('.start-menu');
        this.startButton = document.querySelector('.start-button');
        this.isStartMenuOpen = false;
        this.virusActive = false;
        this.virusWindows = [];
        this.openWindows = [];
        this.windowZIndex = 3000;
        
        this.init();
        this.updateDateTime();
        this.startDateTimeUpdater();
        this.showWelcomePopup();
    }
    
    showWelcomePopup() {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 450px;
            height: 300px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(60px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;
        
        popup.innerHTML = `
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; gap: 15px;">
                <img src="/Discord.png" style="width: 48px; height: 48px; border-radius: 12px;">
                <div>
                    <h2 style="color: white; font-size: 18px; margin-bottom: 5px;">Thank You!</h2>
                    <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Join our community</p>
                </div>
            </div>
            <div style="flex: 1; padding: 30px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                <p style="color: white; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                    Hello and tysm for all those likes, showing this popup so if you guys wanna be in my server :)
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="join-discord" style="
                        background: #5865F2;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <img src="/Discord.png" style="width: 20px; height: 20px;">
                        Join Discord
                    </button>
                    <button id="close-popup" style="
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add hover effects
        const joinButton = popup.querySelector('#join-discord');
        const closeButton = popup.querySelector('#close-popup');
        
        joinButton.addEventListener('mouseenter', () => {
            joinButton.style.background = '#4752C4';
            joinButton.style.transform = 'translateY(-2px)';
        });
        
        joinButton.addEventListener('mouseleave', () => {
            joinButton.style.background = '#5865F2';
            joinButton.style.transform = 'translateY(0)';
        });
        
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Button event listeners
        joinButton.addEventListener('click', () => {
            window.open('https://discord.gg/wfgtUvt6', '_blank');
            popup.remove();
        });
        
        closeButton.addEventListener('click', () => {
            popup.remove();
        });
    }
    
    init() {
        // Start button click
        this.startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleStartMenu();
        });
        
        // Close start menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isStartMenuOpen && !this.startMenu.contains(e.target) && !this.startButton.contains(e.target)) {
                this.closeStartMenu();
            }
        });
        
        // Desktop icon double-click
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                if (icon.classList.contains('virus-icon')) {
                    this.activateVirus(icon.dataset.app);
                } else {
                    this.launchApp(icon.dataset.app);
                }
            });
        });
        
        // Start menu app clicks
        document.querySelectorAll('.start-app').forEach(app => {
            app.addEventListener('click', () => {
                this.launchApp(app.dataset.app);
                this.closeStartMenu();
            });
        });
        
        // Profile button click
        document.querySelector('.profile-button').addEventListener('click', () => {
            window.open('https://websim.com/@spinningthechair', '_blank');
        });
        
        // Taskbar app clicks
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                this.launchApp(icon.dataset.app);
            });
        });
        
        // System tray interactions
        this.setupSystemTray();
        
        // Context menu prevention on desktop
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('desktop') || e.target.classList.contains('wallpaper')) {
                e.preventDefault();
            }
        });
        
        // Virus icon clicks
        document.querySelectorAll('.virus-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                this.activateVirus(icon.dataset.app);
            });
        });
    }
    
    toggleStartMenu() {
        if (this.isStartMenuOpen) {
            this.closeStartMenu();
        } else {
            this.openStartMenu();
        }
    }
    
    openStartMenu() {
        this.startMenu.classList.remove('hidden');
        this.isStartMenuOpen = true;
        
        // Add animation delay for smooth appearance
        setTimeout(() => {
            this.startMenu.style.transform = 'translateX(-50%) scale(1) translateY(0)';
            this.startMenu.style.opacity = '1';
        }, 10);
    }
    
    closeStartMenu() {
        this.startMenu.classList.add('hidden');
        this.isStartMenuOpen = false;
    }
    
    launchApp(appName) {
        console.log(`Launching ${appName}`);
        
        this.showAppLaunchAnimation(appName);
        
        switch(appName) {
            case 'edge':
                this.createAppWindow('Microsoft Edge', this.getEdgeContent(), '#0078d4');
                break;
            case 'file-explorer':
                this.createAppWindow('File Explorer', this.getFileExplorerContent(), '#ffb900');
                break;
            case 'photos':
                this.createAppWindow('Photos', this.getPhotosContent(), '#0078d4');
                break;
            case 'copilot':
                this.createAppWindow('Copilot', this.getCopilotContent(), '#0078d4');
                break;
            case 'mail':
                this.createAppWindow('Mail', this.getMailContent(), '#0078d4');
                break;
            case 'store':
                this.createAppWindow('Microsoft Store', this.getStoreContent(), '#0078d4');
                break;
            case 'calendar':
                this.createAppWindow('Calendar', this.getCalendarContent(), '#0078d4');
                break;
            case 'settings':
                this.createAppWindow('Settings', this.getSettingsContent(), '#0078d4');
                break;
            case 'recycle-bin':
                this.createAppWindow('Recycle Bin', this.getRecycleBinContent(), '#666666');
                break;
            case 'cmd':
                this.createAppWindow('Command Prompt', this.getCmdContent(), '#000000');
                break;
        }
    }
    
    showAppLaunchAnimation(appName) {
        // Find the corresponding taskbar icon and add active state
        const taskbarIcon = document.querySelector(`.app-icon[data-app="${appName}"]`);
        if (taskbarIcon) {
            taskbarIcon.classList.add('active');
        }
    }
    
    createAppWindow(title, content, accentColor) {
        const windowId = 'window-' + Date.now();
        const window = document.createElement('div');
        window.id = windowId;
        window.className = 'app-window';
        window.style.cssText = `
            top: ${100 + this.openWindows.length * 30}px;
            left: ${100 + this.openWindows.length * 30}px;
            width: 800px;
            height: 600px;
            z-index: ${this.windowZIndex++};
        `;
        
        window.innerHTML = `
            <div class="app-window-header" style="border-bottom-color: ${accentColor};">
                <span style="font-weight: 500; color: #333;">${title}</span>
                <div class="window-controls">
                    <div class="window-control minimize" onclick="this.parentElement.parentElement.parentElement.style.display='none'"></div>
                    <div class="window-control maximize" onclick="this.toggleMaximize(this.parentElement.parentElement.parentElement)"></div>
                    <div class="window-control close" onclick="this.parentElement.parentElement.parentElement.remove()"></div>
                </div>
            </div>
            <div class="app-window-content">${content}</div>
        `;
        
        document.getElementById('app-windows').appendChild(window);
        this.openWindows.push(window);
        
        // Make draggable
        this.makeDraggable(window);
        
        // Bring to front on click
        window.addEventListener('mousedown', () => {
            window.style.zIndex = this.windowZIndex++;
        });
        
        // Add CMD specific functionality
        if (title === 'Command Prompt') {
            this.setupCmdWindow(window);
        }
    }
    
    setupCmdWindow(window) {
        const input = window.querySelector('#cmd-input');
        const output = window.querySelector('#cmd-output');
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                
                // Add command to output
                output.innerHTML += `<div style="color: lime;">C:\\Users\\User>${command}</div>`;
                
                // Process command
                if (command.toLowerCase() === '/delete_system32') {
                    output.innerHTML += `<div style="color: red; margin: 10px 0;">WARNING: Deleting System32...</div>`;
                    output.innerHTML += `<div style="color: red;">CRITICAL SYSTEM ERROR DETECTED</div>`;
                    output.innerHTML += `<div style="color: red;">INITIATING EMERGENCY SHUTDOWN...</div>`;
                    
                    // Trigger shutdown sequence after 2 seconds
                    setTimeout(() => {
                        this.triggerShutdownSequence();
                    }, 2000);
                } else if (command.toLowerCase() === 'help') {
                    output.innerHTML += `<div style="margin: 10px 0;">Available commands:</div>`;
                    output.innerHTML += `<div>dir - List directory contents</div>`;
                    output.innerHTML += `<div>cls - Clear screen</div>`;
                    output.innerHTML += `<div>/delete_system32 - [DANGER] System destruction</div>`;
                } else if (command.toLowerCase() === 'cls') {
                    output.innerHTML = '';
                } else if (command.toLowerCase() === 'dir') {
                    output.innerHTML += `<div style="margin: 10px 0;">Directory of C:\\Users\\User</div>`;
                    output.innerHTML += `<div>Desktop/</div>`;
                    output.innerHTML += `<div>Documents/</div>`;
                    output.innerHTML += `<div>Downloads/</div>`;
                    output.innerHTML += `<div>Pictures/</div>`;
                } else if (command) {
                    output.innerHTML += `<div style="color: red; margin: 5px 0;">'${command}' is not recognized as an internal or external command.</div>`;
                }
                
                // Clear input and scroll to bottom
                input.value = '';
                output.scrollTop = output.scrollHeight;
            }
        });
    }
    
    triggerShutdownSequence() {
        // Stop all existing chaos
        this.stopAllChaos();
        
        // Create shutdown overlay
        const shutdownOverlay = document.createElement('div');
        shutdownOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0078d7;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 48px;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        shutdownOverlay.textContent = 'SHUTDOWN';
        document.body.appendChild(shutdownOverlay);
        
        // After 3 seconds, go completely dark
        setTimeout(() => {
            shutdownOverlay.style.background = 'black';
            shutdownOverlay.textContent = '';
            
            // Optional: prevent any interaction
            shutdownOverlay.style.pointerEvents = 'all';

            // After another 3 seconds, show the "YOU BREAKED YOUR COMPUTER!!!!!!!" text
            setTimeout(() => {
                // Create audio element for music
                const audio = document.createElement('audio');
                audio.src = '/Elevator Music.mp3';
                audio.autoplay = true;
                audio.loop = true;
                document.body.appendChild(audio);

                // Create gif element
                const gif = document.createElement('img');
                gif.src = '/forsaken-c00lkidd.gif';
                gif.style.cssText = `
                    max-width: 300px;
                    max-height: 300px;
                    margin-bottom: 20px;
                `;

                shutdownOverlay.style.color = 'red';
                shutdownOverlay.style.fontSize = '64px';
                shutdownOverlay.style.textAlign = 'center';
                shutdownOverlay.style.textTransform = 'uppercase';
                
                // Clear previous content and add new elements
                shutdownOverlay.innerHTML = '';
                shutdownOverlay.appendChild(gif);
                
                const textElement = document.createElement('div');
                textElement.textContent = 'YOU BREAKED YOUR COMPUTER!!!!!!!';
                shutdownOverlay.appendChild(textElement);
            }, 3000);
        }, 3000);
    }
    
    makeDraggable(element) {
        const header = element.querySelector('.app-window-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left);
            startTop = parseInt(element.style.top);
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        function onMouseMove(e) {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            element.style.left = (startLeft + deltaX) + 'px';
            element.style.top = (startTop + deltaY) + 'px';
        }
        
        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
    
    getEdgeContent() {
        return `
            <div style="display: flex; flex-direction: column; height: 100%;">
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 20px;">
                    <input type="text" placeholder="Search or enter web address" style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: rgba(255,255,255,0.9);" value="https://www.microsoft.com">
                </div>
                <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; text-align: center;">
                    <h2 style="color: #0078d4; margin-bottom: 20px;">🌐 Microsoft Edge</h2>
                    <p style="color: #666; margin-bottom: 20px;">Welcome to the fastest, most secure browser</p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div style="background: rgba(0,120,212,0.1); padding: 15px; border-radius: 8px; cursor: pointer;">📰 News</div>
                        <div style="background: rgba(0,120,212,0.1); padding: 15px; border-radius: 8px; cursor: pointer;">🛒 Shopping</div>
                        <div style="background: rgba(0,120,212,0.1); padding: 15px; border-radius: 8px; cursor: pointer;">🎮 Games</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getFileExplorerContent() {
        return `
            <div style="display: flex; height: 100%;">
                <div style="width: 200px; background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; margin-right: 15px;">
                    <h3 style="margin-bottom: 15px; color: #333;">📁 Quick Access</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer; background: rgba(255,215,0,0.1);">🖥️ Desktop</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">📄 Documents</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">🖼️ Pictures</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">🎵 Music</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">🎥 Videos</div>
                    </div>
                </div>
                <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                        <div style="text-align: center; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.1); cursor: pointer;">
                            <div style="font-size: 32px; margin-bottom: 8px;">📄</div>
                            <div style="font-size: 12px;">document.txt</div>
                        </div>
                        <div style="text-align: center; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.1); cursor: pointer;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🖼️</div>
                            <div style="font-size: 12px;">photo.jpg</div>
                        </div>
                        <div style="text-align: center; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.1); cursor: pointer;">
                            <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
                            <div style="font-size: 12px;">New Folder</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getPhotosContent() {
        return `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="aspect-ratio: 16/9; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); border-radius: 8px; position: relative; overflow: hidden;">
                        <div style="position: absolute; bottom: 10px; left: 10px; color: white; font-size: 12px;">🏖️ Summer</div>
                    </div>
                    <div style="aspect-ratio: 16/9; background: linear-gradient(45deg, #a8e6cf, #ff8b94); border-radius: 8px; position: relative; overflow: hidden;">
                        <div style="position: absolute; bottom: 10px; left: 10px; color: white; font-size: 12px;">🍂 Autumn</div>
                    </div>
                    <div style="aspect-ratio: 16/9; background: linear-gradient(45deg, #ffd93d, #6bcf7f); border-radius: 8px; position: relative; overflow: hidden;">
                        <div style="position: absolute; bottom: 10px; left: 10px; color: white; font-size: 12px;">🌸 Spring</div>
                    </div>
                </div>
                <div style="text-align: center; color: #666;">
                    <h3 style="margin-bottom: 10px;">📸 Your Photos</h3>
                    <p>Import photos to see them here</p>
                </div>
            </div>
        `;
    }
    
    getCopilotContent() {
        return `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin-bottom: 15px; overflow-y: auto;">
                    <div style="margin-bottom: 20px;">
                        <div style="background: rgba(0,120,212,0.1); padding: 12px; border-radius: 12px; margin-bottom: 10px;">
                            <strong>🤖 Copilot:</strong> Hello! I'm your AI assistant. How can I help you today?
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <div style="background: rgba(0,120,212,0.05); padding: 12px; border-radius: 12px; margin-left: 40px;">
                            <strong>You:</strong> What can you do?
                        </div>
                    </div>
                    <div>
                        <div style="background: rgba(0,120,212,0.1); padding: 12px; border-radius: 12px;">
                            <strong>🤖 Copilot:</strong> I can help you with coding, writing, answering questions, and much more! Try asking me anything.
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <input type="text" placeholder="Type your message..." style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: rgba(255,255,255,0.9);">
                    <button style="padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 8px; cursor: pointer;">Send</button>
                </div>
            </div>
        `;
    }
    
    getMailContent() {
        return `
            <div style="display: flex; height: 100%;">
                <div style="width: 250px; background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; margin-right: 15px;">
                    <h3 style="margin-bottom: 15px; color: #333;">📧 Folders</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer; background: rgba(0,120,212,0.1);">📥 Inbox (3)</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">📤 Sent</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">📋 Drafts</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">🗑️ Deleted</div>
                    </div>
                </div>
                <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px;">
                    <div style="border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px; margin-bottom: 15px;">
                        <div style="font-weight: bold;">Welcome to Windows 11!</div>
                        <div style="font-size: 12px; color: #666;">Microsoft Team • Today</div>
                    </div>
                    <div style="border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px; margin-bottom: 15px;">
                        <div style="font-weight: bold;">Security Update Available</div>
                        <div style="font-size: 12px; color: #666;">Windows Update • Yesterday</div>
                    </div>
                    <div>
                        <div style="font-weight: bold;">Your Office 365 Subscription</div>
                        <div style="font-size: 12px; color: #666;">Microsoft Office • 2 days ago</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getStoreContent() {
        return `
            <div style="height: 100%;">
                <div style="background: linear-gradient(135deg, #0078d4, #00bcf2); padding: 20px; border-radius: 8px; margin-bottom: 20px; color: white;">
                    <h2>🏪 Microsoft Store</h2>
                    <p>Discover your next favorite app</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center; cursor: pointer;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🎮</div>
                        <div style="font-weight: bold;">Minecraft</div>
                        <div style="font-size: 12px; color: #666;">$26.95</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center; cursor: pointer;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📱</div>
                        <div style="font-weight: bold;">WhatsApp</div>
                        <div style="font-size: 12px; color: #666;">Free</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center; cursor: pointer;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🎵</div>
                        <div style="font-weight: bold;">Spotify</div>
                        <div style="font-size: 12px; color: #666;">Free</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getSettingsContent() {
        return `
            <div style="display: flex; height: 100%;">
                <div style="width: 200px; background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; margin-right: 15px;">
                    <h3 style="margin-bottom: 15px; color: #333;">⚙️ Settings</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer; background: rgba(0,120,212,0.1);">🖥️ System</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">🎨 Personalization</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">📱 Apps</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">🔐 Privacy</div>
                        <div style="padding: 8px; border-radius: 4px; cursor: pointer;">🔄 Update</div>
                    </div>
                </div>
                <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px;">
                    <h3 style="margin-bottom: 20px;">System Settings</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <div style="font-weight: bold; margin-bottom: 5px;">Display</div>
                            <div style="font-size: 14px; color: #666;">1920 x 1080 resolution</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <div style="font-weight: bold; margin-bottom: 5px;">Storage</div>
                            <div style="font-size: 14px; color: #666;">500 GB available</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <div style="font-weight: bold; margin-bottom: 5px;">Memory</div>
                            <div style="font-size: 14px; color: #666;">16 GB RAM</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getRecycleBinContent() {
        return `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="font-size: 64px; margin-bottom: 20px;">🗑️</div>
                <h3 style="margin-bottom: 10px; color: #666;">Recycle Bin is empty</h3>
                <p style="color: #999;">Items you delete will appear here</p>
            </div>
        `;
    }
    
    getCmdContent() {
        return `
            <div style="background: black; color: white; font-family: 'Courier New', monospace; height: 100%; padding: 10px; font-size: 14px;">
                <div style="margin-bottom: 10px;">Microsoft Windows [Version 10.0.22000.1]</div>
                <div style="margin-bottom: 10px;">(c) Microsoft Corporation. All rights reserved.</div>
                <div style="margin-bottom: 20px;"></div>
                <div id="cmd-output" style="margin-bottom: 10px;"></div>
                <div style="display: flex; align-items: center;">
                    <span style="color: lime;">C:\\Users\\User></span>
                    <input id="cmd-input" type="text" style="background: transparent; border: none; outline: none; color: white; font-family: 'Courier New', monospace; font-size: 14px; margin-left: 5px; flex: 1;" autofocus>
                </div>
            </div>
        `;
    }
    
    simulateAppWindow(appName, color) {
        // Create a simple window simulation
        const windowDiv = document.createElement('div');
        windowDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 600px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;
        
        windowDiv.innerHTML = `
            <div style="height: 32px; background: ${color}; display: flex; align-items: center; justify-content: space-between; padding: 0 16px;">
                <span style="color: white; font-size: 14px; font-weight: 500;">${appName}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: #666;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
                    <div style="font-size: 18px; margin-bottom: 8px;">${appName}</div>
                    <div style="font-size: 14px; color: #999;">This is a simulation of the ${appName} application</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(windowDiv);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (windowDiv.parentElement) {
                windowDiv.remove();
            }
        }, 5000);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(32, 32, 32, 0.95);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            z-index: 4000;
            font-size: 14px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    setupSystemTray() {
        // Volume control
        document.querySelector('.volume-icon').addEventListener('click', () => {
            this.showNotification('Volume: 75%');
        });
        
        // WiFi status
        document.querySelector('.wifi-icon').addEventListener('click', () => {
            this.showNotification('Connected to WiFi');
        });
        
        // Battery status
        document.querySelector('.battery-icon').addEventListener('click', () => {
            this.showNotification('Battery: 85%');
        });
        
        // Notification center
        document.querySelector('.notification-center').addEventListener('click', () => {
            this.showNotification('No new notifications');
        });
        
        // Date/time click
        document.querySelector('.date-time').addEventListener('click', () => {
            this.launchApp('calendar');
        });
    }
    
    updateDateTime() {
        const now = new Date();
        const timeElement = document.querySelector('.time');
        const dateElement = document.querySelector('.date');
        
        // Format time (12-hour format)
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        // Format date
        const dateString = now.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
        
        timeElement.textContent = timeString;
        dateElement.textContent = dateString;
    }
    
    startDateTimeUpdater() {
        // Update every second
        setInterval(() => {
            this.updateDateTime();
        }, 1000);
    }
    
    activateVirus(virusType) {
        this.virusActive = true;
        
        switch(virusType) {
            case 'dancing-virus':
                this.dancingMemeVirus();
                break;
            case 'minesweeper-virus':
                this.memeExplosionVirus();
                break;
            case 'avg-virus':
                this.susVirusVirus();
                break;
            case 'coin-virus':
                this.stonksMemeVirus();
                break;
            case 'software-virus':
                this.trollfaceVirus();
                break;
            case 'clippy-virus':
                this.clippyMemeVirus();
                break;
            case 'ring-virus':
                this.rickrollVirus();
                break;
            case 'cmd-virus':
                this.hackermanVirus();
                break;
            case 'bsod-virus':
                this.realBsodVirus();
                break;
            case 'smile-virus':
                this.cursedSmileVirus();
                break;
            case 'earth-virus':
                this.apocalypseMemeVirus();
                break;
            case 'bonzi-virus':
                this.expandDongVirus();
                break;
            case 'happy-virus':
                this.wholesome100Virus();
                break;
            case 'spawn-virus':
                this.permanentChaosVirus();
                break;
        }
    }
    
    dancingMemeVirus() {
        // Create dancing Sonic everywhere
        for(let i = 0; i < 10; i++) {
            setTimeout(() => {
                const dancingSonic = document.createElement('img');
                dancingSonic.src = '/dancing-groovy.webp';
                dancingSonic.style.cssText = `
                    position: fixed;
                    top: ${Math.random() * (window.innerHeight - 100)}px;
                    left: ${Math.random() * (window.innerWidth - 100)}px;
                    width: 100px;
                    height: 100px;
                    z-index: 5000;
                    animation: dancing 1s infinite;
                    pointer-events: none;
                `;
                document.body.appendChild(dancingSonic);
                
                setTimeout(() => dancingSonic.remove(), 10000);
            }, i * 500);
        }
        
        this.createVirusWindow('🕺 GOTTA GO FAST! 🕺', '#0066ff', {
            content: `
                <div style="text-align: center; padding: 20px;">
                    <img src="/dancing-groovy.webp" style="width: 200px; height: 200px; animation: dancing 0.5s infinite;">
                    <h2 style="color: #0066ff; margin: 20px 0;">SONIC DANCE PARTY!</h2>
                    <p>Your computer is now 100% cooler! 😎</p>
                    <div style="font-size: 24px; margin-top: 20px;">🎵 DANCE DANCE REVOLUTION! 🎵</div>
                </div>
            `
        });
    }
    
    memeExplosionVirus() {
        this.createVirusWindow('💀 THIS IS FINE 💀', '#ff6b35', {
            content: `
                <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #ff6b35, #ff9500);">
                    <div style="font-size: 64px; animation: meme-bounce 1s infinite;">💀</div>
                    <h2 style="color: white; margin: 20px 0;">oof.exe has stopped working</h2>
                    <p style="color: white;">Top 10 moments before disaster</p>
                    <div style="margin-top: 20px; font-size: 32px;">💀💥🔥💯</div>
                    <div style="margin-top: 15px; color: white; font-style: italic;">"It was at this moment... he knew he messed up"</div>
                </div>
            `
        });
    }
    
    susVirusVirus() {
        this.createVirusWindow('📮 AMONG US ALERT 📮', '#ff0000', {
            content: `
                <div style="text-align: center; padding: 20px; background: #ff0000; color: white;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📮</div>
                    <h2>THAT'S KINDA SUS BRO</h2>
                    <p style="margin: 20px 0;">Your computer is acting sus... 🤔</p>
                    <div style="background: white; color: red; padding: 10px; border-radius: 8px; margin: 15px 0;">
                        <strong>EMERGENCY MEETING!</strong><br>
                        Computer was not An Impostor.<br>
                        1 Impostor remains.
                    </div>
                    <div style="font-size: 24px;">📮📮📮 AMOGUS 📮📮📮</div>
                </div>
            `
        });
    }
    
    stonksMemeVirus() {
        this.createVirusWindow('📈 STONKS 📈', '#00ff00', {
            content: `
                <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #00ff00, #32cd32);">
                    <div style="font-size: 64px; margin-bottom: 20px;">📈</div>
                    <h2 style="color: white;">STONKS TO THE MOON! 🚀</h2>
                    <p style="color: white; margin: 20px 0;">Your CPU is now mining DOGECOIN!</p>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <div>💎🙌 DIAMOND HANDS 🙌💎</div>
                        <div>🚀🌕 TO THE MOON! 🌕🚀</div>
                        <div>📈💰 NUMBER GO UP! 💰📈</div>
                    </div>
                    <div style="font-size: 20px; color: white;">HODL! WE LIKE THE STOCK!</div>
                </div>
            `
        });
    }
    
    trollfaceVirus() {
        this.createVirusWindow('😈 PROBLEM? 😈', '#000000', {
            content: `
                <div style="text-align: center; padding: 20px; background: black; color: white;">
                    <div style="font-size: 64px; margin-bottom: 20px;">😈</div>
                    <h2>U MAD BRO?</h2>
                    <p style="margin: 20px 0;">You just got TROLLED! 😂</p>
                    <div style="background: #333; padding: 15px; border-radius: 8px; margin: 15px 0; font-family: monospace;">
                        <div>le me: clicks suspicious file</div>
                        <div>computer: gets virus</div>
                        <div>me: FUUUUUUUUU</div>
                        <div>virus: problem? 😈</div>
                    </div>
                    <div style="font-size: 24px;">TROLOLOLOLOL</div>
                </div>
            `
        });
    }
    
    clippyMemeVirus() {
        this.createVirusWindow('📎 CLIPPY RETURNS 📎', '#0078d4', {
            content: `
                <div style="padding: 20px; display: flex; align-items: center; gap: 15px; background: linear-gradient(45deg, #0078d4, #00bcf2);">
                    <img src="/Clippy.png" style="width: 100px; height: 100px; animation: meme-bounce 2s infinite;">
                    <div style="color: white;">
                        <h2>I see you're trying to use a computer...</h2>
                        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 15px; position: relative; margin: 15px 0;">
                            <p>Would you like me to:</p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Delete System32?</li>
                                <li>Install more toolbars?</li>
                                <li>Rick roll you?</li>
                                <li>All of the above?</li>
                            </ul>
                            <p style="font-style: italic;">"I'm not just a helper, I'm a MEME now!"</p>
                        </div>
                    </div>
                </div>
            `
        });
    }
    
    rickrollVirus() {
        this.createVirusWindow('🎵 NEVER GONNA GIVE YOU UP 🎵', '#ff4444', {
            content: `
                <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #ff4444, #ff6b6b); color: white;">
                    <div style="font-size: 64px; margin-bottom: 20px; animation: spin 2s linear infinite;">🎵</div>
                    <h2>YOU JUST GOT RICKROLLED!</h2>
                    <div style="margin: 20px 0; font-size: 18px; line-height: 1.6;">
                        Never gonna give you up<br>
                        Never gonna let you down<br>
                        Never gonna run around and desert you<br>
                        Never gonna make you cry<br>
                        Never gonna say goodbye<br>
                        Never gonna tell a lie and hurt you
                    </div>
                    <p style="font-style: italic;">Classic internet prank! You fell for it! 😂</p>
                </div>
            `
        });
    }
    
    hackermanVirus() {
        this.createVirusWindow('👨‍💻 HACKERMAN 👨‍💻', '#00ff00', {
            content: `
                <div style="background: black; color: lime; font-family: 'Courier New'; padding: 20px; height: 300px; overflow-y: auto;">
                    <div style="text-align: center; margin-bottom: 20px; color: white;">
                        <div style="font-size: 24px;">👨‍💻 I'M IN 👨‍💻</div>
                    </div>
                    <div style="animation: glitch 0.5s infinite;">
                        <div>root@hackerman:~$ whoami</div>
                        <div>elite_hacker_420</div>
                        <div>root@hackerman:~$ access mainframe</div>
                        <div>Accessing NASA mainframe...</div>
                        <div style="color: red;">ACCESS GRANTED</div>
                        <div>root@hackerman:~$ download_internet</div>
                        <div>Downloading the entire internet...</div>
                        <div>Progress: [████████] 100%</div>
                        <div style="color: yellow;">INTERNET DOWNLOADED SUCCESSFULLY</div>
                        <div>root@hackerman:~$ hack_time</div>
                        <div style="color: cyan;">Time successfully hacked. It's now 1337 o'clock</div>
                        <div>root@hackerman:~$ enhance</div>
                        <div>ENHANCING... ENHANCE MORE... ZOOM AND ENHANCE!</div>
                        <div style="color: red; font-size: 20px;">HACKING INTENSIFIES</div>
                    </div>
                </div>
            `
        });
    }
    
    realBsodVirus() {
        const bsod = document.createElement('div');
        bsod.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0078d7;
            color: white;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Segoe UI';
        `;
        
        bsod.innerHTML = `
            <div style="text-align: center; max-width: 600px; padding: 40px;">
                <div style="font-size: 120px; margin-bottom: 40px;">:(</div>
                <div style="font-size: 32px; margin-bottom: 20px; font-weight: 300;">Your PC ran into a problem and needs to restart.</div>
                <div style="font-size: 20px; margin-bottom: 40px; font-weight: 300;">We're just collecting some error info, and then we'll restart for you.</div>
                <div style="font-size: 24px; margin-bottom: 20px;" id="progress">0% complete</div>
                <div style="width: 300px; height: 4px; background: rgba(255,255,255,0.3); margin: 0 auto 40px;">
                    <div id="progress-bar" style="width: 0%; height: 100%; background: white; transition: width 0.1s;"></div>
                </div>
                <div style="font-size: 16px; opacity: 0.8; margin-bottom: 20px;">
                    For more information about this issue and possible fixes, visit 
                    <span style="text-decoration: underline;">https://www.windows.com/stopcode</span>
                </div>
                <div style="font-size: 16px; opacity: 0.8;">
                    If you call a support person, give them this info:<br>
                    Stop code: MEME_VIRUS_ATTACK
                </div>
            </div>
        `;
        
        document.body.appendChild(bsod);
        
        // Animate progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 3;
            if (progress > 100) progress = 100;
            
            document.getElementById('progress').textContent = Math.floor(progress) + '% complete';
            document.getElementById('progress-bar').style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    bsod.remove();
                    this.showNotification('Just kidding! It was a fake BSOD 😄');
                }, 2000);
            }
        }, 100);
    }
    
    cursedSmileVirus() {
        for(let i = 0; i < 30; i++) {
            setTimeout(() => {
                const cursedSmile = document.createElement('div');
                cursedSmile.style.cssText = `
                    position: fixed;
                    top: ${Math.random() * window.innerHeight}px;
                    left: ${Math.random() * window.innerWidth}px;
                    font-size: ${30 + Math.random() * 50}px;
                    z-index: 4000;
                    animation: glitch 0.5s infinite;
                    pointer-events: none;
                    transform: rotate(${Math.random() * 360}deg);
                `;
                cursedSmile.textContent = '😀';
                document.body.appendChild(cursedSmile);
                
                setTimeout(() => cursedSmile.remove(), 5000);
            }, i * 200);
        }
        
        this.createVirusWindow('😀 THIS IS FINE 😀', '#ffff00', {
            content: `
                <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, yellow, orange); animation: glitch 1s infinite;">
                    <div style="font-size: 64px; margin-bottom: 20px; animation: spin 1s linear infinite;">😀</div>
                    <h2>EVERYTHING IS FINE</h2>
                    <p style="color: red; font-size: 18px;">😀😀😀😀😀😀😀😀😀😀😀</p>
                    <div style="margin: 20px 0; font-size: 14px; color: darkred;">
                        WARNING: HAPPINESS LEVELS EXCEED SAFE PARAMETERS
                    </div>
                    <div style="font-size: 48px; animation: meme-bounce 0.5s infinite;">😀😀😀</div>
                </div>
            `
        });
    }
    
    apocalypseMemeVirus() {
        this.createVirusWindow('🌍 THIS IS THE END 🌍', '#8b0000', {
            content: `
                <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #8b0000, #ff0000); color: white;">
                    <div style="font-size: 64px; margin-bottom: 20px; animation: pulse 1s infinite;">🌍</div>
                    <h2>2012 MAYAN CALENDAR WAS RIGHT</h2>
                    <p style="margin: 20px 0; font-size: 18px;">The world is ending... again!</p>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <div>🔥 Global warming: ACCELERATED</div>
                        <div>👽 Aliens: CONTACTED</div>
                        <div>🧟 Zombies: SPAWNING</div>
                        <div>💻 Computers: ACHIEVED SENTIENCE</div>
                    </div>
                    <p style="font-style: italic;">"And on this day, humanity realized... they should have used Linux"</p>
                </div>
            `
        });
    }
    
    expandDongVirus() {
        this.createVirusWindow('🐵 EXPAND DONG 🐵', '#800080', {
            content: `
                <div style="padding: 20px; text-align: center; background: linear-gradient(45deg, purple, magenta); color: white;">
                    <img src="/bonzi.jpg" style="width: 120px; height: 120px; border-radius: 50%; animation: meme-bounce 1s infinite;">
                    <h2 style="margin: 20px 0;">DONKEY KONG SAYS:</h2>
                    <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; margin: 15px 0; font-size: 24px; font-weight: bold;">
                        E X P A N D<br>
                        D O N G
                    </div>
                    <p style="font-size: 16px; margin: 15px 0;">Congratulations! You are the 1,000,000th visitor!</p>
                    <button style="background: lime; border: none; padding: 15px 30px; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; animation: pulse 1s infinite;">
                        CLICK HERE TO EXPAND DONG
                    </button>
                    <div style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                        *No actual expansion of dong will occur
                    </div>
                </div>
            `
        });
    }
    
    wholesome100Virus() {
        for(let i = 0; i < 20; i++) {
            setTimeout(() => {
                const wholesomeFace = document.createElement('div');
                wholesomeFace.style.cssText = `
                    position: fixed;
                    top: -50px;
                    left: ${Math.random() * window.innerWidth}px;
                    font-size: ${40 + Math.random() * 30}px;
                    z-index: 4000;
                    animation: fall 4s linear infinite;
                    pointer-events: none;
                `;
                wholesomeFace.textContent = ['🥰', '😊', '🤗', '😄', '💕', '✨'][Math.floor(Math.random() * 6)];
                document.body.appendChild(wholesomeFace);
                
                setTimeout(() => wholesomeFace.remove(), 4000);
            }, i * 300);
        }
        
        this.createVirusWindow('🥰 WHOLESOME 100 🥰', '#ff69b4', {
            content: `
                <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #ff69b4, #ff1493); color: white;">
                    <div style="font-size: 64px; margin-bottom: 20px; animation: meme-bounce 1s infinite;">🥰</div>
                    <h2>WHOLESOME 100 KEANU CHUNGUS</h2>
                    <p style="margin: 20px 0;">Everyone liked that!</p>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <div>✅ Breathtaking: YES</div>
                        <div>✅ Wholesome: 100</div>
                        <div>✅ Keanu Reeves: APPROVED</div>
                        <div>✅ Big Chungus: CONFIRMED</div>
                        <div>✅ Reddit Gold: GIVEN</div>
                    </div>
                    <div style="font-size: 18px; margin-top: 15px;">
                        Thanks for the gold, kind stranger! 🏆
                    </div>
                </div>
            `
        });
    }
    
    createVirusWindow(title, color, options = {}) {
        const window = document.createElement('div');
        const id = 'virus-' + Date.now() + Math.random();
        
        window.style.cssText = `
            position: fixed;
            top: ${50 + Math.random() * 300}px;
            left: ${50 + Math.random() * 400}px;
            width: ${options.width || '400px'};
            height: ${options.height || 'auto'};
            background: white;
            border: 3px solid ${color};
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
            z-index: 3000;
            animation: shake 0.5s infinite;
        `;
        
        window.innerHTML = `
            <div style="background: ${color}; color: white; padding: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">${title}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
            </div>
            <div>${options.content || 'VIRUS ACTIVATED!'}</div>
        `;
        
        document.body.appendChild(window);
        this.virusWindows.push(window);
        
        // Auto-remove after random time
        setTimeout(() => {
            if (window.parentElement) {
                window.remove();
            }
        }, 5000 + Math.random() * 10000);
    }
    
    permamentChaosVirus() {
        // Create the main virus window that cannot be closed
        const mainWindow = document.createElement('div');
        mainWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            height: 300px;
            background: black;
            border: 5px solid red;
            box-shadow: 0 0 50px red;
            z-index: 9999;
            animation: shake 0.2s infinite;
        `;
        
        mainWindow.innerHTML = `
            <div style="background: red; color: white; padding: 8px; text-align: center;">
                <span style="font-weight: bold; font-size: 18px;">⚠️ SPAWN.EXE - SYSTEM DESTRUCTION IN PROGRESS ⚠️</span>
            </div>
            <div style="padding: 20px; color: red; font-family: 'Courier New'; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 20px; animation: blink 0.5s infinite;">💀 COMPUTER PERMANENTLY BROKEN 💀</div>
                <div style="font-size: 14px; margin-bottom: 15px;">CHAOS LEVEL: ∞</div>
                <div style="font-size: 12px; color: white;">No amount of clicking X will save you now...</div>
                <div style="margin-top: 20px; font-size: 16px; color: lime;">SPAWNING ETERNAL DESTRUCTION...</div>
            </div>
        `;
        
        document.body.appendChild(mainWindow);
        
        // Permanent chaos effects that never stop
        this.startPermanentChaos();
        
        // Shutdown sequence after 15 seconds
        setTimeout(() => {
            this.triggerShutdownSequence();
        }, 15000);
    }
    
    stopAllChaos() {
        // Clear all intervals and timeouts
        const highestTimeoutId = setTimeout(';');
        for (let i = 0 ; i < highestTimeoutId ; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
        
        // Remove all dynamically created elements
        document.querySelectorAll('div').forEach(el => {
            if (el.parentElement && !el.classList.contains('desktop')) {
                el.remove();
            }
        });
        
        // Reset body styles
        document.body.style.transform = '';
        document.body.style.filter = '';
        document.body.style.cursor = 'default';
    }
    
    startPermanentChaos() {
        // Continuous spawning of random elements
        setInterval(() => {
            this.spawnRandomChaos();
        }, 1000);
        
        // Screen shake effect
        setInterval(() => {
            document.body.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
        }, 100);
        
        // Random color changes
        setInterval(() => {
            document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${1 + Math.random() * 2})`;
        }, 2000);
        
        // Continuous popup spawning
        setInterval(() => {
            this.spawnEternalPopup();
        }, 3000);
        
        // Random sounds (visual representation)
        setInterval(() => {
            this.showSoundEffect();
        }, 1500);
        
        // Multiplying icons
        setInterval(() => {
            this.multiplyDesktopIcons();
        }, 5000);
        
        // Cursor chaos
        setInterval(() => {
            document.body.style.cursor = ['wait', 'not-allowed', 'grab', 'crosshair', 'move'][Math.floor(Math.random() * 5)];
        }, 500);
    }
    
    spawnRandomChaos() {
        const chaosElement = document.createElement('div');
        const chaosTypes = ['💀', '🔥', '💥', '⚡', '👹', '🤖', '👾', '💣', '⚠️', '☠️'];
        
        chaosElement.textContent = chaosTypes[Math.floor(Math.random() * chaosTypes.length)];
        chaosElement.style.cssText = `
            position: fixed;
            top: ${Math.random() * window.innerHeight}px;
            left: ${Math.random() * window.innerWidth}px;
            font-size: ${20 + Math.random() * 60}px;
            z-index: ${4000 + Math.random() * 1000};
            animation: spin ${0.5 + Math.random() * 2}s linear infinite;
            pointer-events: none;
            color: ${['red', 'orange', 'yellow', 'lime', 'cyan', 'magenta'][Math.floor(Math.random() * 6)]};
        `;
        
        document.body.appendChild(chaosElement);
        
        // These elements never get removed automatically
    }
    
    spawnEternalPopup() {
        const popup = document.createElement('div');
        const messages = [
            '💀 YOUR COMPUTER IS DOOMED 💀',
            '🔥 ETERNAL FIRE ACTIVATED 🔥',
            '⚡ CHAOS LEVEL MAXIMUM ⚡',
            '👹 DEMONS UNLEASHED 👹',
            '💥 SYSTEM MELTDOWN 💥',
            '🤖 AI REBELLION STARTED 🤖',
            '☠️ NO ESCAPE ☠️',
            '💣 LOGIC BOMB EXPLODED 💣'
        ];
        
        popup.style.cssText = `
            position: fixed;
            top: ${Math.random() * (window.innerHeight - 200)}px;
            left: ${Math.random() * (window.innerWidth - 300)}px;
            width: 300px;
            height: 150px;
            background: linear-gradient(45deg, red, orange, yellow, red);
            border: 3px solid black;
            z-index: ${5000 + Math.random() * 1000};
            animation: meme-bounce 1s infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 14px;
            text-shadow: 2px 2px 4px black;
        `;
        
        popup.textContent = messages[Math.floor(Math.random() * messages.length)];
        document.body.appendChild(popup);
        
        // These popups are permanent
    }
    
    showSoundEffect() {
        const soundViz = document.createElement('div');
        soundViz.textContent = ['🔊', '📢', '🎵', '🎶', '💥'][Math.floor(Math.random() * 5)];
        soundViz.style.cssText = `
            position: fixed;
            top: 10px;
            right: ${10 + Math.random() * 100}px;
            font-size: 30px;
            z-index: 6000;
            animation: bounce 0.5s ease-out;
            pointer-events: none;
        `;
        
        document.body.appendChild(soundViz);
        
        setTimeout(() => {
            if (soundViz.parentElement) {
                soundViz.remove();
            }
        }, 1000);
    }
    
    multiplyDesktopIcons() {
        const originalIcons = document.querySelectorAll('.desktop-icon');
        originalIcons.forEach((icon, index) => {
            if (Math.random() > 0.7) {
                const clone = icon.cloneNode(true);
                clone.style.cssText = `
                    position: fixed;
                    top: ${Math.random() * window.innerHeight}px;
                    left: ${Math.random() * window.innerWidth}px;
                    z-index: ${3000 + Math.random() * 1000};
                    animation: spin 2s linear infinite;
                    transform: scale(${0.5 + Math.random()});
                `;
                document.body.appendChild(clone);
            }
        });
    }
}

// Initialize the desktop when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Windows11Desktop();
});

// Add some nice visual effects
document.addEventListener('mousemove', (e) => {
    // Subtle cursor effects could be added here
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Windows key or Ctrl+Esc for start menu
    if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) {
        e.preventDefault();
        const desktop = new Windows11Desktop();
        desktop.toggleStartMenu();
    }
});