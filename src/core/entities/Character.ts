import { Position, Stats } from '../../shared/types';

/**
 * 기본 캐릭터 클래스
 * 플레이어와 적의 공통 속성을 정의
 */
export abstract class Character {
  protected id: string;
  protected name: string;
  protected position: Position;
  protected stats: Stats;
  protected maxHealth: number;
  protected currentHealth: number;
  protected isAlive: boolean = true;

  constructor(
    id: string,
    name: string,
    position: Position,
    stats: Stats
  ) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.stats = stats;
    this.maxHealth = stats.health;
    this.currentHealth = stats.health;
  }

  /**
   * 캐릭터 업데이트
   */
  public abstract update(deltaTime: number): void;

  /**
   * 데미지 받기
   */
  public takeDamage(damage: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    
    if (this.currentHealth <= 0) {
      this.die();
    }
    
    console.log(`${this.name} took ${damage} damage. Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  /**
   * 치료
   */
  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    console.log(`${this.name} healed ${amount}. Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  /**
   * 사망 처리
   */
  protected die(): void {
    this.isAlive = false;
    console.log(`${this.name} has died`);
  }

  /**
   * 위치 이동
   */
  public moveTo(newPosition: Position): void {
    this.position = { ...newPosition };
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getPosition(): Position {
    return { ...this.position };
  }

  public getStats(): Stats {
    return { ...this.stats };
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getIsAlive(): boolean {
    return this.isAlive;
  }

  public getHealthPercentage(): number {
    return this.currentHealth / this.maxHealth;
  }
}
