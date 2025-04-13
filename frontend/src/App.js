import React, { useState } from 'react';
import styled from 'styled-components';
import LoginScreen from './components/LoginScreen';
import WaitingRoom from './components/WaitingRoom';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';

const AppContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

function App() {
  const [screen, setScreen] = useState('login');
  const [playerName, setPlayerName] = useState('');
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameData, setGameData] = useState({
    paragraph: '',
    rankings: [],
    timer: 0
  });

  // Connect to WebSocket server
  const connectToServer = (name) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const port = '8000'; // Server port
    
    const wsUrl = `${protocol}//${host}:${port}/ws/${encodeURIComponent(name)}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to server');
      setSocket(ws);
      setScreen('waiting');
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleServerMessage(message);
    };
    
    ws.onclose = () => {
      console.log('Disconnected from server');
      // Optionally handle reconnection
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  // Handle messages from the server
  const handleServerMessage = (message) => {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'players_list':
        setPlayers(message.players);
        break;
      
      case 'new_player':
        setPlayers(prev => {
          // Check if player already exists
          if (!prev.some(p => p.name === message.player_name)) {
            return [...prev, { name: message.player_name, progress: 0 }];
          }
          return prev;
        });
        break;
      
      case 'player_disconnected':
        setPlayers(prev => prev.filter(p => p.name !== message.player_name));
        break;
      
      case 'game_start':
        setGameData(prev => ({ ...prev, paragraph: message.paragraph }));
        setScreen('game');
        break;
      
      case 'progress_update':
        setPlayers(prev => prev.map(player => {
          if (player.name === message.player_name) {
            return { ...player, progress: message.progress };
          }
          return player;
        }));
        break;
      
      case 'player_finished':
        setPlayers(prev => prev.map(player => {
          if (player.name === message.player_name) {
            return { ...player, progress: 100, rank: message.rank, finished: true };
          }
          return player;
        }));
        break;
      
      case 'game_over':
        setGameData(prev => ({ ...prev, rankings: message.rankings }));
        setScreen('gameOver');
        break;
      
      case 'error':
        alert(message.message);
        break;
      
      default:
        break;
    }
  };

  // Handle player login
  const handleLogin = (name) => {
    setPlayerName(name);
    connectToServer(name);
  };

  // Request to start the game
  const startGame = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'start_game' }));
    }
  };

  // Update player progress
  const updateProgress = (progress) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ 
        type: 'progress_update',
        progress: progress
      }));
    }
  };

  // Reset and go back to waiting room
  const playAgain = () => {
    setScreen('waiting');
  };

  // Render the appropriate screen
  return (
    <AppContainer>
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {screen === 'waiting' && (
        <WaitingRoom 
          players={players} 
          onStartGame={startGame} 
        />
      )}
      
      {screen === 'game' && (
        <GameScreen 
          playerName={playerName}
          paragraph={gameData.paragraph}
          players={players}
          updateProgress={updateProgress}
        />
      )}
      
      {screen === 'gameOver' && (
        <GameOverScreen 
          rankings={gameData.rankings} 
          onPlayAgain={playAgain} 
        />
      )}
    </AppContainer>
  );
}

export default App;