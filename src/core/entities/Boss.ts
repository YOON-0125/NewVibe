import { Enemy } from './Enemy';
import { Position, Stats } from '../../shared/types';
import { EnemyType, BossType } from '../../shared/enums';
import { Ability } from '../data/abilities';

/**
 * 보스 캐릭터 클래스
 * 능력을 드랍하는 특별한 적
 */
export class Boss extends Enemy {
  private bossType: BossType;
  private phase: number = 1;
  private maxPhases: number = 3;
  private abilities: Ability[] = [];
  private specialAttackCooldown: number = 0;
  private enrageThreshold: number = 0.3; // 30% 체력 이하에서 광폭화

  constructor(
    id: string,
    name: string,
    position: Position,
    stats: Stats,
    bossType: BossType,
    abilities: Ability[]
  ) {
    super(id, name, position, stats, EnemyType.Boss);
    this.bossType = bossType;
    this.abilities = [...abilities];
  }

  /**
   * 보스 업데이트
   */
  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    this.updateTimers(deltaTime);
    this.updatePhase();
    this.updateBossAI(deltaTime);
  }

  /**
   * 보스 AI 업데이트
   */
  protected updateBossAI(deltaTime: number): void {
    // 기본 AI 실행
    super.updateAI(deltaTime);

    // 특수 공격 사용
    if (this.shouldUseSpecialAttack()) {
      this.useSpecialAttack();
    }
  }

  /**
   * 페이즈 업데이트
   */
  private updatePhase(): void {
    const healthPercentage = this.getHealthPercentage();
    const newPhase = Math.min(
      this.maxPhases,
      Math.floor((1 - healthPercentage) * this.maxPhases) + 1
    );

    if (newPhase !== this.phase) {
      this.changePhase(newPhase);
    }
  }

  /**
   * 페이즈 변경
   */
  private changePhase(newPhase: number): void {
    console.log(`${this.name} enters phase ${newPhase}!`);
    this.phase = newPhase;

    // 페이즈별 능력 강화
    switch (this.phase) {
      case 2:
        this.stats.attack *= 1.2;
        this.stats.speed *= 1.1;
        console.log(`${this.name} becomes more aggressive!`);
        break;
      case 3:
        this.stats.attack *= 1.5;
        this.stats.speed *= 1.2;
        console.log(`${this.name} enters enrage mode!`);
        break;
    }
  }

  /**
   * 특수 공격 사용 여부 판단
   */
  private shouldUseSpecialAttack(): boolean {
    return (
      this.specialAttackCooldown <= 0 &&
      this.target !== null &&
      this.calculateDistance(this.target.getPosition()) <= 3
    );
  }

  /**
   * 특수 공격 사용
   */
  private useSpecialAttack(): void {
    if (!this.target) return;

    const ability = this.getRandomAbility();
    if (ability) {
      console.log(`${this.name} uses special attack: ${ability.name}!`);
      
      // 특수 공격 효과 적용 (추후 AbilitySystem과 연동)
      const damage = this.calculateSpecialAttackDamage(ability);
      this.target.takeDamage(damage);
      
      this.specialAttackCooldown = ability.cooldown || 3000; // 기본 3초
    }
  }

  /**
   * 특수 공격 데미지 계산
   */
  private calculateSpecialAttackDamage(ability: Ability): number {
    const baseDamage = this.stats.attack * (ability.damage || 1.5);
    const phaseBonuse = 1 + (this.phase - 1) * 0.3; // 페이즈당 30% 증가
    return Math.floor(baseDamage * phaseBonuse);
  }

  /**
   * 랜덤 능력 선택
   */
  private getRandomAbility(): Ability | null {
    if (this.abilities.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * this.abilities.length);
    return this.abilities[randomIndex];
  }

  /**
   * 타이머 업데이트
   */
  protected updateTimers(deltaTime: number): void {
    super.updateTimers(deltaTime);
    
    if (this.specialAttackCooldown > 0) {
      this.specialAttackCooldown -= deltaTime;
    }
  }

  /**
   * 보스 사망 시 처리
   */
  protected die(): void {
    super.die();
    
    console.log(`${this.name} has been defeated!`);
    console.log('Boss abilities available for absorption:');
    
    this.abilities.forEach((ability, index) => {
      console.log(`${index + 1}. ${ability.name}: ${ability.description}`);
    });
  }

  /**
   * 능력 드랍
   */
  public getDroppableAbilities(): Ability[] {
    // 보스가 가진 능력 중 일부를 드랍
    const dropCount = Math.min(3, this.abilities.length); // 최대 3개
    const droppedAbilities: Ability[] = [];
    
    // 랜덤하게 능력 선택
    const shuffled = [...this.abilities].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < dropCount; i++) {
      droppedAbilities.push(shuffled[i]);
    }
    
    return droppedAbilities;
  }

  /**
   * 광폭화 상태 확인
   */
  public isEnraged(): boolean {
    return this.getHealthPercentage() <= this.enrageThreshold;
  }

  // Getters
  public getBossType(): BossType {
    return this.bossType;
  }

  public getPhase(): number {
    return this.phase;
  }

  public getAbilities(): Ability[] {
    return [...this.abilities];
  }

  public getMaxPhases(): number {
    return this.maxPhases;
  }
}
