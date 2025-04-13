import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  margin-top: 50px;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  color: #f1f1f1;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-size: 2rem;
`;

const FinalRankings = styled.div`
  margin: 30px auto;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
`;

const RankingsTitle = styled.h3`
  margin-bottom: 15px;
  color: #00cec9;
`;

const RankingsList = styled.ol`
  text-align: left;
  margin-left: 20px;
  color: #dfe6e9;
`;

const RankingsItem = styled.li`
  padding: 10px 0;
  font-size: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const PlayAgainButton = styled.button`
  margin-top: 20px;
  padding: 12px 30px;
  font-size: 18px;
  background-color: #00b894;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
  
  &:hover {
    background-color: #00a884;
    transform: scale(1.05);
  }
`;

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function GameOverScreen({ rankings, onPlayAgain }) {
  return (
    <Container>
      <Title>Game Over!</Title>
      
      <FinalRankings>
        <RankingsTitle>Final Rankings</RankingsTitle>
        <RankingsList>
          {rankings.map(([name, rank], index) => (
            <RankingsItem key={index}>
              {getOrdinal(rank)}: {name}
            </RankingsItem>
          ))}
        </RankingsList>
      </FinalRankings>
      
      <PlayAgainButton onClick={onPlayAgain}>
        Play Again
      </PlayAgainButton>
    </Container>
  );
}

export default GameOverScreen;