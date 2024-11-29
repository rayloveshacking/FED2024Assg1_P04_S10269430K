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
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        element.addEventListener('mousedown', dragMouseDown);
        element.addEventListener('touchstart', dragTouchStart, { passive: false });

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        }

        function dragTouchStart(e) {
            e.preventDefault();
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            document.addEventListener('touchend', closeDragElement);
            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.window-header')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            
            element.style.top = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, newTop)) + "px";
            element.style.left = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, newLeft)) + "px";
        }

        function elementTouchDrag(e) {
            e.preventDefault();
            const touch = e.touches[0];
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            
            element.style.top = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, newTop)) + "px";
            element.style.left = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, newLeft)) + "px";
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('touchend', closeDragElement);
            document.removeEventListener('touchmove', elementTouchDrag);
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
        bringToFront(win);
        
        // Load content if needed
        if (!win.dataset.loaded) {
            loadWindowContent(windowId);
            win.dataset.loaded = 'true';
        }

        positionWindow(win);
    }

    function loadWindowContent(windowId) {
        const contentMap = {
            'aboutWindow': 'about.html',
            'portfolioWindow': 'portfolio.html',
            'contactWindow': 'contact.html',
            'resumeWindow': 'resume.html'
        };

        if (contentMap[windowId]) {
            fetch(contentMap[windowId])
                .then(response => response.text())
                .then(html => {
                    const win = document.getElementById(windowId);
                    const content = win.querySelector('.window-content');
                    content.innerHTML = html;

                    if (windowId === 'terminalWindow') {
                        initializeTerminal();
                    }
                })
                .catch(error => console.error('Error loading content:', error));
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
            win.style = win.dataset.originalStyle || '';
        } else {
            win.dataset.originalStyle = win.style.cssText;
            win.classList.add('maximized');
            win.style.width = '100%';
            win.style.height = 'calc(100% - 40px)'; // Account for taskbar
            win.style.top = '0';
            win.style.left = '0';
        }
    }

    function bringToFront(win) {
        zIndex++;
        win.style.zIndex = zIndex;
    }

    function positionWindow(win) {
        if (window.innerWidth <= 768) {
            // Mobile positioning
            win.style.width = '90%';
            win.style.height = '80%';
            win.style.left = '5%';
            win.style.top = '10%';
        } else {
            // Desktop positioning - slightly random
            const maxX = window.innerWidth - win.offsetWidth - 50;
            const maxY = window.innerHeight - win.offsetHeight - 50;
            win.style.left = Math.floor(Math.random() * maxX + 25) + 'px';
            win.style.top = Math.floor(Math.random() * maxY + 25) + 'px';
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
    
        // Set initial prompt
        prompt.textContent = '[user@retro-os ~]$ ';
    
        const commands = {
            'help': 'Available commands:\n  help - Show this help\n  clear - Clear terminal\n  about - About me\n  ls - List files\n  contact - Contact info\n  projects - List projects',
            'clear': () => terminalOutput.innerHTML = '',
            'about': 'Security-focused Full Stack Developer\nSpecializing in secure application development and penetration testing.',
            'ls': 'Documents/  Projects/  README.md  .config',
            'contact': 'Email: winchestervicious@gmail.com\nGitHub: rayloveshacking\nLinkedIn: thar-htet-s-0368662a4',
            'projects': '1. C5ThreatDetector - Security analysis tool\n2. FoodPal - Voice-assisted food ordering system\n3. Security Research Projects'
        };
    
        terminalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                
                // Add command to output
                terminalOutput.innerHTML += `${prompt.textContent}${command}\n`;
                
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
            if (e.key === 'ArrowUp') {
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
        terminal.addEventListener('click', () => terminalInput.focus());
        
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