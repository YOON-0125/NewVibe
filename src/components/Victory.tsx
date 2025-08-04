import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useGameState } from '../contexts/GameStateContext';
import { ARTIFACT_DEFINITIONS, ArtifactID } from '../data/artifacts';

const Victory: React.FC = () => {
  const { state, dispatch } = useGameState();

  const artifactChoices = useMemo(() => {
    const allArtifactIds = Object.keys(ARTIFACT_DEFINITIONS) as ArtifactID[];
    const availableArtifacts = allArtifactIds.filter((id) => !state.ownedArtifacts.includes(id));
    const shuffled = availableArtifacts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [state.ownedArtifacts]);

  if (!state.showVictory) {
    return null;
  }

  const handleContinue = () => {
    // (Gemini) 선택한 유물 없이 다음 라운드를 시작합니다.
    dispatch({ type: 'START_NEW_ROUND', payload: { newArtifactId: null } });
  };

  const handleMainMenu = () => {
    dispatch({ type: 'SHOW_MAIN_MENU' });
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCombatStats = () => {
    const { stats } = state;
    let mostKillsWeapon = 'N/A';
    let maxKills = 0;

    for (const weaponId in stats.weaponStats) {
      if (stats.weaponStats[weaponId].kills > maxKills) {
        maxKills = stats.weaponStats[weaponId].kills;
        mostKillsWeapon = weaponId;
      }
    }

    return {
      enemiesKilled: stats.enemiesKilled,
      experienceGained: stats.experienceGained,
      damageDealt: stats.damageDealt,
      mostKillsWeapon: mostKillsWeapon.charAt(0).toUpperCase() + mostKillsWeapon.slice(1),
      highestDamageWeapon:
        stats.highestDamage.weaponId.charAt(0).toUpperCase() +
        stats.highestDamage.weaponId.slice(1),
      highestDamage: stats.highestDamage.damage,
    };
  };

  const combatStats = getCombatStats();
  const previousDifficulty = Math.max(0, state.difficulty.level - 1);

  const handleArtifactSelect = (artifactId: ArtifactID) => {
    // (Gemini) 선택한 유물과 함께 다음 라운드를 시작합니다.
    dispatch({ type: 'START_NEW_ROUND', payload: { newArtifactId: artifactId } });
  };

  const victoryModal = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      <div
        className="bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 text-center border-2"
        style={{
          position: 'relative',
          zIndex: 100000,
          borderColor: '#FFD700',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="mb-6">
          <h2
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🏆 VICTORY! 🏆
          </h2>
          <p className="text-lg text-green-400">15분 생존 성공!</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-3">📊 Game Results</h3>
          <div className="text-white space-y-2 text-left">
            <p>
              • Level: <span className="text-yellow-400">{state.player.level}</span>
            </p>
            <p>
              • Score: <span className="text-blue-400">{state.score.toLocaleString()}</span>
            </p>
            <p>
              • Time: <span className="text-green-400">{formatTime(state.time)}</span>
            </p>
            <p>
              • Difficulty:
              {previousDifficulty > 0 && (
                <span className="text-red-400"> 🔥{previousDifficulty} → </span>
              )}
              <span className="text-red-500 font-bold">🔥{state.difficulty.level}</span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-3">📈 Combat Stats</h3>
          <div className="text-gray-300 space-y-2 text-left text-sm">
            <p>
              • Enemies Killed: <span className="text-red-400">{combatStats.enemiesKilled}</span>
            </p>
            <p>
              • Experience Gained:{' '}
              <span className="text-green-400">{combatStats.experienceGained}</span>
            </p>
            <p>
              • Total Damage Dealt:{' '}
              <span className="text-yellow-400">{combatStats.damageDealt.toLocaleString()}</span>
            </p>
            <p>
              • Top Weapon (Kills):{' '}
              <span className="text-orange-400">{combatStats.mostKillsWeapon}</span>
            </p>
            <p>
              • Highest Damage:{' '}
              <span className="text-purple-400">
                {combatStats.highestDamageWeapon} ({combatStats.highestDamage})
              </span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-3">🎁 Artifact Selection</h3>
          <div className="flex justify-center items-stretch space-x-2">
            {' '}
            {/* (Gemini) items-stretch 추가 */}
            <>
              {' '}
              {/* (Gemini) React Fragment 추가 */}
              {artifactChoices.map((artifactId) => {
                const artifact = ARTIFACT_DEFINITIONS[artifactId];
                return (
                  <div
                    key={artifact.id}
                    className="bg-gray-700 rounded-lg p-2 text-center border-2 border-gray-600 hover:border-yellow-400 cursor-pointer flex flex-col justify-between items-center" // (Gemini) flex, 정렬 관련 클래스 추가
                    style={{ width: '90px', height: '120px' }}
                    onClick={() => handleArtifactSelect(artifact.id)}
                  >
                    <div className="text-3xl mt-1">{/* 아이콘 추가 공간 */}</div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {artifact.name}
                    </div>
                    <div className="text-xxs text-gray-300 leading-tight mb-1">
                      {artifact.description}
                    </div>
                  </div>
                );
              })}
              {artifactChoices.length === 0 && (
                <p className="text-gray-500">모든 유물을 획득했습니다!</p>
              )}
            </>{' '}
            {/* (Gemini) React Fragment 닫기 */}
          </div>
        </div>

        <div className="menu-buttons">
          <button onClick={handleContinue} className="menu-button primary">
            Continue
          </button>

          <button onClick={handleMainMenu} className="menu-button secondary">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(victoryModal, document.body);
};

export default Victory;
