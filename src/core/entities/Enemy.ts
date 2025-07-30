import { Character } from './Character';
import { Position, Stats } from '../../shared/types';
import { Direction } from '../../shared/enums';
import { EnemyType } from '../../shared/enums';
import { Ability } from '../data/abilities';

/**
 * 일반 적 캐릭터 클래스
 */
export class Enemy extends Character {
  protected enemyType: EnemyType;
  protected aiState: string = 'idle';
  protected target: Character | null = null;
  protected moveTimer: number = 0;
  protected attackCooldown: number = 0;
  protected abilities: Ability[] = [];

  constructor(
    id: string,
    name: string,
    position: Position,
    stats: Stats,
    enemyType: EnemyType,
    abilities: Ability[] = []
  ) {
    super(id, name, position, stats);
    this.enemyType = enemyType;
    this.abilities = [...abilities];
  }

  /**
   * 적 업데이트
   */
  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    this.updateTimers(deltaTime);
    this.updateAI(deltaTime);
  }

  /**
   * AI 업데이트
   */
  protected updateAI(deltaTime: number): void {
    switch (this.aiState) {
      case 'idle':
        this.updateIdleState();
        break;
      case 'chasing':
        this.updateChaseState();
        break;
      case 'attacking':
        this.updateAttackState();
        break;
    }
  }

  /**
   * 대기 상태 업데이트
   */
  protected updateIdleState(): void {
    // 플레이어 감지 로직 (추후 구현)
    if (this.target) {
      this.aiState = 'chasing';
    }
  }

  /**
   * 추적 상태 업데이트
   */
  protected updateChaseState(): void {
    if (!this.target || !this.target.getIsAlive()) {
      this.target = null;
      this.aiState = 'idle';
      return;
    }

    const distance = this.calculateDistance(this.target.getPosition());
    
    if (distance <= 1) {
      // 공격 범위 내
      this.aiState = 'attacking';
    } else if (distance > 10) {
      // 너무 멀어짐
      this.target = null;
      this.aiState = 'idle';
    } else {
      // 플레이어 방향으로 이동
      this.moveTowardsTarget();
    }
  }

  /**
   * 공격 상태 업데이트
   */
  protected updateAttackState(): void {
    if (!this.target || !this.target.getIsAlive()) {
      this.target = null;
      this.aiState = 'idle';
      return;
    }

    const distance = this.calculateDistance(this.target.getPosition());
    
    if (distance > 1) {
      this.aiState = 'chasing';
    } else if (this.attackCooldown <= 0) {
      this.attackTarget();
      this.attackCooldown = 1000; // 1초 쿨다운
    }
  }

  /**
   * 타겟 설정
   */
  public setTarget(target: Character): void {
    this.target = target;
    if (this.aiState === 'idle') {
      this.aiState = 'chasing';
    }
  }

  /**
   * 타겟 공격
   */
  protected attackTarget(): void {
    if (!this.target) return;

    const damage = this.calculateAttackDamage();
    this.target.takeDamage(damage);
    console.log(`${this.name} attacks ${this.target.getName()} for ${damage} damage`);
  }

  /**
   * 공격 데미지 계산
   */
  protected calculateAttackDamage(): number {
    const baseDamage = this.stats.attack;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80~120%
    return Math.floor(baseDamage * randomFactor);
  }

  /**
   * 타겟 방향으로 이동
   */
  protected moveTowardsTarget(): void {
    if (!this.target || this.moveTimer > 0) return;

    const targetPos = this.target.getPosition();
    const dx = targetPos.x - this.position.x;
    const dy = targetPos.y - this.position.y;

    let newPosition = { ...this.position };

    // 더 큰 차이가 있는 축으로 이동
    if (Math.abs(dx) > Math.abs(dy)) {
      newPosition.x += dx > 0 ? 1 : -1;
    } else {
      newPosition.y += dy > 0 ? 1 : -1;
    }

    // 이동 가능한지 확인 (추후 MapSystem과 연동)
    if (this.canMoveTo(newPosition)) {
      this.moveTo(newPosition);
      this.moveTimer = 500; // 0.5초 이동 쿨다운
    }
  }

  /**
   * 거리 계산
   */
  protected calculateDistance(targetPosition: Position): number {
    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 이동 가능 여부 확인
   */
  protected canMoveTo(position: Position): boolean {
    // 추후 MapSystem과 연동하여 충돌 검사
    return true;
  }

  /**
   * 타이머 업데이트
   */
  protected updateTimers(deltaTime: number): void {
    if (this.moveTimer > 0) {
      this.moveTimer -= deltaTime;
    }
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
  }

  /**
   * 사망 시 처리
   */
  protected die(): void {
    super.die();
    // 경험치 드랍 등 추가 처리
    console.log(`${this.name} dropped experience`);
  }

  // Getters
  public getEnemyType(): EnemyType {
    return this.enemyType;
  }

  public getTarget(): Character | null {
    return this.target;
  }

  public getAIState(): string {
    return this.aiState;
  }

  public getAbilities(): Ability[] {
    return [...this.abilities];
  }

  /**
   * 능력 추가
   */
  public addAbility(ability: Ability): void {
    this.abilities.push(ability);
  }

  /**
   * 능력 제거
   */
  public removeAbility(abilityId: string): boolean {
    const index = this.abilities.findIndex(ability => ability.id === abilityId);
    if (index !== -1) {
      this.abilities.splice(index, 1);
      return true;
    }
    return false;
  }
}
