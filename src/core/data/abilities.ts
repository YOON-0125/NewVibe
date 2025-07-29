import { AbilityType, AbilityElement, BossType } from '../../shared/enums';

/**
 * 능력 인터페이스
 */
export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  element: AbilityElement;
  damage?: number;
  healing?: number;
  manaCost?: number;
  cooldown?: number; // milliseconds
  duration?: number; // milliseconds (버프/디버프 지속시간)
  range?: number;
  area?: number; // 범위 공격 반경
  icon?: string;
  effects?: AbilityEffect[];
}

/**
 * 능력 효과 인터페이스
 */
export interface AbilityEffect {
  type: string;
  value: number;
  duration?: number;
  chance?: number; // 발동 확률 (0~1)
}

/**
 * 도깨비 능력 데이터
 */
export const DOKKAEBI_ABILITIES: Record<BossType, Ability[]> = {
  [BossType.FireDokkaebi]: [
    {
      id: 'fire_breath',
      name: '화염 숨결',
      description: '뜨거운 화염을 내뿜어 적에게 피해를 주고 화상을 입힙니다.',
      type: AbilityType.Active,
      element: AbilityElement.Fire,
      damage: 2.0,
      manaCost: 30,
      cooldown: 2000,
      range: 3,
      area: 1,
      effects: [
        { type: 'burn', value: 5, duration: 3000, chance: 0.8 },
      ],
    },
    {
      id: 'flame_aura',
      name: '화염 오라',
      description: '몸 주위에 화염을 둘러 근접한 적에게 지속 피해를 줍니다.',
      type: AbilityType.Toggle,
      element: AbilityElement.Fire,
      damage: 0.5,
      manaCost: 5,
      duration: -1, // 토글이므로 무한
      area: 1,
      effects: [
        { type: 'burn', value: 2, duration: 1000, chance: 1.0 },
      ],
    },
    {
      id: 'fire_resistance',
      name: '화염 저항',
      description: '화염 피해에 대한 저항력을 얻습니다.',
      type: AbilityType.Passive,
      element: AbilityElement.Fire,
      effects: [
        { type: 'fire_resistance', value: 0.5, chance: 1.0 },
      ],
    },
  ],

  [BossType.WaterDokkaebi]: [
    {
      id: 'water_wave',
      name: '물의 파도',
      description: '강력한 물의 파도로 적들을 밀어내고 피해를 줍니다.',
      type: AbilityType.Active,
      element: AbilityElement.Water,
      damage: 1.5,
      manaCost: 25,
      cooldown: 1500,
      range: 4,
      area: 2,
      effects: [
        { type: 'knockback', value: 2, chance: 1.0 },
      ],
    },
    {
      id: 'healing_spring',
      name: '치유의 샘',
      description: '체력을 회복하는 치유의 샘을 생성합니다.',
      type: AbilityType.Active,
      element: AbilityElement.Water,
      healing: 50,
      manaCost: 40,
      cooldown: 5000,
      area: 1,
      effects: [
        { type: 'regeneration', value: 10, duration: 5000, chance: 1.0 },
      ],
    },
    {
      id: 'water_shield',
      name: '물의 방패',
      description: '물로 만든 방패가 피해를 흡수합니다.',
      type: AbilityType.Active,
      element: AbilityElement.Water,
      manaCost: 30,
      cooldown: 3000,
      duration: 10000,
      effects: [
        { type: 'shield', value: 100, duration: 10000, chance: 1.0 },
      ],
    },
  ],

  [BossType.EarthDokkaebi]: [
    {
      id: 'stone_throw',
      name: '돌 던지기',
      description: '거대한 돌을 던져 적에게 큰 피해를 줍니다.',
      type: AbilityType.Active,
      element: AbilityElement.Earth,
      damage: 3.0,
      manaCost: 35,
      cooldown: 2500,
      range: 5,
      effects: [
        { type: 'stun', value: 1, duration: 1000, chance: 0.3 },
      ],
    },
    {
      id: 'earth_armor',
      name: '대지의 갑옷',
      description: '돌로 만든 갑옷이 방어력을 크게 증가시킵니다.',
      type: AbilityType.Toggle,
      element: AbilityElement.Earth,
      manaCost: 10,
      duration: -1,
      effects: [
        { type: 'defense_boost', value: 0.5, chance: 1.0 },
        { type: 'speed_penalty', value: -0.2, chance: 1.0 },
      ],
    },
    {
      id: 'earthquake',
      name: '지진',
      description: '주변 지역에 지진을 일으켜 모든 적에게 피해를 줍니다.',
      type: AbilityType.Active,
      element: AbilityElement.Earth,
      damage: 2.5,
      manaCost: 50,
      cooldown: 8000,
      area: 4,
      effects: [
        { type: 'knockdown', value: 1, duration: 2000, chance: 0.7 },
      ],
    },
  ],

  [BossType.WindDokkaebi]: [
    {
      id: 'wind_blade',
      name: '바람의 칼날',
      description: '날카로운 바람으로 적을 베어 출혈을 일으킵니다.',
      type: AbilityType.Active,
      element: AbilityElement.Wind,
      damage: 1.8,
      manaCost: 20,
      cooldown: 1000,
      range: 4,
      effects: [
        { type: 'bleed', value: 3, duration: 5000, chance: 0.6 },
      ],
    },
    {
      id: 'wind_step',
      name: '바람 걸음',
      description: '바람의 힘으로 이동 속도가 크게 증가합니다.',
      type: AbilityType.Active,
      element: AbilityElement.Wind,
      manaCost: 25,
      cooldown: 3000,
      duration: 5000,
      effects: [
        { type: 'speed_boost', value: 1.0, duration: 5000, chance: 1.0 },
        { type: 'evasion_boost', value: 0.3, duration: 5000, chance: 1.0 },
      ],
    },
    {
      id: 'tornado',
      name: '회오리바람',
      description: '거대한 회오리를 생성하여 적들을 끌어들이고 피해를 줍니다.',
      type: AbilityType.Active,
      element: AbilityElement.Wind,
      damage: 1.2,
      manaCost: 45,
      cooldown: 6000,
      duration: 3000,
      area: 3,
      effects: [
        { type: 'pull', value: 1, chance: 1.0 },
        { type: 'confusion', value: 1, duration: 2000, chance: 0.5 },
      ],
    },
  ],

  [BossType.ShadowDokkaebi]: [
    {
      id: 'shadow_strike',
      name: '그림자 일격',
      description: '그림자를 통해 적의 뒤로 순간이동하여 기습 공격합니다.',
      type: AbilityType.Active,
      element: AbilityElement.Shadow,
      damage: 2.2,
      manaCost: 30,
      cooldown: 2000,
      range: 6,
      effects: [
        { type: 'critical', value: 2.0, chance: 1.0 },
        { type: 'blind', value: 1, duration: 2000, chance: 0.4 },
      ],
    },
    {
      id: 'shadow_clone',
      name: '그림자 분신',
      description: '자신의 그림자 분신을 생성하여 함께 싸웁니다.',
      type: AbilityType.Active,
      element: AbilityElement.Shadow,
      manaCost: 60,
      cooldown: 10000,
      duration: 15000,
      effects: [
        { type: 'summon_clone', value: 1, duration: 15000, chance: 1.0 },
      ],
    },
    {
      id: 'shadow_stealth',
      name: '그림자 은신',
      description: '그림자에 숨어 일정 시간 동안 보이지 않게 됩니다.',
      type: AbilityType.Active,
      element: AbilityElement.Shadow,
      manaCost: 40,
      cooldown: 8000,
      duration: 8000,
      effects: [
        { type: 'invisibility', value: 1, duration: 8000, chance: 1.0 },
        { type: 'damage_boost', value: 0.5, duration: 8000, chance: 1.0 },
      ],
    },
  ],

  [BossType.IceDokkaebi]: [
    {
      id: 'ice_shard',
      name: '얼음 파편',
      description: '날카로운 얼음 파편을 발사하여 적을 얼립니다.',
      type: AbilityType.Active,
      element: AbilityElement.Ice,
      damage: 1.6,
      manaCost: 25,
      cooldown: 1200,
      range: 5,
      effects: [
        { type: 'freeze', value: 1, duration: 2000, chance: 0.5 },
        { type: 'slow', value: 0.3, duration: 4000, chance: 0.8 },
      ],
    },
    {
      id: 'ice_armor',
      name: '얼음 갑옷',
      description: '얼음으로 만든 갑옷이 피해를 반사합니다.',
      type: AbilityType.Toggle,
      element: AbilityElement.Ice,
      manaCost: 8,
      duration: -1,
      effects: [
        { type: 'damage_reflection', value: 0.3, chance: 1.0 },
        { type: 'freeze_aura', value: 1, chance: 0.2 },
      ],
    },
    {
      id: 'blizzard',
      name: '눈보라',
      description: '광범위한 눈보라를 일으켜 모든 적을 얼립니다.',
      type: AbilityType.Active,
      element: AbilityElement.Ice,
      damage: 1.0,
      manaCost: 55,
      cooldown: 7000,
      duration: 5000,
      area: 5,
      effects: [
        { type: 'freeze', value: 1, duration: 3000, chance: 0.7 },
        { type: 'vision_reduction', value: 0.5, duration: 5000, chance: 1.0 },
      ],
    },
  ],

  [BossType.LightningDokkaebi]: [
    {
      id: 'lightning_bolt',
      name: '번개 화살',
      description: '강력한 번개를 발사하여 적과 주변 적들에게 피해를 줍니다.',
      type: AbilityType.Active,
      element: AbilityElement.Lightning,
      damage: 2.5,
      manaCost: 35,
      cooldown: 1800,
      range: 6,
      area: 1,
      effects: [
        { type: 'chain_lightning', value: 3, chance: 1.0 },
        { type: 'paralysis', value: 1, duration: 1500, chance: 0.4 },
      ],
    },
    {
      id: 'static_field',
      name: '정전기장',
      description: '주변에 정전기장을 생성하여 지속적으로 피해를 줍니다.',
      type: AbilityType.Toggle,
      element: AbilityElement.Lightning,
      damage: 0.3,
      manaCost: 6,
      duration: -1,
      area: 2,
      effects: [
        { type: 'mana_burn', value: 2, chance: 0.3 },
      ],
    },
    {
      id: 'thunder_storm',
      name: '천둥 폭풍',
      description: '하늘에서 무작위로 번개가 떨어져 적들을 공격합니다.',
      type: AbilityType.Active,
      element: AbilityElement.Lightning,
      damage: 1.8,
      manaCost: 50,
      cooldown: 6000,
      duration: 8000,
      area: 4,
      effects: [
        { type: 'random_strikes', value: 8, duration: 8000, chance: 1.0 },
      ],
    },
  ],

  [BossType.PoisonDokkaebi]: [
    {
      id: 'poison_spit',
      name: '독 침',
      description: '독성 액체를 발사하여 적을 중독시킵니다.',
      type: AbilityType.Active,
      element: AbilityElement.Poison,
      damage: 1.0,
      manaCost: 20,
      cooldown: 1000,
      range: 4,
      effects: [
        { type: 'poison', value: 8, duration: 6000, chance: 0.9 },
        { type: 'healing_reduction', value: 0.5, duration: 10000, chance: 0.7 },
      ],
    },
    {
      id: 'toxic_cloud',
      name: '독성 구름',
      description: '독성 구름을 생성하여 지역을 오염시킵니다.',
      type: AbilityType.Active,
      element: AbilityElement.Poison,
      damage: 0.5,
      manaCost: 40,
      cooldown: 4000,
      duration: 10000,
      area: 3,
      effects: [
        { type: 'poison', value: 5, duration: 1000, chance: 1.0 },
        { type: 'vision_reduction', value: 0.3, duration: 10000, chance: 1.0 },
      ],
    },
    {
      id: 'poison_immunity',
      name: '독성 면역',
      description: '모든 독에 면역이 되고, 독 피해를 흡수하여 체력을 회복합니다.',
      type: AbilityType.Passive,
      element: AbilityElement.Poison,
      effects: [
        { type: 'poison_immunity', value: 1, chance: 1.0 },
        { type: 'poison_absorption', value: 1, chance: 1.0 },
      ],
    },
  ],
};

