import * as PIXI from 'pixi.js';
import { Vector2 } from './Player';

export class Enemy {
  public sprite: PIXI.Graphics;
  private position: Vector2;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private radius: number = 10;
  private color: number;

  constructor(x: number, y: number, speed: number = 50, health: number = 30) {
    this.position = { x, y };
    this.speed = speed;
    this.health = health;
    this.maxHealth = health;
    this.color = 0xFF4444; // 빨간색
    
    this.sprite = new PIXI.Graphics();
    this.createSprite();
    this.updateSpritePosition();
  }

  private createSprite(): void {
    this.sprite.clear();
    
    // 적을 빨간 사각형으로 표현
    this.sprite.beginFill(this.color, 0.8);
    this.sprite.drawRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
    this.sprite.endFill();
    
    // 테두리 추가
    this.sprite.lineStyle(1, 0xFFFFFF, 1);
    this.sprite.drawRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
  }

  update(deltaTime: number, playerPosition: Vector2): void {
    // 플레이어를 향해 이동
    const dx = playerPosition.x - this.position.x;
    const dy = playerPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveDistance = this.speed * deltaTime;
      const ratio = moveDistance / distance;
      
      this.position.x += dx * ratio;
      this.position.y += dy * ratio;
      
      this.updateSpritePosition();
    }
  }

  private updateSpritePosition(): void {
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
  }

  getPosition(): Vector2 {
    return { ...this.position };
  }

  getRadius(): number {
    return this.radius;
  }

  takeDamage(damage: number): boolean {
    this.health -= damage;
    return this.health <= 0;
  }

  getHealth(): number {
    return this.health;
  }

  isAlive(): boolean {
    return this.health > 0;
  }
}