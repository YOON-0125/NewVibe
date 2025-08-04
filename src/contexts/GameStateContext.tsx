import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ArtifactID } from '../data/artifacts';
import { loadOwnedArtifacts, saveOwnedArtifacts } from '../utils/storage';
import { applyArtifacts } from '../game/systems/ArtifactSystem'; // (Gemini) applyArtifacts 임포트

export interface GameStats {
  enemiesKilled: number;
  experienceGained: number;
  damageDealt: number;
  weaponStats: {
    [weaponId: string]: {
      kills: number;
      damage: number;
      maxSingleDamage: number;
    };
  };
  highestDamage: {
    weaponId: string;
    damage: number;
  };
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  showLevelUp: boolean;
  showMainMenu: boolean;
  showVictory: boolean;
  player: {
    level: number;
    experience: number;
    experienceToNext: number;
    health: number;
    maxHealth: number;
    x: number;
    y: number;
    speed: number; // (Gemini) 플레이어 속도 추가
  };
  weapons: {
    orbital: { level: number; damage: number; count: number };
    projectile: { level: number; damage: number; speed: number };
    shield: { level: number; damage: number; radius: number; cooldown: number };
  };
  score: number;
  time: number;
  enemies: any[];
  difficulty: {
    level: number;
    enemyHealthMultiplier: number;
    enemyDamageMultiplier: number;
    enemySpeedMultiplier: number;
  };
  stats: GameStats;
  ownedArtifacts: ArtifactID[];
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'START_NEW_ROUND'; payload: { newArtifactId: ArtifactID | null } }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'GAME_OVER' }
  | { type: 'GAME_VICTORY' }
  | { type: 'SHOW_LEVEL_UP' }
  | { type: 'HIDE_LEVEL_UP' }
  | { type: 'SHOW_MAIN_MENU' }
  | { type: 'HIDE_MAIN_MENU' }
  | { type: 'UPDATE_PLAYER'; payload: Partial<GameState['player']> }
  | { type: 'UPDATE_WEAPON'; payload: { weapon: keyof GameState['weapons']; updates: any } }
  | { type: 'LEVEL_UP' }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'INCREASE_DIFFICULTY' }
  | { type: 'UPDATE_STATS'; payload: GameStats };

const initialStats: GameStats = {
  enemiesKilled: 0,
  experienceGained: 0,
  damageDealt: 0,
  weaponStats: {},
  highestDamage: { weaponId: 'none', damage: 0 },
};

export const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  showLevelUp: false,
  showMainMenu: true,
  showVictory: false,
  player: {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    x: 0,
    y: 0,
    speed: 150, // (Gemini) 기본 플레이어 속도
  },
  weapons: {
    orbital: { level: 0, damage: 10, count: 0 },
    projectile: { level: 0, damage: 15, speed: 200 },
    shield: { level: 0, damage: 5, radius: 50, cooldown: 0.5 },
  },
  score: 0,
  time: 0,
  enemies: [],
  difficulty: {
    level: 0,
    enemyHealthMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
  },
  stats: initialStats,
  ownedArtifacts: loadOwnedArtifacts(),
};

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialGameState,
        ownedArtifacts: state.ownedArtifacts, // 보유 유물은 유지
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        showMainMenu: false,
        showVictory: false,
        stats: initialStats,
      };
    
    case 'START_NEW_ROUND': {
      const { newArtifactId } = action.payload;
      let updatedArtifacts = state.ownedArtifacts;

      // 1. 새로운 유물이 있으면 상태에 추가하고 저장합니다.
      if (newArtifactId && !state.ownedArtifacts.includes(newArtifactId)) {
        updatedArtifacts = [...state.ownedArtifacts, newArtifactId];
        saveOwnedArtifacts(updatedArtifacts);
      }

      // 2. 라운드를 새로 시작하는 데 필요한 상태를 조합합니다.
      //    - 항상 초기 상태에서 시작하여 유물 효과가 중복 적용되지 않도록 합니다.
      const baseStateForNewRound = {
        ...initialGameState, // 항상 초기 상태에서 시작
        // 라운드 간 유지되어야 할 속성들을 현재 상태에서 가져옵니다
        difficulty: state.difficulty, // 난이도는 유지
        ownedArtifacts: updatedArtifacts, // 유물 목록 업데이트
        // 게임 플레이 관련 플래그 설정
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        showMainMenu: false,
        showVictory: false,
        stats: initialStats, // 라운드 통계 초기화
      };

      // 3. 유물 효과를 적용합니다.
      //    - applyArtifacts 함수는 초기 상태에서 모든 유물 효과를 새로 계산합니다.
      return applyArtifacts(baseStateForNewRound, updatedArtifacts);
    }
    
    case 'PAUSE_GAME':
      return { ...state, isPaused: true };
    
    case 'RESUME_GAME':
      return { ...state, isPaused: false };
    
    case 'GAME_OVER':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        isGameOver: true,
      };
    
    case 'GAME_VICTORY':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        showVictory: true,
      };
    
    case 'INCREASE_DIFFICULTY':
      const newDifficultyLevel = state.difficulty.level + 1;
      const multiplier = 1 + (newDifficultyLevel * 0.25);
      
      return {
        ...state,
        difficulty: {
          level: newDifficultyLevel,
          enemyHealthMultiplier: multiplier,
          enemyDamageMultiplier: multiplier,
          enemySpeedMultiplier: Math.min(multiplier, 2.0),
        },
      };
    
    case 'SHOW_LEVEL_UP':
      return { ...state, showLevelUp: true, isPaused: true };
    
    case 'HIDE_LEVEL_UP':
      return { ...state, showLevelUp: false, isPaused: false };
    
    case 'SHOW_MAIN_MENU':
      return { ...initialGameState, ownedArtifacts: state.ownedArtifacts };
    
    case 'HIDE_MAIN_MENU':
      return { ...state, showMainMenu: false };
    
    case 'UPDATE_PLAYER':
      return {
        ...state,
        player: { ...state.player, ...action.payload },
      };
    
    case 'UPDATE_WEAPON':
      return {
        ...state,
        weapons: {
          ...state.weapons,
          [action.payload.weapon]: {
            ...state.weapons[action.payload.weapon],
            ...action.payload.updates,
          },
        },
      };
    
    case 'LEVEL_UP':
      return {
        ...state,
        player: { ...state.player, level: state.player.level + 1 },
      };

    case 'UPDATE_TIME':
      return { ...state, time: action.payload };

    case 'UPDATE_STATS':
      const expGained = action.payload.experienceGained - state.stats.experienceGained;
      const newExp = state.player.experience + expGained;
      const newScore = state.score + (action.payload.enemiesKilled - state.stats.enemiesKilled) * 100;

      if (newExp >= state.player.experienceToNext) {
        return {
          ...state,
          player: {
            ...state.player,
            experience: newExp - state.player.experienceToNext,
            experienceToNext: Math.floor(state.player.experienceToNext * 1.2),
          },
          score: newScore,
          stats: action.payload,
          showLevelUp: true,
          isPaused: true,
        };
      }
      return {
        ...state,
        player: { ...state.player, experience: newExp },
        score: newScore,
        stats: action.payload,
      };

    default:
      return state;
  }
}

interface GameStateContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameStateReducer, initialGameState);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}