/**
 * 능력 이름으로 찾기
 */
export function findAbilityById(id: string): Ability | null {
  for (const bossType of Object.values(BossType)) {
    const abilities = DOKKAEBI_ABILITIES[bossType];
    const ability = abilities.find(a => a.id === id);
    if (ability) {
      return ability;
    }
  }
  return null;
}

/**
 * 특정 속성의 능력들 찾기
 */
export function getAbilitiesByElement(element: AbilityElement): Ability[] {
  const result: Ability[] = [];
  
  for (const bossType of Object.values(BossType)) {
    const abilities = DOKKAEBI_ABILITIES[bossType];
    result.push(...abilities.filter(a => a.element === element));
  }
  
  return result;
}

/**
 * 특정 타입의 능력들 찾기
 */
export function getAbilitiesByType(type: AbilityType): Ability[] {
  const result: Ability[] = [];
  
  for (const bossType of Object.values(BossType)) {
    const abilities = DOKKAEBI_ABILITIES[bossType];
    result.push(...abilities.filter(a => a.type === type));
  }
  
  return result;
}

/**
 * 모든 능력 목록 가져오기
 */
export function getAllAbilities(): Ability[] {
  const result: Ability[] = [];
  
  for (const bossType of Object.values(BossType)) {
    result.push(...DOKKAEBI_ABILITIES[bossType]);
  }
  
  return result;
}
