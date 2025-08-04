/**
 * @file 유물 효과 적용 시스템
 *       - 데이터 중심 설계를 기반으로, 보유한 유물의 효과를 실제 게임 능력치에 적용합니다.
 */

import { GameState, initialGameState } from "../../contexts/GameStateContext";
import { ARTIFACT_DEFINITIONS, ArtifactID } from "../../data/artifacts";

/**
 * 보유한 유물 목록을 기반으로 최종 게임 상태(능력치)를 계산합니다.
 * 이 함수는 게임이 시작되거나, 새로운 유물을 획득했을 때 호출될 수 있습니다.
 * @param baseState - 유물 효과가 적용되기 전의 기본 게임 상태 (라운드별 설정만 사용, 능력치는 초기값 사용)
 * @param ownedArtifacts - 플레이어가 보유한 유물 ID 목록
 * @returns 유물 효과가 모두 적용된 최종 게임 상태
 */
export function applyArtifacts(baseState: GameState, ownedArtifacts: ArtifactID[]): GameState {
  // 초기 상태에서 능력치를 시작하고, baseState에서 라운드별 설정만 가져옵니다.
  const finalState = {
    ...JSON.parse(JSON.stringify(initialGameState)),
    // baseState에서 라운드별로 유지되어야 할 설정들만 가져옵니다
    isPlaying: baseState.isPlaying,
    isPaused: baseState.isPaused,
    isGameOver: baseState.isGameOver,
    showLevelUp: baseState.showLevelUp,
    showMainMenu: baseState.showMainMenu,
    showVictory: baseState.showVictory,
    score: baseState.score,
    time: baseState.time,
    enemies: baseState.enemies,
    stats: baseState.stats,
    difficulty: baseState.difficulty,
    ownedArtifacts: baseState.ownedArtifacts,
  };

  // 1. 합연산(ADDITIVE) 효과를 먼저 모두 적용합니다.
  ownedArtifacts.forEach(artifactId => {
    const artifact = ARTIFACT_DEFINITIONS[artifactId];
    if (!artifact) return;

    artifact.effects.forEach(effect => {
      if (effect.type === 'ADDITIVE') {
        const path = effect.stat.split('.'); // (Gemini) 경로를 배열로 분리
        // (Gemini) 2단계 또는 3단계 깊이의 속성에 접근하여 값 변경
        if (path.length === 3) {
          const [cat, subcat, prop] = path;
          if (finalState[cat] && finalState[cat][subcat] && typeof finalState[cat][subcat][prop] === 'number') {
            finalState[cat][subcat][prop] += effect.value;
          }
        } else if (path.length === 2) {
          const [cat, prop] = path;
          if (finalState[cat] && typeof finalState[cat][prop] === 'number') {
            finalState[cat][prop] += effect.value;
          }
        }
      }
    });
  });

  // 2. 곱연산(MULTIPLICATIVE) 효과를 나중에 적용합니다.
  ownedArtifacts.forEach(artifactId => {
    const artifact = ARTIFACT_DEFINITIONS[artifactId];
    if (!artifact) return;

    artifact.effects.forEach(effect => {
      if (effect.type === 'MULTIPLICATIVE') {
        const path = effect.stat.split('.'); // (Gemini) 경로를 배열로 분리

        // 'all_damage'는 모든 무기 데미지에 영향을 주는 특수 케이스입니다.
        if (effect.stat === 'all_damage') {
          Object.keys(finalState.weapons).forEach(weaponKey => {
            finalState.weapons[weaponKey].damage *= (1 + effect.value);
          });
        } 
        // (Gemini) 2단계 또는 3단계 깊이의 속성에 접근하여 값 변경
        else if (path.length === 3) {
          const [cat, subcat, prop] = path;
          if (finalState[cat] && finalState[cat][subcat] && typeof finalState[cat][subcat][prop] === 'number') {
            finalState[cat][subcat][prop] *= (1 + effect.value);
          }
        } else if (path.length === 2) {
          const [cat, prop] = path;
          if (finalState[cat] && typeof finalState[cat][prop] === 'number') {
            finalState[cat][prop] *= (1 + effect.value);
          }
        }
      }
    });
  });

  // 플레이어의 현재 체력을 최대 체력과 동기화합니다.
  finalState.player.health = finalState.player.maxHealth;

  return finalState;
}
