// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Startup Animation
    const startupScreen = document.getElementById('startup-screen');
    const desktop = document.getElementById('desktop');

    setTimeout(() => {
        startupScreen.style.display = 'none';
        desktop.style.display = 'block';
    }, 3000); // Display startup screen for 3 seconds

    // Terminal Functionality
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalWindow = document.getElementById('terminalWindow');

    const commandHistory = [];
    let historyIndex = -1;

    // Simulated file system
    const fileSystem = {
        '/': {
            'home': {},
            'about': {},
            'projects': {},
            'contact': {},
            'resume': {
                'resume.txt': {
                    type: 'file',
                    content: 'Your resume content here...'
                }
            },
        }
    };

    let currentDirectory = '/';

    const commands = {
        // Your existing commands...
        help: `Available commands:
    - help: Show available commands
    - ls: List directory contents
    - cd: Change directory
    - pwd: Show current directory
    - clear: Clear the terminal
    - echo: Display a line of text
    - mkdir: Create a new directory
    - touch: Create a new file
    - cat: Display file content
    - grep: Search for patterns in files
    - projects: List available projects
    - view [project-name]: View project details
    - sysinfo: Display system information
    - weather: Show current weather
    - matrix: Display Matrix effect
    - banner [text]: Generate ASCII art`,

        ls: function() {
            const dir = getDirectory(currentDirectory);
            const entries = Object.keys(dir);
            return entries.join('  ');
        },

        cd: function(args) {
            if (args.length === 0 || args[0] === '/') {
                currentDirectory = '/';
            } else if (args[0] === '..') {
                if (currentDirectory !== '/') {
                    currentDirectory = currentDirectory.substring(0, currentDirectory.lastIndexOf('/')) || '/';
                }
            } else {
                const newPath = args[0];
                const targetDir = resolvePath(newPath);
                if (targetDir) {
                    currentDirectory = formatPath(newPath);
                } else {
                    return `bash: cd: ${newPath}: No such file or directory`;
                }
            }
        },

        pwd: function() {
            return currentDirectory;
        },

        clear: function() {
            terminalOutput.innerHTML = '';
        },

        echo: function(args) {
            return args.join(' ');
        },

        mkdir: function(args) {
            if (args.length === 0) {
                return 'mkdir: missing operand';
            }
            const dirName = args[0];
            const parentDir = getDirectory(currentDirectory);
            if (parentDir[dirName]) {
                return `mkdir: cannot create directory '${dirName}': File exists`;
            }
            parentDir[dirName] = {};
        },

        touch: function(args) {
            if (args.length === 0) {
                return 'touch: missing file operand';
            }
            const fileName = args[0];
            const dir = getDirectory(currentDirectory);
            dir[fileName] = {
                type: 'file',
                content: ''
            };
        },

        cat: function(args) {
            if (args.length === 0) {
                return 'cat: missing file operand';
            }
            const fileName = args[0];
            const dir = getDirectory(currentDirectory);
            if (dir[fileName]) {
                if (dir[fileName].type === 'file') {
                    return dir[fileName].content || '';
                } else {
                    return `cat: ${fileName}: Is a directory`;
                }
            } else {
                return `cat: ${fileName}: No such file or directory`;
            }
        },

        grep: function(args) {
            if (args.length < 2) {
                return 'Usage: grep [pattern] [file]';
            }
            const pattern = args[0];
            const fileName = args[1];
            const dir = getDirectory(currentDirectory);
            if (dir[fileName] && dir[fileName].type === 'file') {
                const lines = dir[fileName].content.split('\n');
                const matchedLines = lines.filter(line => line.includes(pattern));
                return matchedLines.join('\n');
            } else {
                return `grep: ${fileName}: No such file`;
            }
        },

        projects: function() {
            return `Available projects:\n${Object.keys(projectData).join('\n')}`;
        },
        
        view: function(args) {
            if (args.length === 0) return 'Usage: view [project-name]';
            const projectName = args[0];
            if (projectData[projectName]) {
                return `Project: ${projectName}\n${projectData[projectName].description}\nTech Stack: ${projectData[projectName].techStack.join(', ')}`;
            }
            return `Project ${projectName} not found`;
        },
        
        sysinfo: function() {
            return `RetroOS v1.0.0
    CPU Usage: ${document.getElementById('cpu-percentage').textContent}
    Memory Usage: ${document.getElementById('memory-percentage').textContent}
    Screen Resolution: ${window.innerWidth}x${window.innerHeight}
    Browser: ${navigator.userAgent}`;
        },
        
        weather: function() {
            const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy'];
            const temp = Math.floor(Math.random() * 30) + 10;
            return `Current weather:\nTemperature: ${temp}°C\nConditions: ${conditions[Math.floor(Math.random() * conditions.length)]}`;
        },
        
        matrix: function() {
            startMatrixEffect();
            return 'Starting Matrix rain effect...';
        },
        
        banner: function(args) {
            if (args.length === 0) return 'Usage: banner [text]';
            return generateASCIIArt(args.join(' '));
        }
    };

    
    const projectData = {
        'project1': {
            name: 'Project KING',
            description: 'A sophisticated web application that...',
            techStack: ['React', 'Node.js', 'MongoDB']
        },
        'project2': {
            name: 'Project Two',
            description: 'An innovative mobile app that...',
            techStack: ['Flutter', 'Firebase', 'TensorFlow']
        }
    };

    function generateASCIIArt(text) {
        const characters = {
            'A': [' /\\ ', '/~~\\', ''],
            'B': ['|\\ ', '|) ', '|/ '],
            'C': [' __', '/  ', '\\__'],
            'D': ['|\\ ', '| \\', '|/ '],
            'E': ['__', '|-', '|_'],
            'F': ['__', '|-', '| '],
            'G': [' __', '/  ', '\\__'],
            'H': ['| |', '|-|', '| |'],
            'I': ['|', '|', '|'],
            // Add more characters as needed
        };
        
        let result = ['', '', ''];
        for (let char of text.toUpperCase()) {
            const art = characters[char] || [' ', ' ', ' '];
            result[0] += art[0] || ' ';
            result[1] += art[1] || ' ';
            result[2] += art[2] || ' ';
        }
        return result.join('\n');
    }

    function startMatrixEffect() {
        const terminalOutput = document.getElementById('terminal-output');
        const interval = setInterval(() => {
            terminalOutput.innerHTML += generateMatrixLine() + '\n';
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }, 100);
        
        setTimeout(() => {
            clearInterval(interval);
            terminalOutput.innerHTML += '\nMatrix effect ended.\n';
        }, 5000);
    }

    function generateMatrixLine() {
        const chars = '01';
        return Array(40).fill(0).map(() => 
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');
    }

    function getDirectory(path) {
        const parts = path.split('/').filter(Boolean);
        let dir = fileSystem['/'];
        for (let part of parts) {
            if (dir[part]) {
                dir = dir[part];
            } else {
                return null;
            }
        }
        return dir;
    }

    function resolvePath(path) {
        let fullPath;
        if (path.startsWith('/')) {
            fullPath = path;
        } else {
            fullPath = currentDirectory === '/' ? `/${path}` : `${currentDirectory}/${path}`;
        }
        return getDirectory(fullPath);
    }

    function formatPath(path) {
        if (path.startsWith('/')) {
            return path;
        } else {
            return currentDirectory === '/' ? `/${path}` : `${currentDirectory}/${path}`;
        }
    }

    function updatePrompt() {
        const promptElement = document.getElementById('terminal-prompt');
        promptElement.textContent = `[user@portfolio ${currentDirectory}]$`;
    }

    function executeCommand(input) {
        let [cmd, ...args] = input.trim().split(' ');
        if (commands.hasOwnProperty(cmd)) {
            const output = typeof commands[cmd] === 'function' ? commands[cmd](args) : commands[cmd];
            if (output !== undefined) {
                if (cmd !== 'clear') {
                    terminalOutput.innerHTML += `${updateTerminalLine(input)}\n${output}\n`;
                }
            }
            if (cmd === 'clear') {
                // Do nothing, output is already cleared
            }
        } else if (input.trim() === '') {
            terminalOutput.innerHTML += '\n';
        } else {
            terminalOutput.innerHTML += `${updateTerminalLine(input)}\nbash: ${cmd}: command not found\n`;
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        updatePrompt();
    }

    function updateTerminalLine(input) {
        return `[user@portfolio ${currentDirectory}]$ ${input}`;
    }

    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const input = terminalInput.value;
            commandHistory.push(input);
            historyIndex = commandHistory.length;
            executeCommand(input);
            terminalInput.value = '';
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
            e.preventDefault();
        }
    });

    terminalWindow.addEventListener('click', function(e) {
        if (e.target !== terminalInput) {
            terminalInput.focus();
        }
    });

    // Draggable Icons
    const icons = document.querySelectorAll('.icon');
    icons.forEach(function(icon) {
        icon.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return; // Only allow left-click dragging
            let shiftX = e.clientX - icon.getBoundingClientRect().left;
            let shiftY = e.clientY - icon.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                icon.style.left = pageX - shiftX + 'px';
                icon.style.top = pageY - shiftY + 'px';
            }

            function onMouseMove(e) {
                moveAt(e.pageX, e.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            icon.onmouseup = function() {
                document.removeEventListener('mousemove', onMouseMove);
                icon.onmouseup = null;
            };
        });

        icon.ondragstart = function() {
            return false;
        };
    });

    // Icon Selection and Context Menu
    let selectedIcon = null;

    icons.forEach(function(icon) {
        icon.addEventListener('click', function(e) {
            if (selectedIcon) {
                selectedIcon.classList.remove('selected');
            }
            selectedIcon = icon;
            icon.classList.add('selected');
        });

        icon.addEventListener('dblclick', function() {
            openWindow(icon.getAttribute('data-window'));
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('icon') && selectedIcon) {
            selectedIcon.classList.remove('selected');
            selectedIcon = null;
        }
    });

    // Function to bring window to front
    let zIndex = 1;
    function bringToFront(element) {
        zIndex++;
        element.style.zIndex = zIndex;
    }

    // Track open windows
    let openWindows = [];
    updateSystemPerformance();

    // Function to load content into windows
    function loadWindowContent(windowId, contentUrl) {
        const windowElement = document.getElementById(windowId);
        const contentElement = windowElement.querySelector('.window-content');

        fetch(contentUrl)
            .then(response => response.text())
            .then(html => {
                contentElement.innerHTML = html;

                // Re-initialize any event listeners or scripts for the new content here
                if (windowId === 'portfolioWindow') {
                    initializeProjectEventListeners();
                }
            })
            .catch(error => {
                contentElement.innerHTML = '<p>Error loading content.</p>';
                console.error('Error loading content:', error);
            });
    }

    // Function to open windows
    function openWindow(windowId) {
        const windowElement = document.getElementById(windowId);
        if (windowElement.style.display === 'none' || !windowElement.style.display) {
            windowElement.style.display = 'flex';
            openWindows.push(windowId);
            updateSystemPerformance();

            // Load content based on windowId if not already loaded
            if (!windowElement.dataset.loaded) {
                switch(windowId) {
                    case 'aboutWindow':
                        loadWindowContent(windowId, 'about.html');
                        break;
                    case 'portfolioWindow':
                        loadWindowContent(windowId, 'portfolio.html');
                        break;
                    case 'contactWindow':
                        loadWindowContent(windowId, 'contact.html');
                        break;
                    case 'resumeWindow':
                        loadWindowContent(windowId, 'resume.html');
                        break;
                    // Add cases for other windows as needed
                }
                windowElement.dataset.loaded = 'true';
            }
        }
        bringToFront(windowElement);
        if (windowId === 'terminalWindow') {
            terminalInput.focus();
            updatePrompt();
        }
    }

    // Close window when close button is clicked
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const windowElement = button.closest('.window');
            windowElement.style.display = 'none';
            const index = openWindows.indexOf(windowElement.id);
            if (index > -1) {
                openWindows.splice(index, 1);
                updateSystemPerformance();
            }
        });
    });

    // Minimize window when minimize button is clicked
    const minimizeButtons = document.querySelectorAll('.minimize-button');
    minimizeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const windowElement = button.closest('.window');
            windowElement.style.display = 'none';
        });
    });

    // Maximize/Restore window when maximize button is clicked
    const maximizeButtons = document.querySelectorAll('.maximize-button');
    maximizeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const windowElement = button.closest('.window');
            if (windowElement.classList.contains('maximized')) {
                windowElement.classList.remove('maximized');
                windowElement.style.top = windowElement.dataset.prevTop;
                windowElement.style.left = windowElement.dataset.prevLeft;
                windowElement.style.width = windowElement.dataset.prevWidth;
                windowElement.style.height = windowElement.dataset.prevHeight;
            } else {
                windowElement.dataset.prevTop = windowElement.style.top;
                windowElement.dataset.prevLeft = windowElement.style.left;
                windowElement.dataset.prevWidth = windowElement.style.width;
                windowElement.dataset.prevHeight = windowElement.style.height;
                windowElement.classList.add('maximized');
                windowElement.style.top = '0';
                windowElement.style.left = '0';
                windowElement.style.width = '100%';
                windowElement.style.height = 'calc(100% - 40px)';
            }
            bringToFront(windowElement);
        });
    });

    // Make windows draggable
    const windowHeaders = document.querySelectorAll('.window-header');
    windowHeaders.forEach(function(header) {
        const windowElement = header.parentElement;
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('window-controls') || e.target.tagName === 'BUTTON') {
                return;
            }
            isDragging = true;
            bringToFront(windowElement);
            offsetX = e.clientX - windowElement.getBoundingClientRect().left;
            offsetY = e.clientY - windowElement.getBoundingClientRect().top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (isDragging) {
                windowElement.style.left = e.clientX - offsetX + 'px';
                windowElement.style.top = e.clientY - offsetY + 'px';
            }
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    });

    // Update clock
    function updateClock() {
        const clockElement = document.getElementById('taskbar-clock');
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        clockElement.textContent = formattedHours + ':' + formattedMinutes + ' ' + ampm;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Taskbar clock click to open calendar
    const taskbarClock = document.getElementById('taskbar-clock');
    const calendarWindow = document.getElementById('calendarWindow');
    const calendarCloseButton = calendarWindow.querySelector('.close-button');

    function generateCalendar() {
        const calendarElement = document.getElementById('calendar');
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        calendarElement.innerHTML = '';
        const calendarTable = document.createElement('table');
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('th');
        headerCell.colSpan = 7;
        headerCell.innerText = monthNames[month] + ' ' + year;
        headerRow.appendChild(headerCell);
        calendarTable.appendChild(headerRow);
        const daysRow = document.createElement('tr');
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < dayNames.length; i++) {
            const dayCell = document.createElement('th');
            dayCell.innerText = dayNames[i];
            daysRow.appendChild(dayCell);
        }
        calendarTable.appendChild(daysRow);
        let date = 1;
        for (let i = 0; i < 6; i++) {
            const weekRow = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < firstDay) {
                    cell.innerText = '';
                } else if (date > daysInMonth) {
                    cell.innerText = '';
                } else {
                    cell.innerText = date;
                    if (date === day) {
                        cell.classList.add('current-day');
                    }
                    date++;
                }
                weekRow.appendChild(cell);
            }
            calendarTable.appendChild(weekRow);
        }
        calendarElement.appendChild(calendarTable);
    }

    taskbarClock.addEventListener('click', function() {
        generateCalendar();
        calendarWindow.style.display = 'block';
        bringToFront(calendarWindow);
    });

    if (calendarCloseButton) {
        calendarCloseButton.addEventListener('click', function() {
            calendarWindow.style.display = 'none';
        });
    }

    document.addEventListener('click', function(e) {
        if (calendarWindow.style.display === 'block' &&
            !calendarWindow.contains(e.target) &&
            e.target !== taskbarClock) {
            calendarWindow.style.display = 'none';
        }
    });

    // Start menu functionality
    const startButton = document.getElementById('start-button');
    const startMenu = document.createElement('div');
    startMenu.id = 'start-menu';
    startMenu.innerHTML = `
        <ul>
            <li data-window="homeWindow">Home</li>
            <li data-window="aboutWindow">About Me</li>
            <li data-window="portfolioWindow">Portfolio</li>
            <li data-window="resumeWindow">Resume</li>
            <li data-window="contactWindow">Contact</li>
            <li data-window="terminalWindow">Terminal</li>
            <li data-window="browserWindow">Browser</li>
        </ul>
    `;
    document.body.appendChild(startMenu);

    startButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (startMenu.style.display === 'block') {
            startMenu.style.display = 'none';
        } else {
            startMenu.style.display = 'block';
        }
    });

    document.addEventListener('click', function(e) {
        if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.style.display = 'none';
        }
    });

    startMenu.querySelectorAll('li').forEach(function(menuItem) {
        menuItem.addEventListener('click', function() {
            const windowId = menuItem.getAttribute('data-window');
            openWindow(windowId);
            startMenu.style.display = 'none';
        });
    });

    // Portfolio Project Details
    function initializeProjectEventListeners() {
        const projectElements = document.querySelectorAll('.project');
        const projectList = document.getElementById('projectList');
        const projectDetails = document.getElementById('projectDetails');

        projectElements.forEach(function(projectElement) {
            projectElement.addEventListener('click', function() {
                const projectId = projectElement.getAttribute('data-project');
                loadProjectDetails(projectId);
            });
        });
    }

    function loadProjectDetails(projectId) {
        const projectList = document.getElementById('projectList');
        const projectDetails = document.getElementById('projectDetails');

        projectList.style.display = 'none';
        projectDetails.style.display = 'block';
        let projectContent = '';

        if (projectId === 'project1') {
            projectContent = `
                <h1>Project One Details</h1>
                <p>Detailed information about Project One.</p>
                <button id="backToProjects">Back to Projects</button>
            `;
        } else if (projectId === 'project2') {
            projectContent = `
                <h1>Project Two Details</h1>
                <p>Detailed information about Project Two.</p>
                <button id="backToProjects">Back to Projects</button>
            `;
        }

        projectDetails.innerHTML = projectContent;

        document.getElementById('backToProjects').addEventListener('click', function() {
            projectList.style.display = 'block';
            projectDetails.style.display = 'none';
        });
    }

    // Simulate System Performance
    function updateSystemPerformance() {
        const cpuBar = document.getElementById('cpu-bar');
        const cpuPercentageText = document.getElementById('cpu-percentage');
        const memoryBar = document.getElementById('memory-bar');
        const memoryPercentageText = document.getElementById('memory-percentage');

        let cpuUsage = 10 + openWindows.length * 10;
        if (cpuUsage > 100) cpuUsage = 100;

        let memoryUsage = 20 + openWindows.length * 15;
        if (memoryUsage > 100) memoryUsage = 100;

        cpuBar.style.width = cpuUsage + '%';
        cpuPercentageText.textContent = cpuUsage + '%';

        memoryBar.style.width = memoryUsage + '%';
        memoryPercentageText.textContent = memoryUsage + '%';
    }

    // Ensure terminal window updates system performance when closed
    terminalWindow.querySelector('.close-button').addEventListener('click', function() {
        terminalWindow.style.display = 'none';
        const index = openWindows.indexOf('terminalWindow');
        if (index > -1) {
            openWindows.splice(index, 1);
            updateSystemPerformance();
        }
    });

    // Browser Functionality
    const browserWindow = document.getElementById('browserWindow');
    const addressBar = document.getElementById('address-bar');
    const browserIframe = document.getElementById('browser-iframe');
    const backButton = document.getElementById('back-button');
    const forwardButton = document.getElementById('forward-button');
    const refreshButton = document.getElementById('refresh-button');
    const goButton = document.getElementById('go-button');

    goButton.addEventListener('click', function() {
        let url = addressBar.value;
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        browserIframe.src = url;
    });

    refreshButton.addEventListener('click', function() {
        browserIframe.contentWindow.location.reload();
    });

    // Back and Forward buttons functionality is limited due to iframe restrictions
    backButton.addEventListener('click', function() {
        browserIframe.contentWindow.history.back();
    });

    forwardButton.addEventListener('click', function() {
        browserIframe.contentWindow.history.forward();
    });
});
