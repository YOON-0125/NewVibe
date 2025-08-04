import React from 'react';
import { createPortal } from 'react-dom';
import { useGameState } from '../contexts/GameStateContext';

const GameOver: React.FC = () => {
  const { state, dispatch } = useGameState();

  console.log('GameOver component render:', { isGameOver: state.isGameOver, health: state.player.health });

  if (!state.isGameOver) {
    console.log('GameOver not showing because isGameOver is false');
    return null;
  }
  
  console.log('GameOver component is rendering UI!');

  const handleRestart = () => {
    // (Gemini) START_NEW_ROUND 액션으로 게임 재시작
    dispatch({ type: 'START_NEW_ROUND', payload: { newArtifactId: null } });
  };

  const handleMainMenu = () => {
    // 게임오버 상태를 먼저 해제하고 메인메뉴로 이동
    dispatch({ type: 'SHOW_MAIN_MENU' });
    // 게임 상태를 완전히 초기화
    setTimeout(() => {
      window.location.reload(); // 완전한 초기화를 위해 페이지 새로고침
    }, 100);
  };

  const gameOverModal = (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto'
      }}
    >
      {/* 게임오버 모달 */}
      <div 
        className="bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 text-center border-2 border-red-500"
        style={{ position: 'relative', zIndex: 100000 }}
      >
        <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>
        
        {/* 게임 결과 */}
        <div className="text-white mb-6 space-y-2">
          <p className="text-lg">Level: <span className="text-yellow-400">{state.player.level}</span></p>
          <p className="text-lg">Score: <span className="text-blue-400">{state.score.toLocaleString()}</span></p>
          <p className="text-lg">Time: <span className="text-green-400">{Math.floor(state.time / 60)}:{String(Math.floor(state.time % 60)).padStart(2, '0')}</span></p>
        </div>

        {/* 버튼들 */}
        <div className="menu-buttons">
          <button
            onClick={handleRestart}
            className="menu-button primary"
          >
            재도전
          </button>
          
          <button
            onClick={handleMainMenu}
            className="menu-button secondary"
          >
            메인 메뉴
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(gameOverModal, document.body);
};

export default GameOver;