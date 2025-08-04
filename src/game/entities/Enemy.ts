import * as PIXI from 'pixi.js';
import { Vector2 } from './Player';
import { IEnemyBehavior, EnemyUpdateContext } from './behaviors/IEnemyBehavior';

// (Gemini) 적 타입을 나타내는 enum 추가
export enum EnemyType {
  Basic = 'basic',
  Chaser = 'chaser',
  Giant = 'giant',
  Sniper = 'sniper',
}

export class Enemy {
  public sprite: PIXI.Graphics;
  public type: EnemyType;
  private position: Vector2;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private radius: number;
  private behavior: IEnemyBehavior;

  constructor(
    type: EnemyType,
    x: number, 
    y: number, 
    behavior: IEnemyBehavior,
    options: { 
      speed?: number, 
      health?: number, 
      radius?: number 
    } = {},
    speedMultiplier: number = 1.0,
    healthMultiplier: number = 1.0
  ) {
    this.type = type;
    this.position = { x, y };
    this.behavior = behavior;

    // 타입별 기본값 설정
    const defaults = this.getDefaults(type);
    this.speed = (options.speed ?? defaults.speed) * speedMultiplier;
    this.health = Math.floor((options.health ?? defaults.health) * healthMultiplier);
    this.maxHealth = this.health;
    this.radius = options.radius ?? defaults.radius;
    
    this.sprite = new PIXI.Graphics();
    this.createSprite(type, healthMultiplier);
    this.updateSpritePosition();
  }

  private getDefaults(type: EnemyType) {
    switch (type) {
      case EnemyType.Chaser:
        return { speed: 65, health: 25, radius: 7 };
      case EnemyType.Giant:
        return { speed: 30, health: 100, radius: 16 };
      case EnemyType.Sniper:
        return { speed: 40, health: 20, radius: 6 };
      case EnemyType.Basic:
      default:
        return { speed: 50, health: 30, radius: 10 };
    }
  }
  
  private createSprite(type: EnemyType, healthMultiplier: number): void {
    this.sprite.clear();
    
    const baseColor = this.getBaseColor(type);
    const finalColor = this.interpolateColor(baseColor, 0x800000, Math.max(0, (healthMultiplier - 1) * 0.3));

    this.sprite.beginFill(finalColor, 0.9);
    this.sprite.lineStyle(1, 0xFFFFFF, 1);

    switch (type) {
      case EnemyType.Chaser:
        this.sprite.drawCircle(0, 0, this.radius);
        break;
      case EnemyType.Giant:
        this.sprite.drawRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        break;
      case EnemyType.Sniper:
        this.sprite.moveTo(0, -this.radius);
        this.sprite.lineTo(this.radius, 0);
        this.sprite.lineTo(0, this.radius);
        this.sprite.lineTo(-this.radius, 0);
        this.sprite.closePath();
        break;
      case EnemyType.Basic:
      default:
        this.sprite.drawRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        break;
    }
    this.sprite.endFill();
  }

  private getBaseColor(type: EnemyType): number {
      switch (type) {
          case EnemyType.Chaser: return 0xFFA500; // 주황
          case EnemyType.Giant: return 0x8B4513; // 갈색
          case EnemyType.Sniper: return 0x0000FF; // 파랑
          default: return 0xFF4444; // 빨강
      }
  }

  private interpolateColor(color1: number, color2: number, factor: number): number {
    const r1 = (color1 >> 16) & 0xFF, g1 = (color1 >> 8) & 0xFF, b1 = color1 & 0xFF;
    const r2 = (color2 >> 16) & 0xFF, g2 = (color2 >> 8) & 0xFF, b2 = color2 & 0xFF;
    const r = Math.floor(r1 + (r2 - r1) * factor);
    const g = Math.floor(g1 + (g2 - g1) * factor);
    const b = Math.floor(b1 + (b2 - b1) * factor);
    return (r << 16) | (g << 8) | b;
  }

  // (Gemini) 업데이트 로직을 behavior에 위임
  update(context: EnemyUpdateContext): void {
    this.behavior.update(this, context);
    this.updateSpritePosition();
  }

  private updateSpritePosition(): void {
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
  }

  // Public accessors
  getPosition(): Vector2 { return { ...this.position }; }
  setPosition(x: number, y: number): void { this.position = { x, y }; }
  getRadius(): number { return this.radius; }
  getSpeed(): number { return this.speed; }
  getHealth(): number { return this.health; }
  isAlive(): boolean { return this.health > 0; }

  takeDamage(damage: number): boolean {
    this.health -= damage;
    return this.health <= 0;
  }
}