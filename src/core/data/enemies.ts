import { Stats, Position } from '../../shared/types';
import { EnemyType, BossType } from '../../shared/enums';
import { CHARACTER_CONFIG } from '../../shared/constants';
import { Ability, DOKKAEBI_ABILITIES } from './abilities';

/**
 * 적 템플릿 인터페이스
 */
export interface EnemyTemplate {
  id: string;
  name: string;
  type: EnemyType;
  baseStats: Stats;
  aiType: string;
  description: string;
  sprite: string;
  rarity: number; // 0-100, 낮을수록 희귀
}

/**
 * 보스 템플릿 인터페이스
 */
export interface BossTemplate extends EnemyTemplate {
  bossType: BossType;
  abilities: Ability[];
  phases: number;
  specialMechanics: string[];
}

/**
 * 일반 적 데이터
 */
export const ENEMY_TEMPLATES: Record<EnemyType, EnemyTemplate[]> = {
  [EnemyType.Goblin]: [
    {
      id: 'basic_goblin',
      name: '고블린',
      type: EnemyType.Goblin,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED,
      },
      aiType: 'aggressive',
      description: '작고 빠른 녹색 괴물. 무리를 지어 다니는 것을 좋아한다.',
      sprite: 'goblin',
      rarity: 80,
    },
    {
      id: 'goblin_warrior',
      name: '고블린 전사',
      type: EnemyType.Goblin,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 1.5,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 1.3,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * 1.2,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.9,
      },
      aiType: 'defensive',
      description: '방어구를 착용한 고블린. 더 강하고 신중하다.',
      sprite: 'goblin_warrior',
      rarity: 40,
    },
  ],

  [EnemyType.Orc]: [
    {
      id: 'basic_orc',
      name: '오크',
      type: EnemyType.Orc,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 2,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 1.5,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * 1.5,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.8,
      },
      aiType: 'berserker',
      description: '크고 강한 녹색 전사. 체력이 낮아질수록 더 공격적이 된다.',
      sprite: 'orc',
      rarity: 60,
    },
    {
      id: 'orc_shaman',
      name: '오크 샤먼',
      type: EnemyType.Orc,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 1.2,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 1.8,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.7,
        mana: 100,
      },
      aiType: 'caster',
      description: '마법을 사용하는 오크. 거리를 두고 주문을 시전한다.',
      sprite: 'orc_shaman',
      rarity: 30,
    },
  ],

  [EnemyType.Skeleton]: [
    {
      id: 'basic_skeleton',
      name: '해골 전사',
      type: EnemyType.Skeleton,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 0.8,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * 0.5,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 1.2,
      },
      aiType: 'relentless',
      description: '죽지 않는 해골 전사. 빠르지만 방어력이 약하다.',
      sprite: 'skeleton',
      rarity: 70,
    },
    {
      id: 'skeleton_archer',
      name: '해골 궁수',
      type: EnemyType.Skeleton,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 0.6,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 1.2,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * 0.3,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED,
      },
      aiType: 'ranged',
      description: '원거리에서 화살을 쏘는 해골 궁수.',
      sprite: 'skeleton_archer',
      rarity: 50,
    },
  ],

  [EnemyType.Zombie]: [
    {
      id: 'basic_zombie',
      name: '좀비',
      type: EnemyType.Zombie,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 1.5,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 0.8,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.6,
      },
      aiType: 'slow_pursuit',
      description: '느리지만 끈질긴 언데드. 체력이 높다.',
      sprite: 'zombie',
      rarity: 75,
    },
    {
      id: 'poison_zombie',
      name: '독 좀비',
      type: EnemyType.Zombie,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 1.2,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 0.9,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * 0.8,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.7,
      },
      aiType: 'poison_spreader',
      description: '독성 기운을 뿜는 좀비. 접촉 시 중독될 수 있다.',
      sprite: 'poison_zombie',
      rarity: 35,
    },
  ],

  [EnemyType.Ghost]: [
    {
      id: 'basic_ghost',
      name: '유령',
      type: EnemyType.Ghost,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * 0.7,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 1.1,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * 0.2,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 1.5,
      },
      aiType: 'ethereal',
      description: '벽을 통과할 수 있는 유령. 빠르지만 물리 공격에 약하다.',
      sprite: 'ghost',
      rarity: 45,
    },
    {
      id: 'wraith',
      name: '원혼',
      type: EnemyType.Ghost,
      baseStats: {
        health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH,
        attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * 1.3,
        defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * 0.3,
        speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 1.3,
        mana: 80,
      },
      aiType: 'fear_inducer',
      description: '공포를 유발하는 강력한 유령. 정신 공격을 사용한다.',
      sprite: 'wraith',
      rarity: 25,
    },
  ],

  [EnemyType.Boss]: [], // 보스는 별도로 관리
};

