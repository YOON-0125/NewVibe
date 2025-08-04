/**
 * @file 유물(Artifact) 시스템의 핵심 데이터 정의 파일
 *       - 모든 유물의 ID, 효과, 설명 등을 중앙에서 관리합니다.
 *       - 새로운 유물을 추가하려면 이 파일에 새 정의만 추가하면 됩니다.
 */

// 모든 유물의 고유 ID를 열거형으로 정의하여 타입 안정성을 확보합니다.
export enum ArtifactID {
  RubyCrystal = 'RubyCrystal',       // 루비 수정 (최대 체력 증가)
  PowerGauntlet = 'PowerGauntlet',   // 힘의 건틀릿 (모든 공격력 증가)
  SwiftBoots = 'SwiftBoots',         // 신속의 장화 (이동 속도 증가)
  ProjectileAmplifier = 'ProjectileAmplifier', // 투사체 증폭기 (직선탄 데미지 증가)
  OrbitalEnhancer = 'OrbitalEnhancer', // 궤도 강화장치 (궤도탄 데미지 증가)
  ShieldGenerator = 'ShieldGenerator', // 방어막 생성기 (방어막 데미지 증가)
}

// 유물 효과의 적용 방식을 정의하는 인터페이스입니다.
export interface ArtifactEffect {
  /**
   * 효과 적용 방식
   * - ADDITIVE: 합연산 (기본 값에 수치를 더함. 예: 체력 +20)
   * - MULTIPLICATIVE: 곱연산 (기본 값에 비율을 곱하여 더함. 예: 공격력 +10%)
   */
  type: 'ADDITIVE' | 'MULTIPLICATIVE';
  /**
   * 영향을 줄 능력치(stat)의 경로
   * - 'player.maxHealth': 플레이어 최대 체력
   * - 'player.speed': 플레이어 이동 속도
   * - 'all_damage': 모든 무기 데미지 (특수 케이스)
   * - 'weapons.projectile.damage': 직선탄 데미지
   * - 'weapons.orbital.damage': 궤도탄 데미지
   * - 'weapons.shield.damage': 방어막 데미지
   */
  stat: string;
  /**
   * 적용할 값
   * - ADDITIVE의 경우, 더할 수치 (예: 20)
   * - MULTIPLICATIVE의 경우, 증가시킬 비율 (예: 0.1은 10% 증가)
   */
  value: number;
}

// 각 유물의 상세 정보를 정의하는 인터페이스입니다.
export interface ArtifactDefinition {
  id: ArtifactID;
  name: string;
  description: string;
  effects: ArtifactEffect[];
}

// ArtifactID를 키로, ArtifactDefinition을 값으로 갖는 중앙 데이터베이스 객체입니다.
// 게임의 모든 유물 정보는 이 객체를 통해 조회됩니다.
export const ARTIFACT_DEFINITIONS: Record<ArtifactID, ArtifactDefinition> = {
  [ArtifactID.RubyCrystal]: {
    id: ArtifactID.RubyCrystal,
    name: '루비 수정',
    description: '최대 체력을 20 증가시킵니다.',
    effects: [{ type: 'ADDITIVE', stat: 'player.maxHealth', value: 20 }],
  },
  [ArtifactID.PowerGauntlet]: {
    id: ArtifactID.PowerGauntlet,
    name: '힘의 건틀릿',
    description: '모든 무기의 공격력이 10% 증가합니다.',
    effects: [{ type: 'MULTIPLICATIVE', stat: 'all_damage', value: 0.1 }],
  },
  [ArtifactID.SwiftBoots]: {
    id: ArtifactID.SwiftBoots,
    name: '신속의 장화',
    description: '플레이어의 이동 속도가 15% 증가합니다.',
    effects: [{ type: 'MULTIPLICATIVE', stat: 'player.speed', value: 0.15 }],
  },
  [ArtifactID.ProjectileAmplifier]: {
    id: ArtifactID.ProjectileAmplifier,
    name: '투사체 증폭기',
    description: '직선탄의 공격력이 25% 증가합니다.',
    effects: [{ type: 'MULTIPLICATIVE', stat: 'weapons.projectile.damage', value: 0.25 }],
  },
  [ArtifactID.OrbitalEnhancer]: {
    id: ArtifactID.OrbitalEnhancer,
    name: '궤도 강화장치',
    description: '궤도탄의 공격력이 25% 증가합니다.',
    effects: [{ type: 'MULTIPLICATIVE', stat: 'weapons.orbital.damage', value: 0.25 }],
  },
  [ArtifactID.ShieldGenerator]: {
    id: ArtifactID.ShieldGenerator,
    name: '방어막 생성기',
    description: '방어막의 공격력이 25% 증가합니다.',
    effects: [{ type: 'MULTIPLICATIVE', stat: 'weapons.shield.damage', value: 0.25 }],
  },
};
