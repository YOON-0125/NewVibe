/**
 * 공통 타입 정의
 */

import { TileType } from './enums';

// 기본 위치 타입
export interface Position {
  x: number;
  y: number;
}

// 캐릭터 스탯
export interface Stats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  mana?: number;
}

// 씬 타입
export enum Scene {
  MainMenu = 'mainMenu',
  Game = 'game',
  Combat = 'combat',
  Inventory = 'inventory',
  GameOver = 'gameOver',
}

// 타일 인터페이스
export interface Tile {
  type: TileType;
  position: Position;
  walkable: boolean;
  visible: boolean;
  explored: boolean;
}

// 맵 인터페이스
export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
  spawnPoint: Position;
  exitPoint?: Position;
}

// 게임 상태
export interface GameState {
  currentScene: Scene;
  player: any; // Player 클래스 타입 (순환 참조 방지)
  currentMap: GameMap | null;
  enemies: any[]; // Enemy[] 타입
  gameTime: number;
  score: number;
}

// 렌더링 관련
export interface RenderObject {
  id: string;
  position: Position;
  sprite: string;
  zIndex: number;
  visible: boolean;
}

// 입력 상태
export interface InputState {
  keys: {
    [key: string]: {
      isDown: boolean;
      isPressed: boolean; // 이번 프레임에 새로 눌렸는지
    };
  };
  mouse: {
    position: Position;
    leftButton: boolean;
    rightButton: boolean;
  };
}

// 이벤트 타입
export interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}

// 사운드 타입
export interface Sound {
  id: string;
  src: string;
  volume: number;
  loop: boolean;
}