/**
 * 보스 데이터
 */
export const BOSS_TEMPLATES: Record<BossType, BossTemplate> = {
  [BossType.FireDokkaebi]: {
    id: 'fire_dokkaebi',
    name: '화염 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.FireDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.9,
      mana: 200,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.FireDokkaebi],
    phases: 3,
    specialMechanics: ['fire_immunity', 'flame_aura', 'enrage_at_low_hp'],
    aiType: 'boss_aggressive',
    description: '불의 힘을 다루는 강력한 도깨비. 화염 공격에 면역이다.',
    sprite: 'fire_dokkaebi',
    rarity: 5,
  },

  [BossType.WaterDokkaebi]: {
    id: 'water_dokkaebi',
    name: '물의 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.WaterDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER * 1.2,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER * 0.8,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED,
      mana: 250,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.WaterDokkaebi],
    phases: 3,
    specialMechanics: ['water_healing', 'wave_attacks', 'aqua_shield'],
    aiType: 'boss_defensive',
    description: '물의 치유력을 가진 도깨비. 방어적이지만 강력한 파도 공격을 사용한다.',
    sprite: 'water_dokkaebi',
    rarity: 5,
  },

  [BossType.EarthDokkaebi]: {
    id: 'earth_dokkaebi',
    name: '대지의 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.EarthDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER * 1.5,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER * 1.2,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER * 1.5,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.7,
      mana: 150,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.EarthDokkaebi],
    phases: 3,
    specialMechanics: ['stone_armor', 'earthquake_aoe', 'rock_summon'],
    aiType: 'boss_tank',
    description: '대지의 힘으로 강력한 방어력을 가진 도깨비. 느리지만 엄청난 공격력을 자랑한다.',
    sprite: 'earth_dokkaebi',
    rarity: 5,
  },

  [BossType.WindDokkaebi]: {
    id: 'wind_dokkaebi',
    name: '바람의 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.WindDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER * 0.8,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER * 0.7,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 1.5,
      mana: 180,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.WindDokkaebi],
    phases: 3,
    specialMechanics: ['wind_dash', 'tornado_creation', 'evasion_boost'],
    aiType: 'boss_agile',
    description: '바람처럼 빠른 도깨비. 높은 기동성과 회피율을 가지고 있다.',
    sprite: 'wind_dokkaebi',
    rarity: 5,
  },

  [BossType.ShadowDokkaebi]: {
    id: 'shadow_dokkaebi',
    name: '그림자 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.ShadowDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER * 1.3,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER * 0.8,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 1.2,
      mana: 220,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.ShadowDokkaebi],
    phases: 3,
    specialMechanics: ['shadow_teleport', 'clone_creation', 'stealth_attacks'],
    aiType: 'boss_assassin',
    description: '그림자를 조종하는 교활한 도깨비. 은신과 분신술을 사용한다.',
    sprite: 'shadow_dokkaebi',
    rarity: 5,
  },

  [BossType.IceDokkaebi]: {
    id: 'ice_dokkaebi',
    name: '얼음 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.IceDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER * 1.1,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER * 0.9,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER * 1.2,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 0.8,
      mana: 200,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.IceDokkaebi],
    phases: 3,
    specialMechanics: ['freeze_aura', 'ice_armor', 'blizzard_creation'],
    aiType: 'boss_control',
    description: '얼음의 힘으로 적을 얼리는 도깨비. 범위 제어 능력이 뛰어나다.',
    sprite: 'ice_dokkaebi',
    rarity: 5,
  },

  [BossType.LightningDokkaebi]: {
    id: 'lightning_dokkaebi',
    name: '번개 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.LightningDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER * 0.9,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER * 1.4,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER * 0.6,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED * 1.3,
      mana: 300,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.LightningDokkaebi],
    phases: 3,
    specialMechanics: ['chain_lightning', 'electric_field', 'speed_burst'],
    aiType: 'boss_burst',
    description: '번개의 속도와 파괴력을 가진 도깨비. 연쇄 번개 공격이 특기다.',
    sprite: 'lightning_dokkaebi',
    rarity: 5,
  },

  [BossType.PoisonDokkaebi]: {
    id: 'poison_dokkaebi',
    name: '독의 도깨비',
    type: EnemyType.Boss,
    bossType: BossType.PoisonDokkaebi,
    baseStats: {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER * 0.7,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED,
      mana: 180,
    },
    abilities: DOKKAEBI_ABILITIES[BossType.PoisonDokkaebi],
    phases: 3,
    specialMechanics: ['poison_immunity', 'toxic_aura', 'poison_regeneration'],
    aiType: 'boss_debuffer',
    description: '독을 다루는 도깨비. 지속 피해와 디버프에 특화되어 있다.',
    sprite: 'poison_dokkaebi',
    rarity: 5,
  },
};

