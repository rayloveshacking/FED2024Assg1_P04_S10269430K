document.addEventListener('DOMContentLoaded', function() {
    // Core variables
    let zIndex = 1000;
    let selectedIcon = null;
    let isDragging = false;
    let activeWindow = null;

    // Startup animation
    const startupScreen = document.getElementById('startup-screen');
    const desktop = document.getElementById('desktop');
    
    setTimeout(() => {
        startupScreen.style.display = 'none';
        desktop.style.display = 'block';
        initializeDesktop();
    }, 3000);

    function initializeDesktop() {
        initializeIcons();
        initializeWindows();
        initializeTaskbar();
        initializeCRTEffect();
    }

    // Icon functionality
    function initializeIcons() {
        const icons = document.querySelectorAll('.icon');
        
        icons.forEach(icon => {
            // Desktop events
            icon.addEventListener('click', () => {
                if (selectedIcon) selectedIcon.classList.remove('selected');
                selectedIcon = icon;
                icon.classList.add('selected');
            });

            // Double click/tap handling
            let lastTap = 0;
            
            // Desktop double click
            icon.addEventListener('dblclick', () => {
                openWindow(icon.getAttribute('data-window'));
            });

            // Mobile double tap
            icon.addEventListener('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 500 && tapLength > 0) {
                    e.preventDefault();
                    openWindow(icon.getAttribute('data-window'));
                }
                lastTap = currentTime;
            });

            // Make icons draggable
            makeDraggable(icon);
        });
    }

    function makeDraggable(element) {
        const header = element.querySelector('.window-header') || element;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', startDrag);
        header.addEventListener('touchstart', startDrag, { passive: false });
    
        function startDrag(e) {
            if (e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            
            const event = e.touches ? e.touches[0] : e;
            startX = event.clientX;
            startY = event.clientY;
            startLeft = parseInt(window.getComputedStyle(element).left);
            startTop = parseInt(window.getComputedStyle(element).top);
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        }
    
        function drag(e) {
            e.preventDefault();
            const event = e.touches ? e.touches[0] : e;
            
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            
            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;
            
            element.style.left = `${Math.max(0, Math.min(window.innerWidth - element.offsetWidth, newLeft))}px`;
            element.style.top = `${Math.max(0, Math.min(window.innerHeight - element.offsetHeight, newTop))}px`;
        }
    
        function stopDrag() {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    }

    // Window Management
    function initializeWindows() {
        const windows = document.querySelectorAll('.window');
        
        windows.forEach(win => {
            const header = win.querySelector('.window-header');
            const closeBtn = win.querySelector('.close-button');
            const maximizeBtn = win.querySelector('.maximize-button');
            const minimizeBtn = win.querySelector('.minimize-button');
    
            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeWindow(win));
                closeBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    closeWindow(win);
                });
            }
    
            if (maximizeBtn) {
                maximizeBtn.addEventListener('click', () => toggleMaximize(win));
                maximizeBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    toggleMaximize(win);
                });
            }
    
            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', () => minimizeWindow(win));
                minimizeBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    minimizeWindow(win);
                });
            }
    
            makeDraggable(win);
            
            win.addEventListener('mousedown', () => bringToFront(win));
            win.addEventListener('touchstart', () => bringToFront(win));
        });
    }

    function openWindow(windowId) {
        const win = document.getElementById(windowId);
        if (!win) return;
    
        setupWindowControls(win);
        
        win.style.display = 'flex';
        if (!win.style.top || !win.style.left) {
            positionWindow(win);
        }
        bringToFront(win);
        loadWindowContent(windowId);
    }

    function loadWindowContent(windowId) {
        // Don't load content for terminal window
        if (windowId === 'terminalWindow') {
            initializeTerminal();
            return;
        }
    
        // Skip loading for home window since content is in index.html
        if (windowId === 'homeWindow') {
            return;
        }
    
        const contentMap = {
            'aboutWindow': 'about.html',
            'portfolioWindow': 'portfolio.html',
            'contactWindow': 'contact.html',
            'resumeWindow': 'resume.html'
        };
    
        if (contentMap[windowId]) {
            const win = document.getElementById(windowId);
            const content = win.querySelector('.window-content');
            
            content.innerHTML = '<div style="color: #0f0;">Loading...</div>';
            
            fetch(contentMap[windowId])
                .then(response => response.text())
                .then(html => {
                    content.innerHTML = html;
                    if (win.querySelector('#resume-timestamp')) {
                        setInterval(() => {
                            const timestamp = win.querySelector('#resume-timestamp');
                            const now = new Date();
                            timestamp.textContent = `TIMESTAMP: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                        }, 1000);
                    }
                })
                .catch(() => {
                    content.innerHTML = '<div style="color: #0f0;">Failed to load content</div>';
                });
        }
    }

    function setupWindowControls(win) {
        // Remove existing listeners first
        win.removeEventListener('mousedown', () => bringToFront(win));
        win.removeEventListener('touchstart', () => bringToFront(win));
        
        const header = win.querySelector('.window-header');
        const closeBtn = win.querySelector('.close-button');
        const maximizeBtn = win.querySelector('.maximize-button');
        const minimizeBtn = win.querySelector('.minimize-button');
    
        const closeHandler = () => closeWindow(win);
        const maximizeHandler = () => toggleMaximize(win);
        const minimizeHandler = () => minimizeWindow(win);
    
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            const newCloseBtn = win.querySelector('.close-button');
            newCloseBtn.addEventListener('click', closeHandler);
            newCloseBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                closeHandler();
            });
        }
    
        if (maximizeBtn) {
            maximizeBtn.replaceWith(maximizeBtn.cloneNode(true));
            const newMaxBtn = win.querySelector('.maximize-button');
            newMaxBtn.addEventListener('click', maximizeHandler);
            newMaxBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                maximizeHandler();
            });
        }
    
        if (minimizeBtn) {
            minimizeBtn.replaceWith(minimizeBtn.cloneNode(true));
            const newMinBtn = win.querySelector('.minimize-button');
            newMinBtn.addEventListener('click', minimizeHandler);
            newMinBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                minimizeHandler();
            });
        }
    
        win.addEventListener('mousedown', () => bringToFront(win));
        win.addEventListener('touchstart', () => bringToFront(win));
        
        makeDraggable(win);
    }


    function closeWindow(win) {
        win.style.display = 'none';
        win.classList.remove('maximized');
    }

    function minimizeWindow(win) {
        win.style.display = 'none';
        // Add to taskbar functionality can be implemented here
    }

    function toggleMaximize(win) {
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            // Restore original dimensions and position
            win.style.width = win.dataset.originalWidth || '600px';
            win.style.height = win.dataset.originalHeight || '400px';
            win.style.top = win.dataset.originalTop || '50px';
            win.style.left = win.dataset.originalLeft || '50px';
            win.style.transform = win.dataset.originalTransform || 'none';
            win.style.margin = '0';
        } else {
            // Store current state before maximizing
            win.dataset.originalWidth = win.style.width;
            win.dataset.originalHeight = win.style.height;
            win.dataset.originalTop = win.style.top;
            win.dataset.originalLeft = win.style.left;
            win.dataset.originalTransform = win.style.transform;
            
            win.classList.add('maximized');
            // Set maximized state
            win.style.width = '100%';
            win.style.height = 'calc(100vh - 40px)';
            win.style.top = '0';
            win.style.left = '0';
            win.style.transform = 'none';
            win.style.margin = '0';
        }
        bringToFront(win);
    }
    
    

    function bringToFront(win) {
        zIndex++;
        win.style.zIndex = zIndex;
    }

    function positionWindow(win) {
        // Don't reposition if window is maximized
        if (win.classList.contains('maximized')) return;
    
        if (window.innerWidth <= 768) {
            Object.assign(win.style, {
                width: '95%',
                height: '80%',
                left: '2.5%',
                top: '10%',
                position: 'fixed',
                transform: 'none',
                margin: '0'
            });
        } else {
            const maxX = window.innerWidth - 650;
            const maxY = window.innerHeight - 450;
            const randomX = Math.max(0, Math.min(maxX, Math.floor(Math.random() * maxX)));
            const randomY = Math.max(0, Math.min(maxY, Math.floor(Math.random() * maxY)));
            
            Object.assign(win.style, {
                width: '600px',
                height: '400px',
                left: `${randomX}px`,
                top: `${randomY}px`,
                position: 'absolute',
                transform: 'none',
                margin: '0'
            });
        }
    }
    // Taskbar functionality
    function initializeTaskbar() {
        const startButton = document.getElementById('start-button');
        const desktop = document.getElementById('desktop');
        
        // Create start menu if it doesn't exist
        let startMenu = document.getElementById('start-menu');
        if (!startMenu) {
            startMenu = document.createElement('div');
            startMenu.id = 'start-menu';
            startMenu.innerHTML = `
                <ul>
                    <li data-window="homeWindow">Home</li>
                    <li data-window="aboutWindow">About Me</li>
                    <li data-window="portfolioWindow">Portfolio</li>
                    <li data-window="resumeWindow">Resume</li>
                    <li data-window="contactWindow">Contact</li>
                    <li data-window="terminalWindow">Terminal</li>
                </ul>
            `;
            desktop.appendChild(startMenu);
        }
    
        const clock = document.getElementById('taskbar-clock');
    
        function toggleStartMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        }
    
        // Remove any existing event listeners
        startButton.removeEventListener('click', toggleStartMenu);
        startButton.removeEventListener('touchend', toggleStartMenu);
    
        // Add event listeners
        startButton.addEventListener('click', toggleStartMenu);
        startButton.addEventListener('touchend', toggleStartMenu);
    
        // Handle menu item clicks
        startMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                const windowId = e.target.getAttribute('data-window');
                if (windowId) {
                    openWindow(windowId);
                    startMenu.style.display = 'none';
                }
            });
        });
    
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
                startMenu.style.display = 'none';
            }
        });
    
        // Update clock
        function updateClock() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            clock.textContent = `${hours}:${minutes}`;
        }
    
        setInterval(updateClock, 1000);
        updateClock();
    }

    // Terminal Functionality
    function initializeTerminal() {
        const terminal = document.getElementById('terminal');
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        
        let commandHistory = [];
        let historyIndex = -1;
    
        const commands = {
            'help': 'Available commands:\n  help - Show this help\n  clear - Clear terminal\n  about - About me\n  ls - List files\n  whoami - Show current user\n  date - Show current date\n  pwd - Show current directory',
            'clear': () => terminalOutput.innerHTML = '',
            'about': 'Security-focused Full Stack Developer\nSpecializing in secure application development and penetration testing.',
            'ls': 'Documents/  Projects/  README.md  .config',
            'whoami': 'user@retro-os',
            'date': () => new Date().toLocaleString(),
            'pwd': '/home/user',
            'cd': 'Command not found: cd'
        };
    
        function executeCommand(cmd) {
            if (!cmd) return '';
            
            const output = commands[cmd];
            if (output) {
                return typeof output === 'function' ? output() : output;
            }
            return `Command not found: ${cmd}`;
        }
    
        terminalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim().toLowerCase();
                if (command === 'clear') {
                    terminalOutput.innerHTML = '';
                } else {
                    // Execute command and get output
                    const output = executeCommand(command);
                    if (command) {
                        terminalOutput.innerHTML += `[user@retro-os ~]$ ${command}\n${output}\n`;
                        commandHistory.push(command);
                    }
                }
                
                historyIndex = commandHistory.length;
                this.value = '';
                terminal.scrollTop = terminal.scrollHeight;
            }
            
            // Command history navigation
            if (e.key === 'ArrowUp' && commandHistory.length) {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    this.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    this.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    this.value = '';
                }
            }
        });
    
        terminal.addEventListener('click', () => terminalInput.focus());
        terminalInput.focus();
    }

    // CRT Effect
    function initializeCRTEffect() {
        if (!document.querySelector('.crt-lines')) {
            const crtLines = document.createElement('div');
            crtLines.className = 'crt-lines';
            desktop.appendChild(crtLines);

            const crtFlicker = document.createElement('div');
            crtFlicker.className = 'crt-flicker';
            desktop.appendChild(crtFlicker);
        }
    }

    // Handle window resizing
    window.addEventListener('resize', () => {
        document.querySelectorAll('.window').forEach(win => {
            if (win.style.display !== 'none' && !win.classList.contains('maximized')) {
                positionWindow(win);
            }
        });
    });
});