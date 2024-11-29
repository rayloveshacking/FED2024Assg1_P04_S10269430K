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
    
            // Window controls - Add touch events
            closeBtn.addEventListener('click', () => closeWindow(win));
            closeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                closeWindow(win);
            });
    
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
    
        win.style.display = 'flex';
        if (!win.style.top || !win.style.left) {
            positionWindow(win);
        }
        bringToFront(win);
    
        // Load content immediately
        loadWindowContent(windowId);
        
        if (windowId === 'terminalWindow') {
            setTimeout(initializeTerminal, 100);
        }
    }

    function loadWindowContent(windowId) {
        // Don't load content for terminal window
        if (windowId === 'terminalWindow') {
            initializeTerminal();
            return;
        }
    
        const contentMap = {
            'homeWindow': 'home.html',
            'aboutWindow': 'about.html',
            'portfolioWindow': 'portfolio.html',
            'contactWindow': 'contact.html',
            'resumeWindow': 'resume.html'
        };
    
        if (contentMap[windowId]) {
            const win = document.getElementById(windowId);
            const content = win.querySelector('.window-content');
            
            // Set loading state
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
    

    function closeWindow(win) {
        win.style.display = 'none';
        // Remove any touch event listeners to prevent memory leaks
        const header = win.querySelector('.window-header');
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        initializeWindows(); // Re-initialize the window controls
    }

    function minimizeWindow(win) {
        win.style.display = 'none';
        // Add to taskbar functionality can be implemented here
    }

    function toggleMaximize(win) {
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            Object.assign(win.style, {
                width: win.dataset.originalWidth || '600px',
                height: win.dataset.originalHeight || '400px',
                top: win.dataset.originalTop || '50%',
                left: win.dataset.originalLeft || '50%',
                borderRadius: '5px'
            });
        } else {
            // Store current dimensions
            win.dataset.originalWidth = win.style.width;
            win.dataset.originalHeight = win.style.height;
            win.dataset.originalTop = win.style.top;
            win.dataset.originalLeft = win.style.left;
            
            // Apply maximized state
            win.classList.add('maximized');
            Object.assign(win.style, {
                width: '100%',
                height: 'calc(100vh - 40px)',
                top: '0',
                left: '0',
                borderRadius: '0'
            });
        }
    }
    

    function bringToFront(win) {
        zIndex++;
        win.style.zIndex = zIndex;
    }

    function positionWindow(win) {
        if (window.innerWidth <= 768) {
            Object.assign(win.style, {
                width: '95%',
                height: '80%',
                left: '2.5%',
                top: '10%',
                transform: 'none',
                position: 'fixed'
            });
        } else {
            const maxX = window.innerWidth - 650;
            const maxY = window.innerHeight - 450;
            Object.assign(win.style, {
                width: '600px',
                height: '400px',
                left: Math.max(0, Math.min(maxX, Math.floor(Math.random() * maxX))) + 'px',
                top: Math.max(0, Math.min(maxY, Math.floor(Math.random() * maxY))) + 'px',
                position: 'absolute'
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
        const prompt = document.getElementById('terminal-prompt');
        
        let commandHistory = [];
        let historyIndex = -1;
    
        const commands = {
            'help': 'Available commands:\n  help - Show this help\n  clear - Clear terminal\n  about - About me\n  ls - List files\n  whoami - Show current user\n  date - Show current date\n  pwd - Show current directory',
            'clear': () => terminalOutput.innerHTML = '',
            'about': 'Security-focused Full Stack Developer\nSpecializing in secure application development and penetration testing.',
            'ls': 'Documents/  Projects/  README.md  .config',
            'whoami': 'user@retro-os',
            'date': () => new Date().toLocaleString(),
            'pwd': '/home/user'
        };
    
        terminalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim().toLowerCase();
                
                // Add command to output
                terminalOutput.innerHTML += `${prompt.textContent} ${command}\n`;
                
                // Execute command
                if (command) {
                    const output = commands[command];
                    if (output) {
                        terminalOutput.innerHTML += (typeof output === 'function' ? output() : output) + '\n';
                    } else {
                        terminalOutput.innerHTML += `Command not found: ${command}\n`;
                    }
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                }
                
                // Clear input and scroll to bottom
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
            }
            if (e.key === 'ArrowDown') {
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
    
        // Keep focus on input when clicking anywhere in terminal
        terminal.addEventListener('click', () => {
            terminalInput.focus();
        });
    
        // Initial focus
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