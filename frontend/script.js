document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const waitingRoom = document.getElementById('waiting-room');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over');
    
    const playerNameInput = document.getElementById('player-name');
    const joinBtn = document.getElementById('join-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const waitingPlayers = document.getElementById('waiting-players');
    
    const paragraphText = document.getElementById('paragraph-text');
    const typingInput = document.getElementById('typing-input');
    const playerTracks = document.getElementById('player-tracks');
    const liveRankings = document.getElementById('live-rankings');
    const timer = document.getElementById('timer');
    
    const finalRankings = document.getElementById('final-rankings');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // Game state variables
    let socket = null;
    let playerName = '';
    let gameInProgress = false;
    let gameStartTime = null;
    let timerInterval = null;
    let targetParagraph = '';
    let players = [];
    let carEmojis = ['🚗', '🚕', '🚙', '🏎️', '🚓', '🚑', '🚚', '🚛', '🚜', '🚐'];
    
    // Event Listeners
    joinBtn.addEventListener('click', joinGame);
    startGameBtn.addEventListener('click', requestGameStart);
    playAgainBtn.addEventListener('click', backToWaitingRoom);
    
    // Player wants to join the game
    function joinGame() {
        playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        
        // Connect to WebSocket server
        connectToServer();
        
        // Show waiting room
        loginScreen.style.display = 'none';
        waitingRoom.style.display = 'block';
    }
    
    // Connect to WebSocket server
    function connectToServer() {
        // Get the current hostname to connect to the server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname || 'localhost';
        const port = '8000'; // Server port
        
        const wsUrl = `${protocol}//${host}:${port}/ws/${encodeURIComponent(playerName)}`;
        socket = new WebSocket(wsUrl);
        
        // WebSocket event handlers
        socket.onopen = () => {
            console.log('Connected to server');
        };
        
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
        };
        
        socket.onclose = () => {
            console.log('Disconnected from server');
            // Handle reconnection logic if needed
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    // Handle messages from the server
    function handleServerMessage(message) {
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'players_list':
                updatePlayersList(message.players);
                break;
            
            case 'new_player':
                addPlayerToList(message.player_name);
                break;
            
            case 'player_disconnected':
                removePlayerFromList(message.player_name);
                break;
            
            case 'game_start':
                startGame(message.paragraph);
                break;
            
            case 'progress_update':
                updatePlayerProgress(message.player_name, message.progress);
                break;
            
            case 'player_finished':
                playerFinished(message.player_name, message.rank);
                break;
            
            case 'game_over':
                endGame(message.rankings);
                break;
            
            case 'error':
                showError(message.message);
                break;
        }
    }
    
    // Update the list of players in the waiting room
    function updatePlayersList(playersList) {
        players = playersList;
        waitingPlayers.innerHTML = '';
        
        playersList.forEach(player => {
            addPlayerToList(player.name);
        });
        
        // Enable/disable start button based on player count
        startGameBtn.disabled = playersList.length < 2;
    }
    
    // Add a new player to the list
    function addPlayerToList(name) {
        const playerExists = Array.from(waitingPlayers.children)
            .some(li => li.textContent === name);
            
        if (!playerExists) {
            const li = document.createElement('li');
            li.textContent = name;
            li.dataset.name = name;
            waitingPlayers.appendChild(li);
            
            // Update player count check
            startGameBtn.disabled = waitingPlayers.children.length < 2;
        }
    }
    
    // Remove a player from the list
    function removePlayerFromList(name) {
        const playerItem = Array.from(waitingPlayers.children)
            .find(li => li.dataset.name === name);
            
        if (playerItem) {
            waitingPlayers.removeChild(playerItem);
            // Update player count check
            startGameBtn.disabled = waitingPlayers.children.length < 2;
        }
    }
    
    // Request to start the game
    function requestGameStart() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'start_game' }));
        }
    }
    
    // Start the game with the given paragraph
    function startGame(paragraph) {
        targetParagraph = paragraph;
        paragraphText.textContent = paragraph;
        typingInput.value = '';
        typingInput.disabled = false;
        
        // Setup progress tracking
        setupPlayerTracks();
        
        // Start the timer
        gameStartTime = Date.now();
        startTimer();
        
        // Setup typing event listener
        typingInput.addEventListener('input', checkTypingProgress);
        
        // Show the game screen
        waitingRoom.style.display = 'none';
        gameScreen.style.display = 'block';
        gameInProgress = true;
        
        // Focus on typing input
        typingInput.focus();
    }
    
    // Set up the race tracks for all players
    function setupPlayerTracks() {
        playerTracks.innerHTML = '';
        
        // Get all unique player names from the waiting room
        const playerNames = Array.from(waitingPlayers.children)
            .map(li => li.dataset.name);
        
        playerNames.forEach((name, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'player-track';
            trackDiv.dataset.player = name;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name';
            nameSpan.textContent = name;
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.style.width = '0%';
            
            // Add car emoji
            const carEmoji = document.createElement('span');
            carEmoji.className = 'progress-car';
            carEmoji.textContent = carEmojis[index % carEmojis.length];
            progressBar.appendChild(carEmoji);
            
            progressContainer.appendChild(progressBar);
            
            const progressText = document.createElement('span');
            progressText.className = 'progress-text';
            progressText.textContent = '0%';
            
            trackDiv.appendChild(nameSpan);
            trackDiv.appendChild(progressContainer);
            trackDiv.appendChild(progressText);
            
            playerTracks.appendChild(trackDiv);
            
            // Add to live rankings
            const rankItem = document.createElement('li');
            rankItem.dataset.player = name;
            rankItem.textContent = name + ' - 0%';
            liveRankings.appendChild(rankItem);
        });
    }
    
    // Start the timer
    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
            timer.textContent = `Time: ${elapsedSeconds}s`;
        }, 1000);
    }
    
    // Check typing progress
    function checkTypingProgress() {
        const typedText = typingInput.value;
        const correctChars = calculateCorrectCharacters(typedText, targetParagraph);
        const progress = Math.min(100, Math.floor((correctChars / targetParagraph.length) * 100));
        
        // Update my progress
        updatePlayerProgress(playerName, progress);
        
        // Send progress to server
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
                type: 'progress_update',
                progress: progress
            }));
        }
        
        // Check if I finished
        if (progress >= 100) {
            typingInput.disabled = true;
        }
    }
    
    // Calculate correct characters typed
    function calculateCorrectCharacters(typed, target) {
        let correctCount = 0;
        for (let i = 0; i < typed.length && i < target.length; i++) {
            if (typed[i] === target[i]) {
                correctCount++;
            }
        }
        return correctCount;
    }
    
    // Update a player's progress
    function updatePlayerProgress(playerName, progress) {
        // Update track
        const trackDiv = document.querySelector(`.player-track[data-player="${playerName}"]`);
        if (trackDiv) {
            const progressBar = trackDiv.querySelector('.progress-bar');
            const progressText = trackDiv.querySelector('.progress-text');
            
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
        
        // Update rankings
        updateLiveRankings();
    }
    
    // Update the live rankings
    function updateLiveRankings() {
        // Get all progress data
        const progressData = Array.from(playerTracks.children).map(track => {
            const name = track.dataset.player;
            const progress = parseInt(track.querySelector('.progress-text').textContent);
            return { name, progress };
        });
        
        // Sort by progress (descending)
        progressData.sort((a, b) => b.progress - a.progress);
        
        // Update the rankings list
        liveRankings.innerHTML = '';
        progressData.forEach(player => {
            const li = document.createElement('li');
            li.dataset.player = player.name;
            li.textContent = `${player.name} - ${player.progress}%`;
            liveRankings.appendChild(li);
        });
    }
    
    // Handle player finished
    function playerFinished(playerName, rank) {
        const trackDiv = document.querySelector(`.player-track[data-player="${playerName}"]`);
        if (trackDiv) {
            trackDiv.style.opacity = '0.7';
            const nameSpan = trackDiv.querySelector('.player-name');
            nameSpan.textContent = `${playerName} (${getOrdinal(rank)})`;
        }
    }
    
    // End the game with final rankings
    function endGame(rankings) {
        clearInterval(timerInterval);
        gameInProgress = false;
        
        // Display final rankings
        finalRankings.innerHTML = '';
        rankings.forEach(([name, rank]) => {
            const li = document.createElement('li');
            li.textContent = `${getOrdinal(rank)}: ${name}`;
            finalRankings.appendChild(li);
        });
        
        // Show game over screen
        gameScreen.style.display = 'none';
        gameOverScreen.style.display = 'block';
    }
    
    // Go back to waiting room
    function backToWaitingRoom() {
        // Reset game state
        typingInput.value = '';
        typingInput.removeEventListener('input', checkTypingProgress);
        
        // Show waiting room
        gameOverScreen.style.display = 'none';
        waitingRoom.style.display = 'block';
    }
    
    // Show error message
    function showError(message) {
        alert(message);
    }
    
    // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
    function getOrdinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
});