/**
 * 적 템플릿 조회
 */
export function getEnemyTemplate(enemyType: EnemyType, templateId?: string): EnemyTemplate | null {
  const templates = ENEMY_TEMPLATES[enemyType];
  if (!templates || templates.length === 0) return null;

  if (templateId) {
    return templates.find(t => t.id === templateId) || null;
  }

  // 가중치 기반 랜덤 선택
  const totalWeight = templates.reduce((sum, template) => sum + template.rarity, 0);
  let random = Math.random() * totalWeight;

  for (const template of templates) {
    random -= template.rarity;
    if (random <= 0) {
      return template;
    }
  }

  return templates[templates.length - 1];
}

/**
 * 보스 템플릿 조회
 */
export function getBossTemplate(bossType: BossType): BossTemplate {
  return BOSS_TEMPLATES[bossType];
}

/**
 * 랜덤 보스 타입 선택
 */
export function getRandomBossType(): BossType {
  const bossTypes = Object.values(BossType);
  return bossTypes[Math.floor(Math.random() * bossTypes.length)];
}

/**
 * 레벨에 따른 스탯 조정
 */
export function scaleStatsForLevel(baseStats: Stats, level: number): Stats {
  const scaleFactor = 1 + (level - 1) * 0.2; // 레벨당 20% 증가
  
  return {
    health: Math.floor(baseStats.health * scaleFactor),
    attack: Math.floor(baseStats.attack * scaleFactor),
    defense: Math.floor(baseStats.defense * scaleFactor),
    speed: baseStats.speed, // 속도는 증가하지 않음
    mana: baseStats.mana ? Math.floor(baseStats.mana * scaleFactor) : undefined,
  };
}

/**
 * 모든 적 템플릿 목록
 */
export function getAllEnemyTemplates(): EnemyTemplate[] {
  const allTemplates: EnemyTemplate[] = [];
  
  for (const enemyType of Object.values(EnemyType)) {
    if (enemyType === EnemyType.Boss) continue;
    allTemplates.push(...ENEMY_TEMPLATES[enemyType]);
  }
  
  return allTemplates;
}

/**
 * 모든 보스 템플릿 목록
 */
export function getAllBossTemplates(): BossTemplate[] {
  return Object.values(BOSS_TEMPLATES);
}
