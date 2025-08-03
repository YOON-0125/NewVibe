import React, { useRef, useEffect } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { GameEngine } from '../game/GameEngine';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { state, dispatch } = useGameState();

  useEffect(() => {
    if (!canvasRef.current) return;

    const gameEngine = new GameEngine(canvasRef.current, dispatch);
    gameEngineRef.current = gameEngine;

    gameEngine.init().then(() => {
      console.log('Game engine initialized');
    });

    return () => {
      gameEngine.destroy();
    };
  }, [dispatch]);

  useEffect(() => {
    if (gameEngineRef.current) {
      if (state.isPlaying && !state.isPaused) {
        // 게임이 처음 시작되거나 재시작 시에만 restart 호출
        if (state.player.level === 1 && state.time === 0) {
          gameEngineRef.current.restart();
        } else {
          gameEngineRef.current.start();
        }
      } else {
        gameEngineRef.current.pause();
      }
    }
  }, [state.isPlaying, state.isPaused, state.player.level, state.time]);

  // 플레이어 상태를 GameEngine에 전달
  useEffect(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.updatePlayerStats(state.player.level, state.player.health);
    }
  }, [state.player.level, state.player.health]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gameEngineRef.current || !state.isPlaying || state.isPaused) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    gameEngineRef.current.handleInput({ type: 'move', x, y });
  };

  const handleCanvasTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!gameEngineRef.current || !state.isPlaying || state.isPaused) return;
    
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = event.touches[0] || event.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    gameEngineRef.current.handleInput({ type: 'move', x, y });
  };

  return (
    <div
      ref={canvasRef}
      className="game-canvas"
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasTouch}
      style={{
        width: '100%',
        height: '455px',
        position: 'relative',
        backgroundColor: '#222',
        touchAction: 'none',
        userSelect: 'none',
      }}
    />
  );
};

export default GameCanvas;