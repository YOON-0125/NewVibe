import React, { useState } from 'react';

interface MainMenuProps {
  onStartGame?: () => void;
  onLoadGame?: () => void;
  onSettings?: () => void;
  onExit?: () => void;
  className?: string;
}

/**
 * 메인 메뉴 컴포넌트
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onLoadGame,
  onSettings,
  onExit,
  className = ''
}) => {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [showAbout, setShowAbout] = useState(false);

  const menuOptions = [
    { label: '새 게임', action: onStartGame },
    { label: '게임 불러오기', action: onLoadGame },
    { label: '설정', action: onSettings },
    { label: '게임 정보', action: () => setShowAbout(true) },
    { label: '종료', action: onExit },
  ];

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        setSelectedOption(prev => (prev - 1 + menuOptions.length) % menuOptions.length);
        break;
      case 'ArrowDown':
        setSelectedOption(prev => (prev + 1) % menuOptions.length);
        break;
      case 'Enter':
      case ' ':
        const selectedAction = menuOptions[selectedOption].action;
        if (selectedAction) {
          selectedAction();
        }
        break;
      case 'Escape':
        if (showAbout) {
          setShowAbout(false);
        }
        break;
    }
  };

  const handleMenuClick = (index: number) => {
    setSelectedOption(index);
    const action = menuOptions[index].action;
    if (action) {
      action();
    }
  };

  if (showAbout) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center ${className}`}>
        <div className="bg-black bg-opacity-75 p-8 rounded-lg max-w-2xl mx-4">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            조선 로그라이크
          </h2>
          
          <div className="text-gray-300 space-y-4">
            <p>
              조선시대를 배경으로 한 로그라이크 게임입니다. 
              도깨비들이 지배하는 던전을 탐험하며 그들의 능력을 흡수하여 강해져보세요.
            </p>
            
            <div>
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">게임 특징</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>도깨비 보스를 처치하여 고유 능력 획득</li>
                <li>절차적으로 생성되는 던전</li>
                <li>다양한 속성의 능력 조합</li>
                <li>한국 전통 요소가 담긴 판타지 세계</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">조작법</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-yellow-200">WASD</span>: 이동</p>
                <p><span className="text-yellow-200">Space</span>: 공격</p>
                <p><span className="text-yellow-200">1-4</span>: 능력 사용</p>
                <p><span className="text-yellow-200">I</span>: 인벤토리</p>
                <p><span className="text-yellow-200">ESC</span>: 메뉴</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAbout(false)}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-6 rounded transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="text-center">
        {/* 게임 타이틀 */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
            조선 로그라이크
          </h1>
          <p className="text-xl text-gray-300">
            도깨비의 능력을 흡수하여 최강의 무사가 되어라
          </p>
        </div>

        {/* 메뉴 옵션들 */}
        <div className="space-y-4">
          {menuOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(index)}
              onMouseEnter={() => setSelectedOption(index)}
              className={`block w-64 mx-auto py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-200 ${
                selectedOption === index
                  ? 'bg-yellow-600 text-black shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              disabled={!option.action}
            >
              {option.label}
              {selectedOption === index && (
                <span className="ml-2">←</span>
              )}
            </button>
          ))}
        </div>

        {/* 버전 정보 */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>버전 0.1.0 - 개발 중</p>
          <p className="mt-2">키보드 화살표와 Enter로 메뉴를 선택할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
