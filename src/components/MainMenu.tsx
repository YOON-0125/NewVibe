import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

const MainMenu: React.FC = () => {
  const { state, dispatch } = useGameState();

  if (!state.showMainMenu) return null;

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const handleSettings = () => {
    // TODO: 설정 화면 구현
    console.log('Settings clicked');
  };

  return (
    <div className="main-menu-overlay">
      <div className="main-menu">
        <h1 className="game-title">NewVibe</h1>
        <p className="game-subtitle">뱀파이어 서바이벌</p>
        
        <div className="menu-buttons">
          <button 
            className="menu-button primary"
            onClick={handleStartGame}
          >
            게임 시작
          </button>
          
          <button 
            className="menu-button secondary"
            onClick={handleSettings}
          >
            설정
          </button>
        </div>
        
        <div className="game-info">
          <p>목표: 15분 생존</p>
          <p>조작: 터치/클릭으로 이동</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;