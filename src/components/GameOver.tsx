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
    // 게임 상태 초기화
    dispatch({ type: 'START_GAME' });
    
    // 플레이어 상태 초기화
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: {
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 100,
        maxHealth: 100,
        x: 187.5, // 375 / 2
        y: 227.5, // 455 / 2
      }
    });

    // 무기 상태 초기화
    dispatch({
      type: 'UPDATE_WEAPON',
      payload: {
        weapon: 'orbital',
        updates: { level: 0, damage: 10, count: 0 }
      }
    });
    dispatch({
      type: 'UPDATE_WEAPON',
      payload: {
        weapon: 'projectile',
        updates: { level: 0, damage: 15, speed: 200 }
      }
    });
    dispatch({
      type: 'UPDATE_WEAPON',
      payload: {
        weapon: 'shield',
        updates: { level: 0, health: 0, regeneration: 0 }
      }
    });

    // 점수와 시간 초기화
    dispatch({ type: 'UPDATE_SCORE', payload: 0 });
    dispatch({ type: 'UPDATE_TIME', payload: 0 });
  };

  const handleMainMenu = () => {
    dispatch({ type: 'SHOW_MAIN_MENU' });
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
        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
          >
            재도전
          </button>
          
          <button
            onClick={handleMainMenu}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
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