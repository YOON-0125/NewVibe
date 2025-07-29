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
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">능력 관리</h2>
            <p className="text-gray-400">{abilities.length}/8 능력 보유</p>
          </div>
          
          <button
            onClick={onClosePanel}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-6 h-96">
          
          {/* 왼쪽: 능력 목록 */}
          <div className="flex-1">
            
            {/* 탭 */}
            <div className="flex mb-4">
              {[
                { key: 'all', label: '전체' },
                { key: 'active', label: '액티브' },
                { key: 'passive', label: '패시브' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`px-4 py-2 rounded-t-lg font-semibold ${
                    selectedTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 능력 그리드 */}
            <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-80">
              {filteredAbilities.map((ability, index) => (
                <div
                  key={ability.id}
                  onClick={() => handleAbilityClick(ability, index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedAbility?.id === ability.id
                      ? 'border-blue-400 bg-blue-900 bg-opacity-50'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{getTypeIcon(ability.type)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getElementColor(ability.element)}`}>
                      {ability.element}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-1">{ability.name}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{ability.description}</p>
                  
                  <div className="flex justify-between items-center mt-2">
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
                  className="p-3 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 bg-opacity-50"
                >
                  <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">+</div>
                    <p className="text-sm">빈 슬롯</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 상세 정보 */}
          <div className="w-80 bg-gray-800 rounded-lg p-4">
            {selectedAbility ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{getTypeIcon(selectedAbility.type)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedAbility.name}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-bold ${getElementColor(selectedAbility.element)}`}>
                      {selectedAbility.element}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-300 font-semibold mb-2">설명</h4>
                    <p className="text-gray-400">{selectedAbility.description}</p>
                  </div>

                  <div>
                    <h4 className="text-gray-300 font-semibold mb-2">능력 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">타입:</span>
                        <span className="text-white">{selectedAbility.type}</span>
                      </div>
                      
                      {selectedAbility.damage && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">데미지:</span>
                          <span className="text-red-400">{(selectedAbility.damage * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      
                      {selectedAbility.healing && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">치유량:</span>
                          <span className="text-green-400">{selectedAbility.healing}</span>
                        </div>
                      )}
                      
                      {selectedAbility.manaCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">마나 소모:</span>
                          <span className="text-blue-400">{selectedAbility.manaCost}</span>
                        </div>
                      )}
                      
                      {selectedAbility.cooldown && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">쿨다운:</span>
                          <span className="text-yellow-400">{selectedAbility.cooldown / 1000}초</span>
                        </div>
                      )}
                      
                      {selectedAbility.range && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">사거리:</span>
                          <span className="text-white">{selectedAbility.range}</span>
                        </div>
                      )}
                      
                      {selectedAbility.area && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">범위:</span>
                          <span className="text-purple-400">{selectedAbility.area}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAbility.effects && selectedAbility.effects.length > 0 && (
                    <div>
                      <h4 className="text-gray-300 font-semibold mb-2">효과</h4>
                      <div className="space-y-1">
                        {selectedAbility.effects.map((effect, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-gray-400">{effect.type}:</span>
                            <span className="text-white ml-2">{effect.value}</span>
                            {effect.chance && effect.chance < 1 && (
                              <span className="text-yellow-400 ml-2">
                                ({(effect.chance * 100).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-4xl mb-4">👆</div>
                <p>능력을 선택하면</p>
                <p>상세 정보가 표시됩니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 컨트롤 */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              <kbd className="bg-gray-700 px-2 py-1 rounded">1-4</kbd> 능력 사용 |
              <kbd className="bg-gray-700 px-2 py-1 rounded ml-2">I</kbd> 인벤토리 닫기
            </div>
            
            <button
              onClick={onClosePanel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
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
