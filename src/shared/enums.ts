/**
 * 게임에서 사용하는 열거형 정의
 */

// 방향
export enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

// 타일 타입
export enum TileType {
  Empty = 'empty',
  Wall = 'wall',
  Floor = 'floor',
  Door = 'door',
  Chest = 'chest',
  Stairs = 'stairs',
}

// 적 타입
export enum EnemyType {
  Goblin = 'goblin',
  Orc = 'orc',
  Skeleton = 'skeleton',
  Zombie = 'zombie',
  Ghost = 'ghost',
  Boss = 'boss',
}

// 보스 타입 (도깨비 종류)
export enum BossType {
  FireDokkaebi = 'fireDokkaebi',     // 불 도깨비
  WaterDokkaebi = 'waterDokkaebi',   // 물 도깨비
  EarthDokkaebi = 'earthDokkaebi',   // 땅 도깨비
  WindDokkaebi = 'windDokkaebi',     // 바람 도깨비
  ShadowDokkaebi = 'shadowDokkaebi', // 그림자 도깨비
  IceDokkaebi = 'iceDokkaebi',       // 얼음 도깨비
  LightningDokkaebi = 'lightningDokkaebi', // 번개 도깨비
  PoisonDokkaebi = 'poisonDokkaebi', // 독 도깨비
}

// 능력 타입
export enum AbilityType {
  Active = 'active',       // 직접 사용하는 능력
  Passive = 'passive',     // 자동으로 적용되는 능력
  Toggle = 'toggle',       // 켜고 끌 수 있는 능력
  Buff = 'buff',          // 버프 능력
  Debuff = 'debuff',      // 디버프 능력
}

// 능력 속성
export enum AbilityElement {
  Fire = 'fire',
  Water = 'water',
  Earth = 'earth',
  Wind = 'wind',
  Shadow = 'shadow',
  Ice = 'ice',
  Lightning = 'lightning',
  Poison = 'poison',
  Light = 'light',
  Dark = 'dark',
  Physical = 'physical',
  Neutral = 'neutral',
}

// 상태 효과 타입
export enum StatusEffectType {
  Burn = 'burn',           // 화상
  Freeze = 'freeze',       // 빙결
  Poison = 'poison',       // 중독
  Stun = 'stun',          // 기절
  Slow = 'slow',          // 감속
  Haste = 'haste',        // 가속
  Shield = 'shield',       // 보호막
  Regeneration = 'regeneration', // 재생
  Weakness = 'weakness',   // 약화
  Strength = 'strength',   // 강화
}

// 아이템 타입
export enum ItemType {
  Weapon = 'weapon',
  Armor = 'armor',
  Accessory = 'accessory',
  Consumable = 'consumable',
  Material = 'material',
  Quest = 'quest',
}

// 아이템 등급
export enum ItemRarity {
  Common = 'common',       // 일반
  Uncommon = 'uncommon',   // 비범한
  Rare = 'rare',          // 희귀한
  Epic = 'epic',          // 영웅적
  Legendary = 'legendary', // 전설적
  Mythic = 'mythic',      // 신화적
}

// 던전 타입
export enum DungeonType {
  Cave = 'cave',
  Forest = 'forest',
  Temple = 'temple',
  Castle = 'castle',
  Underground = 'underground',
  Mountain = 'mountain',
  Desert = 'desert',
  Swamp = 'swamp',
}

// 게임 난이도
export enum Difficulty {
  Easy = 'easy',
  Normal = 'normal',
  Hard = 'hard',
  Nightmare = 'nightmare',
}

// 사운드 타입
export enum SoundType {
  BGM = 'bgm',
  SFX = 'sfx',
  Voice = 'voice',
  UI = 'ui',
}

// 애니메이션 상태
export enum AnimationState {
  Idle = 'idle',
  Walk = 'walk',
  Run = 'run',
  Attack = 'attack',
  Hit = 'hit',
  Die = 'die',
  Cast = 'cast',
}

// UI 상태
export enum UIState {
  Hidden = 'hidden',
  Visible = 'visible',
  Transitioning = 'transitioning',
}

// 로그 레벨
export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}
