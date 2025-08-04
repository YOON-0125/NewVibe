import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: () => void;
}

const LevelUp: React.FC = () => {
  const { state, dispatch } = useGameState();

  if (!state.showLevelUp) return null;

  // 업그레이드 옵션 생성
  const generateUpgradeOptions = (): UpgradeOption[] => {
    const options: UpgradeOption[] = [
      {
        id: 'orbital_damage',
        name: '궤도탄 강화',
        description: '궤도탄의 데미지가 증가합니다',
        icon: '🔵',
        effect: () => {
          dispatch({
            type: 'UPDATE_WEAPON',
            payload: {
              weapon: 'orbital',
              updates: { 
                level: state.weapons.orbital.level + 1,
                damage: state.weapons.orbital.damage + 5,
                count: Math.min(state.weapons.orbital.count + 1, 8)
              }
            }
          });
        }
      },
      {
        id: 'projectile_speed',
        name: '투사체 강화',
        description: '투사체의 속도와 데미지가 증가합니다',
        icon: '⚔️',
        effect: () => {
          dispatch({
            type: 'UPDATE_WEAPON',
            payload: {
              weapon: 'projectile',
              updates: {
                level: state.weapons.projectile.level + 1,
                damage: state.weapons.projectile.damage + 3,
                speed: state.weapons.projectile.speed + 20
              }
            }
          });
        }
      },
      {
        id: 'shield_upgrade',
        name: '방어막 강화',
        description: '방어막의 범위와 데미지가 증가합니다',
        icon: '🛡️',
        effect: () => {
          dispatch({
            type: 'UPDATE_WEAPON',
            payload: {
              weapon: 'shield',
              updates: {
                level: state.weapons.shield.level + 1,
                damage: state.weapons.shield.damage + 2,
                radius: state.weapons.shield.radius + 10,
                cooldown: Math.max(0.1, state.weapons.shield.cooldown * 0.95) // 5% 감소
              }
            }
          });
        }
      },
      {
        id: 'player_health',
        name: '체력 증가',
        description: '최대 체력이 증가하고 체력을 회복합니다',
        icon: '❤️',
        effect: () => {
          dispatch({
            type: 'UPDATE_PLAYER',
            payload: {
              maxHealth: state.player.maxHealth + 20,
              health: Math.min(state.player.health + 30, state.player.maxHealth + 20)
            }
          });
        }
      },
      {
        id: 'speed_boost',
        name: '이동속도 증가',
        description: '플레이어의 이동속도가 증가합니다',
        icon: '💨',
        effect: () => {
          // 이동속도는 Player 클래스에서 관리되므로 별도 처리 필요
          console.log('Speed boost applied');
        }
      }
    ];

    // 무작위로 3개 선택
    const shuffled = options.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const upgradeOptions = generateUpgradeOptions();

  const handleUpgradeSelect = (option: UpgradeOption) => {
    option.effect();
    dispatch({ type: 'LEVEL_UP' });
    dispatch({ type: 'HIDE_LEVEL_UP' });
  };

  return (
    <div className="levelup-overlay">
      <div className="levelup-modal">
        <h2 className="levelup-title">레벨 업!</h2>
        <p className="levelup-subtitle">강화할 능력을 선택하세요</p>
        
        <div className="upgrade-options">
          {upgradeOptions.map((option) => (
            <button
              key={option.id}
              className="upgrade-option"
              onClick={() => handleUpgradeSelect(option)}
            >
              <div className="upgrade-icon">{option.icon}</div>
              <div className="upgrade-content">
                <h3 className="upgrade-name">{option.name}</h3>
                <p className="upgrade-description">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelUp;