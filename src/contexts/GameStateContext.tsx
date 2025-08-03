import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  showLevelUp: boolean;
  showMainMenu: boolean;
  player: {
    level: number;
    experience: number;
    experienceToNext: number;
    health: number;
    maxHealth: number;
    x: number;
    y: number;
  };
  weapons: {
    orbital: { level: number; damage: number; count: number };
    projectile: { level: number; damage: number; speed: number };
    shield: { level: number; health: number; regeneration: number };
  };
  score: number;
  time: number;
  enemies: any[];
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'GAME_OVER' }
  | { type: 'SHOW_LEVEL_UP' }
  | { type: 'HIDE_LEVEL_UP' }
  | { type: 'SHOW_MAIN_MENU' }
  | { type: 'HIDE_MAIN_MENU' }
  | { type: 'UPDATE_PLAYER'; payload: Partial<GameState['player']> }
  | { type: 'UPDATE_WEAPON'; payload: { weapon: keyof GameState['weapons']; updates: any } }
  | { type: 'ADD_EXPERIENCE'; payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'UPDATE_SCORE'; payload: number };

const initialState: GameState = {
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  showLevelUp: false,
  showMainMenu: true,
  player: {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    x: 0,
    y: 0,
  },
  weapons: {
    orbital: { level: 0, damage: 10, count: 0 },
    projectile: { level: 0, damage: 15, speed: 200 },
    shield: { level: 0, health: 0, regeneration: 0 },
  },
  score: 0,
  time: 0,
  enemies: [],
};

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        showMainMenu: false,
      };
    
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
    
    case 'SHOW_LEVEL_UP':
      return { ...state, showLevelUp: true, isPaused: true };
    
    case 'HIDE_LEVEL_UP':
      return { ...state, showLevelUp: false, isPaused: false };
    
    case 'SHOW_MAIN_MENU':
      return { ...state, showMainMenu: true };
    
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
    
    case 'ADD_EXPERIENCE':
      const newExp = state.player.experience + action.payload;
      if (newExp >= state.player.experienceToNext) {
        return {
          ...state,
          player: {
            ...state.player,
            experience: newExp - state.player.experienceToNext,
            experienceToNext: Math.floor(state.player.experienceToNext * 1.2),
          },
          showLevelUp: true,
          isPaused: true,
        };
      }
      return {
        ...state,
        player: { ...state.player, experience: newExp },
      };
    
    case 'LEVEL_UP':
      return {
        ...state,
        player: { ...state.player, level: state.player.level + 1 },
      };
    
    case 'UPDATE_TIME':
      return { ...state, time: action.payload };
    
    case 'UPDATE_SCORE':
      return { ...state, score: action.payload };
    
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
  const [state, dispatch] = useReducer(gameStateReducer, initialState);

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