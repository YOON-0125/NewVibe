import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../core/Game';
import { Player } from '../core/entities/Player'; // 추가
import { PixiRenderer } from '../renderer/PixiRenderer';

interface GameCanvasProps {
  onGameReady?: (game: Game) => void;
  onPlayerReady?: (player: Player) => void; // 추가
  className?: string;
}

/**
 * PixiJS 캔버스를 렌더링하는 React 컴포넌트
 */
export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onGameReady, 
  onPlayerReady, // 추가
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rendererRef = useRef<PixiRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!canvasRef.current) {
          throw new Error('Canvas element not found');
        }

        // 게임 초기화 (캔버스 전달)
        const game = new Game();
        await game.init(canvasRef.current);
        
        gameRef.current = game;
        rendererRef.current = game.getRenderer();

        // 게임 시작
        game.start();
        if (rendererRef.current) {
          rendererRef.current.start();
        }

        // 부모 컴포넌트에 게임 인스턴스 전달
        if (onGameReady) {
          onGameReady(game);
        }

        setIsLoading(false);
        console.log('Game initialized successfully');

      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    initializeGame();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (gameRef.current) {
        gameRef.current.dispose(); // Game에서 모든 정리 처리
        gameRef.current = null;
      }
      
      rendererRef.current = null; // Game에서 이미 dispose됨
    };
  }, [onGameReady]);

  // 캔버스 크기 조정
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && rendererRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          
          // 비율 유지하면서 크기 조정
          const aspectRatio = 800 / 600; // 기본 비율
          let newWidth = width;
          let newHeight = width / aspectRatio;
          
          if (newHeight > height) {
            newHeight = height;
            newWidth = height * aspectRatio;
          }
          
          canvas.style.width = `${newWidth}px`;
          canvas.style.height = `${newHeight}px`;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 크기 설정

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}>
        <div className="text-center">
          <h3 className="font-bold mb-2">게임 로딩 실패</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>게임 로딩 중...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="block mx-auto border border-gray-300 rounded"
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
      
      {!isLoading && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-black bg-opacity-50 px-2 py-1 rounded">
          조선 로그라이크 v0.1.0
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
