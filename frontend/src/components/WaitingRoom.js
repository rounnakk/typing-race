import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  margin-top: 50px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #f1f1f1;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`;

const Subtitle = styled.p`
  margin-bottom: 30px;
  color: #dfe6e9;
`;

const PlayerList = styled.div`
  margin: 20px auto;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  max-width: 400px;
`;

const PlayerListTitle = styled.h3`
  margin-bottom: 15px;
  color: #00cec9;
`;

const PlayerUL = styled.ul`
  list-style-type: none;
  text-align: left;
  padding: 10px;
`;

const PlayerLI = styled.li`
  padding: 8px 15px;
  margin-bottom: 8px;
  border-radius: 5px;
  border-left: 3px solid #00cec9;
  background: rgba(255, 255, 255, 0.1);
`;

const StartButton = styled.button`
  padding: 12px 25px;
  background-color: #00cec9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
  margin-top: 20px;
  
  &:hover:not(:disabled) {
    background-color: #00b5ad;
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: #636e72;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const WaitingMessage = styled.p`
  margin-top: 15px;
  color: #ff7675;
  font-size: 14px;
`;

function WaitingRoom({ players, onStartGame }) {
  return (
    <Container>
      <Title>Waiting Room</Title>
      <Subtitle>Waiting for players to join...</Subtitle>
      
      <PlayerList>
        <PlayerListTitle>Players:</PlayerListTitle>
        <PlayerUL>
          {players.map((player, index) => (
            <PlayerLI key={index}>{player.name}</PlayerLI>
          ))}
        </PlayerUL>
      </PlayerList>
      
      <StartButton 
        onClick={onStartGame} 
        disabled={players.length < 2}
      >
        Start Game
      </StartButton>
      
      {players.length < 2 && (
        <WaitingMessage>Need at least 2 players to start</WaitingMessage>
      )}
    </Container>
  );
}

export default WaitingRoom;