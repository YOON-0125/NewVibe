import React, { useState, useEffect } from 'react';
import { Player } from '../core/entities/Player';
import { Ability } from '../core/data/abilities';

interface HUDProps {
  player: Player | null;
  className?: string;
}

/**
 * 게임 HUD 컴포넌트
 * 플레이어 상태, 능력, 미니맵 등을 표시
 */
export const HUD: React.FC<HUDProps> = ({ player, className = '' }) => {
  const [playerStats, setPlayerStats] = useState({
    health: 0,
    maxHealth: 0,
    level: 1,
    experience: 0,
    abilities: [] as Ability[],
  });

  // 플레이어 상태 업데이트
  useEffect(() => {
    if (!player) return;

    const updateStats = () => {
      setPlayerStats({
        health: player.getCurrentHealth(),
        maxHealth: player.getMaxHealth(),
        level: player.getLevel(),
        experience: player.getExperience(),
        abilities: player.getAbilities(),
      });
    };

    updateStats();

    // 주기적으로 상태 업데이트 (실제로는 게임 이벤트로 처리하는 것이 좋음)
    const interval = setInterval(updateStats, 100);

    return () => clearInterval(interval);
  }, [player]);

  if (!player) {
    return null;
  }

  const healthPercentage = (playerStats.health / playerStats.maxHealth) * 100;

  return (
    <div className={`absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-75 text-white ${className}`}>
      <div className="flex justify-between items-start">
        
        {/* 플레이어 상태 */}
        <div className="flex-1">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">레벨 {playerStats.level}</span>
              <span className="text-xs text-gray-300">경험치: {playerStats.experience}</span>
            </div>
            
            {/* 체력바 */}
            <div className="relative w-48 h-4 bg-gray-700 rounded">
              <div 
                className="absolute left-0 top-0 h-full bg-red-500 rounded transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {playerStats.health} / {playerStats.maxHealth}
              </div>
            </div>
          </div>
        </div>

        {/* 능력 슬롯 */}
        <div className="flex-1 max-w-md">
          <div className="text-sm font-semibold mb-2">능력</div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, index) => {
              const ability = playerStats.abilities[index];
              return (
                <div
                  key={index}
                  className={`w-12 h-12 border-2 rounded flex items-center justify-center text-xs font-bold ${
                    ability 
                      ? 'border-blue-400 bg-blue-900 text-blue-200' 
                      : 'border-gray-600 bg-gray-800 text-gray-500'
                  }`}
                  title={ability ? `${ability.name}: ${ability.description}` : '빈 슬롯'}
                >
                  {ability ? (index + 1).toString() : ''}
                </div>
              );
            })}
          </div>
          
          {/* 능력 목록 */}
          {playerStats.abilities.length > 0 && (
            <div className="mt-2 text-xs">
              {playerStats.abilities.slice(0, 4).map((ability, index) => (
                <div key={ability.id} className="flex items-center gap-2 mb-1">
                  <span className="w-4 h-4 bg-blue-600 rounded text-center text-white text-xs">
                    {index + 1}
                  </span>
                  <span className="text-blue-200">{ability.name}</span>
                  <span className="text-gray-400 text-xs">({ability.element})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 게임 정보 */}
        <div className="flex-1 text-right">
          <div className="text-xs text-gray-300">
            <div>위치: ({player.getPosition().x}, {player.getPosition().y})</div>
            <div>방향: {player.getDirection()}</div>
          </div>
        </div>
      </div>

      {/* 컨트롤 힌트 */}
      <div className="mt-4 pt-2 border-t border-gray-600">
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <span><kbd className="bg-gray-700 px-1 rounded">WASD</kbd> 이동</span>
          <span><kbd className="bg-gray-700 px-1 rounded">Space</kbd> 공격</span>
          <span><kbd className="bg-gray-700 px-1 rounded">1-4</kbd> 능력 사용</span>
          <span><kbd className="bg-gray-700 px-1 rounded">I</kbd> 인벤토리</span>
          <span><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> 메뉴</span>
        </div>
      </div>
      {/* 컴트롤 힌트 - 좌쪽 하단 */}
      <div className="absolute bottom-2 left-2 pointer-events-auto">
        <div className="bg-black bg-opacity-75 text-white p-2 rounded">
          <div className="flex flex-col gap-1 text-xs text-gray-400">
            <span><kbd className="bg-gray-700 px-1 rounded text-xs">WASD</kbd> 이동</span>
            <span><kbd className="bg-gray-700 px-1 rounded text-xs">Space</kbd> 공격</span>
            <span><kbd className="bg-gray-700 px-1 rounded text-xs">1-4</kbd> 능력</span>
            <span><kbd className="bg-gray-700 px-1 rounded text-xs">E</kbd> 상호작용</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
