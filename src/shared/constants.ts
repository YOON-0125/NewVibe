/**
 * 게임 전역 상수 정의
 */

// 게임 설정
export const GAME_CONFIG = {
  // 화면 크기
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // 프레임 레이트
  TARGET_FPS: 60,
  MAX_DELTA_TIME: 1000 / 30, // 최대 30fps로 제한
  
  // 게임 속도
  GAME_SPEED: 1.0,
} as const;

// 맵 설정
export const MAP_CONFIG = {
  // 타일 크기
  TILE_SIZE: 32,
  
  // 맵 크기
  MIN_MAP_WIDTH: 20,
  MIN_MAP_HEIGHT: 15,
  MAX_MAP_WIDTH: 50,
  MAX_MAP_HEIGHT: 40,
  
  // 방 생성 설정
  MIN_ROOM_SIZE: 4,
  MAX_ROOM_SIZE: 10,
  MAX_ROOMS: 15,
  
  // 시야 범위
  VISION_RADIUS: 8,
} as const;

// 캐릭터 설정
export const CHARACTER_CONFIG = {
  // 플레이어 기본 스탯
  PLAYER_BASE_HEALTH: 100,
  PLAYER_BASE_ATTACK: 10,
  PLAYER_BASE_DEFENSE: 5,
  PLAYER_BASE_SPEED: 100,
  
  // 적 기본 스탯
  ENEMY_BASE_HEALTH: 50,
  ENEMY_BASE_ATTACK: 8,
  ENEMY_BASE_DEFENSE: 2,
  ENEMY_BASE_SPEED: 80,
  
  // 보스 스탯 배수
  BOSS_HEALTH_MULTIPLIER: 5,
  BOSS_ATTACK_MULTIPLIER: 2,
  BOSS_DEFENSE_MULTIPLIER: 3,
  
  // 이동 속도 (ms)
  MOVE_COOLDOWN: 200,
  ATTACK_COOLDOWN: 1000,
} as const;

// 전투 설정
export const COMBAT_CONFIG = {
  // 데미지 계산
  DAMAGE_VARIANCE: 0.2, // ±20% 랜덤
  CRITICAL_CHANCE: 0.1, // 10% 치명타
  CRITICAL_MULTIPLIER: 2.0,
  
  // 방어력 계산
  DEFENSE_REDUCTION_FORMULA: (attack: number, defense: number) => 
    Math.max(1, attack - Math.floor(defense * 0.5)),
  
  // 경험치
  BASE_EXP_REWARD: 10,
  BOSS_EXP_MULTIPLIER: 5,
  LEVEL_UP_EXP_BASE: 100,
  LEVEL_UP_EXP_GROWTH: 1.5,
} as const;

// 능력 설정
export const ABILITY_CONFIG = {
  // 최대 보유 능력 수
  MAX_ABILITIES: 8,
  
  // 쿨다운 시간 (ms)
  DEFAULT_COOLDOWN: 1000,
  SHORT_COOLDOWN: 500,
  LONG_COOLDOWN: 3000,
  
  // 마나 비용
  LOW_MANA_COST: 10,
  MEDIUM_MANA_COST: 25,
  HIGH_MANA_COST: 50,
} as const;

// UI 설정
export const UI_CONFIG = {
  // 색상
  HEALTH_BAR_COLOR: '#ff4444',
  MANA_BAR_COLOR: '#4444ff',
  EXPERIENCE_BAR_COLOR: '#44ff44',
  
  // 크기
  BAR_WIDTH: 200,
  BAR_HEIGHT: 20,
  
  // 애니메이션
  FADE_DURATION: 300,
  SLIDE_DURATION: 500,
  
  // 폰트
  DEFAULT_FONT_SIZE: 16,
  TITLE_FONT_SIZE: 24,
  SMALL_FONT_SIZE: 12,
} as const;

// 사운드 설정
export const SOUND_CONFIG = {
  // 볼륨 (0.0 ~ 1.0)
  MASTER_VOLUME: 0.7,
  BGM_VOLUME: 0.5,
  SFX_VOLUME: 0.8,
  
  // 페이드 시간 (ms)
  FADE_IN_TIME: 1000,
  FADE_OUT_TIME: 500,
} as const;

// 키 바인딩
export const KEY_BINDINGS = {
  // 이동
  MOVE_UP: ['ArrowUp', 'KeyW'],
  MOVE_DOWN: ['ArrowDown', 'KeyS'],
  MOVE_LEFT: ['ArrowLeft', 'KeyA'],
  MOVE_RIGHT: ['ArrowRight', 'KeyD'],
  
  // 액션
  ATTACK: ['Space', 'KeyZ'],
  INTERACT: ['KeyE', 'Enter'],
  
  // 능력
  ABILITY_1: ['Digit1'],
  ABILITY_2: ['Digit2'],
  ABILITY_3: ['Digit3'],
  ABILITY_4: ['Digit4'],
  
  // UI
  INVENTORY: ['KeyI', 'Tab'],
  MENU: ['Escape'],
  PAUSE: ['KeyP'],
} as const;

// 색상 팔레트
export const COLORS = {
  // 기본 색상
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#808080',
  
  // 게임 색상
  PLAYER_COLOR: '#00ff00',
  ENEMY_COLOR: '#ff0000',
  BOSS_COLOR: '#ff6600',
  NPC_COLOR: '#0066ff',
  
  // UI 색상
  BUTTON_NORMAL: '#4a5568',
  BUTTON_HOVER: '#2d3748',
  BUTTON_ACTIVE: '#1a202c',
  
  // 상태 색상
  SUCCESS: '#48bb78',
  WARNING: '#ed8936',
  ERROR: '#f56565',
  INFO: '#4299e1',
} as const;

// 개발 설정
export const DEBUG_CONFIG = {
  // 디버그 모드
  ENABLED: process.env.NODE_ENV === 'development',
  
  // 로그 레벨
  LOG_LEVEL: 'debug',
  
  // 표시 옵션
  SHOW_FPS: true,
  SHOW_COLLISION_BOXES: false,
  SHOW_AI_STATE: false,
  SHOW_PATHFINDING: false,
  
  // 치트 모드
  GOD_MODE: false,
  INFINITE_ABILITIES: false,
} as const;
