import React, { useState } from 'react';
import { Ability } from '../core/data/abilities';
import { Player } from '../core/entities/Player';
import { AbilityType, AbilityElement } from '../shared/enums';

interface AbilityPanelProps {
  player: Player | null;
  onUseAbility?: (abilityIndex: number) => void;
  onClosePanel?: () => void;
  className?: string;
}

/**
 * 능력 패널 컴포넌트
 * 플레이어의 능력을 표시하고 관리
 */
export const AbilityPanel: React.FC<AbilityPanelProps> = ({
  player,
  onUseAbility,
  onClosePanel,
  className = ''
}) => {
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'passive' | 'all'>('all');

  if (!player) {
    return null;
  }

  const abilities = player.getAbilities();
  
  // 탭별 능력 필터링
  const filteredAbilities = abilities.filter(ability => {
    switch (selectedTab) {
      case 'active':
        return ability.type === AbilityType.Active || ability.type === AbilityType.Toggle;
      case 'passive':
        return ability.type === AbilityType.Passive;
      case 'all':
      default:
        return true;
    }
  });

  const getElementColor = (element: AbilityElement): string => {
    switch (element) {
      case AbilityElement.Fire: return 'text-red-400 bg-red-900';
      case AbilityElement.Water: return 'text-blue-400 bg-blue-900';
      case AbilityElement.Earth: return 'text-yellow-600 bg-yellow-900';
      case AbilityElement.Wind: return 'text-green-400 bg-green-900';
      case AbilityElement.Shadow: return 'text-purple-400 bg-purple-900';
      case AbilityElement.Ice: return 'text-cyan-400 bg-cyan-900';
      case AbilityElement.Lightning: return 'text-yellow-300 bg-yellow-800';
      case AbilityElement.Poison: return 'text-green-600 bg-green-800';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getTypeIcon = (type: AbilityType): string => {
    switch (type) {
      case AbilityType.Active: return '⚡';
      case AbilityType.Passive: return '🛡️';
      case AbilityType.Toggle: return '🔄';
      case AbilityType.Buff: return '↗️';
      case AbilityType.Debuff: return '↘️';
      default: return '❓';
    }
  };

  const handleAbilityClick = (ability: Ability, index: number) => {
    setSelectedAbility(ability);
  };

  const handleUseAbility = (index: number) => {
    if (onUseAbility) {
      onUseAbility(index);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full flex justify-end z-50 ${className}`}>
      <div className="bg-gray-900 bg-opacity-95 p-3 w-64 h-full overflow-hidden flex flex-col border-l border-gray-700 shadow-xl">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">능력 관리</h2>
            <p className="text-gray-400 text-sm">{abilities.length}/8 능력 보유</p>
          </div>
          
          <button
            onClick={onClosePanel}
            className="text-gray-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          
          {/* 탭 */}
          <div className="flex mb-3">
            {[
              { key: 'all', label: '전체' },
              { key: 'active', label: '액티브' },
              { key: 'passive', label: '패시브' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-3 py-1 rounded-t-lg font-semibold text-sm ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 능력 리스트 */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredAbilities.map((ability, index) => (
                <div
                  key={ability.id}
                  onClick={() => handleAbilityClick(ability, index)}
                  className={`p-2 rounded-lg cursor-pointer transition-all border ${
                    selectedAbility?.id === ability.id
                      ? 'border-blue-400 bg-blue-900 bg-opacity-50'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{getTypeIcon(ability.type)}</span>
                    <span className={`px-1 py-0.5 rounded text-xs font-bold ${getElementColor(ability.element)}`}>
                      {ability.element}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-semibold text-sm mb-1">{ability.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2">{ability.description}</p>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      슬롯 {index + 1}
                    </span>
                    
                    {ability.type === AbilityType.Active && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseAbility(index);
                        }}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                      >
                        사용
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* 빈 슬롯들 */}
              {Array.from({ length: 8 - abilities.length }, (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="p-2 rounded-lg border border-dashed border-gray-700 bg-gray-800 bg-opacity-50"
                >
                  <div className="text-center text-gray-500">
                    <div className="text-sm mb-1">+</div>
                    <p className="text-xs">빈 슬롯</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 컨트롤 */}
        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2">
              <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">1-4</kbd> 능력 사용 |
              <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs ml-1">I</kbd> 닫기
            </div>
            
            <button
              onClick={onClosePanel}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbilityPanel;
