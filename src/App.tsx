import React, { useState, useCallback } from 'react';
import './App.css';

import { Game } from './core/Game';
import { Player } from './core/entities/Player';
import { Scene } from './shared/types';

// UI 컴포넌트들
import GameCanvas from './ui/GameCanvas';
import MainMenu from './ui/MainMenu';
import HUD from './ui/HUD';
import AbilityPanel from './ui/AbilityPanel';

/**
 * 메인 앱 컴포넌트
 */
function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.MainMenu);
  const [player, setPlayer] = useState<Player | null>(null);
  const [showAbilityPanel, setShowAbilityPanel] = useState(false);

  /**
   * 게임 준비 완료 콜백
   */
  const handleGameReady = useCallback((gameInstance: Game) => {
    setGame(gameInstance);
    console.log('Game ready!');
  }, []);

  /**
   * 새 게임 시작
   */
  const handleStartNewGame = useCallback(() => {
    console.log('Starting new game...');
    setCurrentScene(Scene.Game);
    
    // 게임이 준비되면 플레이어 생성
    if (game) {
      // 임시 플레이어 생성 (실제로는 게임 시스템에서 생성)
      const newPlayer = new Player(
        'player_1',
        '무명의 무사',
        { x: 10, y: 10 },
        {
          health: 100,
          attack: 15,
          defense: 8,
          speed: 100,
          mana: 50,
        }
      );
      setPlayer(newPlayer);
    }
  }, [game]);

  /**
   * 게임 불러오기
   */
  const handleLoadGame = useCallback(() => {
    console.log('Loading game...');
    // TODO: 게임 불러오기 구현
    alert('게임 불러오기 기능은 아직 구현되지 않았습니다.');
  }, []);

  /**
   * 설정 메뉴
   */
  const handleSettings = useCallback(() => {
    console.log('Opening settings...');
    // TODO: 설정 메뉴 구현
    alert('설정 기능은 아직 구현되지 않았습니다.');
  }, []);

  /**
   * 게임 종료
   */
  const handleExit = useCallback(() => {
    console.log('Exiting game...');
    if (window.confirm('정말로 게임을 종료하시겠습니까?')) {
      window.close();
    }
  }, []);

  /**
   * 메인 메뉴로 돌아가기
   */
  const handleBackToMenu = useCallback(() => {
    if (window.confirm('메인 메뉴로 돌아가시겠습니까? (진행 상황이 저장되지 않을 수 있습니다.)')) {
      setCurrentScene(Scene.MainMenu);
      setPlayer(null);
      
      if (game) {
        game.stop();
      }
    }
  }, [game]);

  /**
   * 능력 사용
   */
  const handleUseAbility = useCallback((abilityIndex: number) => {
    if (player) {
      const success = player.useAbility(abilityIndex);
      if (success) {
        console.log(`Used ability at index ${abilityIndex}`);
      } else {
        console.log(`Failed to use ability at index ${abilityIndex}`);
      }
    }
  }, [player]);

  /**
   * 키보드 입력 처리
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'Escape':
        if (currentScene === Scene.Game) {
          if (showAbilityPanel) {
            setShowAbilityPanel(false);
          } else {
            handleBackToMenu();
          }
        }
        break;
      
      case 'KeyI':
      case 'Tab':
        if (currentScene === Scene.Game) {
          setShowAbilityPanel(!showAbilityPanel);
          event.preventDefault();
        }
        break;
      
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
        if (currentScene === Scene.Game && !showAbilityPanel) {
          const abilityIndex = parseInt(event.code.slice(-1)) - 1;
          handleUseAbility(abilityIndex);
        }
        break;
    }
  }, [currentScene, showAbilityPanel, handleBackToMenu, handleUseAbility]);

  // 키보드 이벤트 리스너 등록
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 씬별 렌더링
  const renderCurrentScene = () => {
    switch (currentScene) {
      case Scene.MainMenu:
        return (
          <MainMenu
            onStartGame={handleStartNewGame}
            onLoadGame={handleLoadGame}
            onSettings={handleSettings}
            onExit={handleExit}
            className="z-10"
          />
        );

      case Scene.Game:
        return (
          <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* 게임 캔버스 */}
            <GameCanvas
              onGameReady={handleGameReady}
              className="absolute inset-0"
            />
            
            {/* HUD */}
            <HUD
              player={player}
              className="z-20"
            />
            
            {/* 능력 패널 */}
            {showAbilityPanel && (
              <AbilityPanel
                player={player}
                onUseAbility={handleUseAbility}
                onClosePanel={() => setShowAbilityPanel(false)}
                className="z-30"
              />
            )}
            
            {/* 디버그 정보 (개발 모드에서만) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-40">
                <div>Scene: {currentScene}</div>
                <div>Player: {player ? player.getName() : 'None'}</div>
                <div>Game: {game ? 'Ready' : 'Loading...'}</div>
                <div className="mt-2 text-gray-400">
                  <div>ESC: 메뉴</div>
                  <div>I/Tab: 능력</div>
                  <div>1-4: 능력 사용</div>
                </div>
              </div>
            )}
          </div>
        );

      case Scene.GameOver:
        return (
          <div className="flex items-center justify-center min-h-screen bg-red-900">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">게임 오버</h2>
              <p className="text-xl mb-8">당신의 여정이 끝났습니다...</p>
              <button
                onClick={handleBackToMenu}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded text-lg"
              >
                메인 메뉴로 돌아가기
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-4">알 수 없는 씬</h2>
              <p className="mb-4">잘못된 게임 상태입니다.</p>
              <button
                onClick={handleBackToMenu}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                메인 메뉴로
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentScene()}
      
      {/* 글로벌 로딩 오버레이 */}
      {currentScene === Scene.Game && !game && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">게임 로딩 중...</h3>
            <p className="text-gray-300">던전을 생성하고 있습니다</p>
          </div>
        </div>
      )}
      
      {/* 에러 바운더리 (간단한 구현) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 text-xs text-gray-500 z-50">
          <div>React: {React.version}</div>
          <div>Build: Development</div>
        </div>
      )}
    </div>
  );
}

export default App;
