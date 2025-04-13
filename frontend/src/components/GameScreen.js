import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 20px;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #f1f1f1;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`;

const Timer = styled.div`
  background-color: #222f3e;
  color: #00cec9;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
`;

const ParagraphContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  margin-bottom: 20px;
  font-family: monospace;
  font-size: 1.1rem;
  line-height: 1.6;
  position: relative;
`;

const CharacterSpan = styled.span`
  color: ${props => {
    if (props.state === 'correct') return '#00b894';
    if (props.state === 'incorrect') return '#ff7675';
    return '#dfe6e9';
  }};
  background-color: ${props => props.isCurrent ? 'rgba(0, 255, 255, 0.2)' : 'transparent'};
  border-radius: 2px;
  font-weight: ${props => props.isCurrent ? 'bold' : 'normal'};
`;

const TypingArea = styled.div`
  margin-bottom: 30px;
  position: relative;
`;

const TypingInput = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 15px;
  border: 2px solid #00cec9;
  border-radius: 8px;
  font-size: 16px;
  resize: none;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  caret-color: #00cec9;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
`;

const RaceTrack = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  margin-bottom: 20px;
`;

const TrackTitle = styled.h3`
  margin-bottom: 15px;
  color: #00cec9;
`;

const PlayerTrack = styled.div`
  margin: 15px 0;
  display: flex;
  align-items: center;
`;

const PlayerName = styled.span`
  display: inline-block;
  width: 100px;
  font-weight: bold;
  color: ${props => props.isCurrentPlayer ? '#00cec9' : '#dfe6e9'};
`;

const ProgressContainer = styled.div`
  display: inline-flex;
  width: calc(100% - 150px);
  height: 25px;
  background-color: #2d3436;
  border-radius: 20px;
  margin: 0 10px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(to right, #00cec9, #00b894);
  border-radius: 20px;
  transition: width 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.progress || 0}%;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`;

const ProgressCar = styled.span`
  position: relative;
  font-size: 20px;
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.7));
`;

const ProgressText = styled.span`
  width: 40px;
  text-align: right;
  font-weight: bold;
  color: #dfe6e9;
`;

const Rankings = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
`;

const RankingsTitle = styled.h3`
  margin-bottom: 15px;
  color: #00cec9;
`;

const RankingsList = styled.ol`
  margin-left: 20px;
  color: #dfe6e9;
`;

const RankingsItem = styled.li`
  padding: 5px 0;
  color: ${props => props.isCurrentPlayer ? '#00cec9' : '#dfe6e9'};
  font-weight: ${props => props.isCurrentPlayer ? 'bold' : 'normal'};
`;

function GameScreen({ playerName, paragraph, players, updateProgress }) {
  const [typedText, setTypedText] = useState('');
  const [characters, setCharacters] = useState([]);
  const [timer, setTimer] = useState(0);
  const [currentPos, setCurrentPos] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const carEmojis = ['🚗', '🚕', '🚙', '🏎️', '🚓', '🚑', '🚚', '🚛', '🚜', '🚐'];

  // Initialize characters state when paragraph changes
  useEffect(() => {
    if (paragraph) {
      const chars = paragraph.split('').map(char => ({
        char,
        state: 'pending', // 'pending', 'correct', or 'incorrect'
      }));
      setCharacters(chars);
      setTypedText('');
      setCurrentPos(0);
      
      // Start timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      
      // Focus input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [paragraph]);

  // Handle typing
  const handleTyping = (e) => {
    const newText = e.target.value;
    
    // Reset the state of characters we're no longer at
    if (newText.length < typedText.length) {
      // User pressed backspace or deleted text
      const newCharacters = [...characters];
      
      // Reset states for characters that are no longer typed
      for (let i = newText.length; i < typedText.length && i < characters.length; i++) {
        newCharacters[i].state = 'pending';
      }
      
      setCharacters(newCharacters);
      setTypedText(newText);
      setCurrentPos(newText.length);
      
      // Calculate progress percentage
      const correctChars = newCharacters.filter(char => char.state === 'correct').length;
      const progress = Math.min(100, Math.floor((correctChars / newCharacters.length) * 100));
      
      // Send progress update
      updateProgress(progress);
      return;
    }
    
    // Handle new character typing
    if (newText.length > typedText.length) {
      // Get the newly typed character
      const newChar = newText.charAt(newText.length - 1);
      
      // Update the state of the current character
      const newCharacters = [...characters];
      
      // Only process if we haven't reached the end
      if (currentPos < newCharacters.length) {
        const isCorrect = newCharacters[currentPos].char === newChar;
        newCharacters[currentPos].state = isCorrect ? 'correct' : 'incorrect';
        
        setCharacters(newCharacters);
        setTypedText(newText);
        setCurrentPos(currentPos + 1);
        
        // Calculate progress percentage
        const correctChars = newCharacters.filter(char => char.state === 'correct').length;
        const progress = Math.min(100, Math.floor((correctChars / newCharacters.length) * 100));
        
        // Send progress update
        updateProgress(progress);
      }
    }
  };

  // Prevent paste
  const handlePaste = (e) => {
    e.preventDefault();
    alert("Pasting is not allowed!");
  };

  // Prevent copying the paragraph
  const handleParagraphCopy = (e) => {
    e.preventDefault();
    alert("Copying is not allowed!");
  };

  // Get player rankings
  const getRankings = () => {
    return [...players].sort((a, b) => b.progress - a.progress);
  };

  // Render the characters with appropriate styling
  const renderParagraph = () => {
    return characters.map((char, index) => (
      <CharacterSpan 
        key={index} 
        state={char.state}
        isCurrent={index === currentPos}
      >
        {char.char}
      </CharacterSpan>
    ));
  };

  return (
    <Container>
      <GameHeader>
        <Title>Typing Race</Title>
        <Timer>Time: {timer}s</Timer>
      </GameHeader>
      
      <ParagraphContainer onCopy={handleParagraphCopy}>
        {renderParagraph()}
      </ParagraphContainer>
      
      <TypingArea>
        <TypingInput 
          ref={inputRef}
          value={typedText}
          onChange={handleTyping}
          onPaste={handlePaste}
          onCopy={e => e.preventDefault()}
          onCut={e => e.preventDefault()}
          spellCheck="false"
          autoComplete="off"
        />
      </TypingArea>
      
      <RaceTrack>
        <TrackTitle>Race Progress</TrackTitle>
        {players.map((player, index) => (
          <PlayerTrack key={index}>
            <PlayerName isCurrentPlayer={player.name === playerName}>
              {player.name}
            </PlayerName>
            
            <ProgressContainer>
              <ProgressBar progress={player.progress || 0}>
                <ProgressCar>{carEmojis[index % carEmojis.length]}</ProgressCar>
              </ProgressBar>
            </ProgressContainer>
            
            <ProgressText>{player.progress || 0}%</ProgressText>
          </PlayerTrack>
        ))}
      </RaceTrack>
      
      <Rankings>
        <RankingsTitle>Current Rankings</RankingsTitle>
        <RankingsList>
          {getRankings().map((player, index) => (
            <RankingsItem 
              key={index}
              isCurrentPlayer={player.name === playerName}
            >
              {player.name} - {player.progress || 0}%
            </RankingsItem>
          ))}
        </RankingsList>
      </Rankings>
    </Container>
  );
}

export default GameScreen;