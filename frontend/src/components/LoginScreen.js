import React, { useState } from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  text-align: center;
  margin-top: 100px;
`;

const Title = styled.h1`
  margin-bottom: 30px;
  color: #f1f1f1;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`;

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #30336b;
  border-radius: 4px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #222;
  
  &:focus {
    outline: none;
    border-color: #00cec9;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  background-color: #00cec9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
  
  &:hover {
    background-color: #00b5ad;
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <LoginContainer>
      <Title>Typing Race Multiplayer</Title>
      <LoginForm as="form" onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Enter your name" 
          maxLength="15"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit">Join Game</Button>
      </LoginForm>
    </LoginContainer>
  );
}

export default LoginScreen;