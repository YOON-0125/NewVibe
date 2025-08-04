import React, { useRef, useEffect } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { GameEngine } from '../game/GameEngine';
import { applyArtifacts } from '../game/systems/ArtifactSystem';

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
        gameEngineRef.current.resume();
      } else {
        gameEngineRef.current.pause();
      }
    }
  }, [state.isPlaying, state.isPaused]); // 레벨업으로 인한 일시정지는 게임을 재시작하지 않음

  // 게임 시작 또는 새 라운드 시작시에만 재시작
  useEffect(() => {
    if (gameEngineRef.current && state.isPlaying && !state.isPaused && !state.showLevelUp) {
      const finalState = applyArtifacts(state, state.ownedArtifacts);
      gameEngineRef.current.restart(finalState);
    }
  }, [state.ownedArtifacts, state.difficulty]); // 유물이나 난이도가 변경될 때만 재시작

  useEffect(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.updateFromGameState(state);
    }
  }, [state]);

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