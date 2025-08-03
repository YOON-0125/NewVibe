import { Character } from './Character';
import { Position, Stats } from '../../shared/types';
import { Direction } from '../../shared/enums';
import { Ability } from '../data/abilities';

/**
 * 플레이어 캐릭터 클래스
 */
export class Player extends Character {
  private abilities: Ability[] = [];
  private experience: number = 0;
  private level: number = 1;
  private direction: Direction = Direction.Down;

  constructor(
    id: string,
    name: string,
    position: Position,
    stats: Stats
  ) {
    super(id, name, position, stats);
  }

  /**
   * 플레이어 업데이트
   */
  public update(deltaTime: number): void {
    // 플레이어 로직 업데이트
    // 예: 애니메이션, 상태 업데이트 등
  }

  /**
   * 플레이어 이동
   */
  public move(direction: Direction): boolean {
    this.direction = direction;
    
    const newPosition = { ...this.position };
    
    switch (direction) {
      case Direction.Up:
        newPosition.y -= 1;
        break;
      case Direction.Down:
        newPosition.y += 1;
        break;
      case Direction.Left:
        newPosition.x -= 1;
        break;
      case Direction.Right:
        newPosition.x += 1;
        break;
    }

    // 이동 가능한지 검증 (추후 MapSystem과 연동)
    if (this.canMoveTo(newPosition)) {
      this.moveTo(newPosition);
      return true;
    }
    
    return false;
  }

  /**
   * 능력 추가
   */
  public addAbility(ability: Ability): void {
    this.abilities.push(ability);
    console.log(`${this.name} gained ability: ${ability.name}`);
  }

  /**
   * 능력 사용
   */
  public useAbility(abilityIndex: number): boolean {
    if (abilityIndex < 0 || abilityIndex >= this.abilities.length) {
      return false;
    }

    const ability = this.abilities[abilityIndex];
    
    // 능력 사용 조건 검사 (쿨다운, 마나 등)
    if (this.canUseAbility(ability)) {
      console.log(`${this.name} used ability: ${ability.name}`);
      // 능력 효과 적용 (추후 AbilitySystem과 연동)
      return true;
    }
    
    return false;
  }

  /**
   * 경험치 획득
   */
  public gainExperience(amount: number): void {
    this.experience += amount;
    console.log(`${this.name} gained ${amount} experience`);
    
    // 레벨업 체크
    this.checkLevelUp();
  }

  /**
   * 이동 가능 여부 확인
   */
  private canMoveTo(position: Position): boolean {
    // 추후 MapSystem과 연동하여 충돌 검사
    return true;
  }

  /**
   * 능력 사용 가능 여부 확인
   */
  private canUseAbility(ability: Ability): boolean {
    // 추후 쿨다운, 자원 소모 등 체크
    return true;
  }

  /**
   * 레벨업 체크
   */
  private checkLevelUp(): void {
    const requiredExp = this.level * 100; // 간단한 레벨업 공식
    
    if (this.experience >= requiredExp) {
      this.levelUp();
    }
  }

  /**
   * 레벨업
   */
  private levelUp(): void {
    this.level++;
    this.experience = 0;
    
    // 스탯 증가
    this.stats.health += 10;
    this.stats.attack += 2;
    this.stats.defense += 1;
    
    this.maxHealth = this.stats.health;
    this.currentHealth = this.maxHealth; // 레벨업 시 체력 회복
    
    console.log(`${this.name} leveled up to ${this.level}!`);
  }

  // Getters
  public getAbilities(): Ability[] {
    return [...this.abilities];
  }

  public getExperience(): number {
    return this.experience;
  }

  public getLevel(): number {
    return this.level;
  }

  public getDirection(): Direction {
    return this.direction;
  }
}
