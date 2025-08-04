import * as PIXI from 'pixi.js';

export interface Vector2 {
  x: number;
  y: number;
}

// (Gemini) Player 클래스의 속성을 정의하는 인터페이스
export interface IPlayer {
  speed: number;
  maxHealth: number;
  // 필요한 경우 다른 속성도 여기에 추가
}

export class Player {
  public sprite: PIXI.Graphics;
  private position: Vector2;
  private targetPosition: Vector2;
  public speed: number = 150; // pixels per second (Gemini) public으로 변경
  public maxHealth: number = 100; // (Gemini) 최대 체력 추가
  private radius: number = 15;
  private invulnerabilityTimer: number = 0;
  private invulnerabilityDuration: number = 1; // 1초 무적시간
  private isInvulnerable: boolean = false;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.targetPosition = { x, y };

    this.sprite = new PIXI.Graphics();
    this.createSprite();
    this.updateSpritePosition();
  }

  private createSprite(): void {
    this.updateSpriteAppearance();
  }

  private updateSpriteAppearance(): void {
    this.sprite.clear();
    const alpha = this.isInvulnerable ? 0.5 : 1.0;
    this.sprite.beginFill(0x4a90e2, alpha);
    this.sprite.drawCircle(0, 0, this.radius);
    this.sprite.endFill();
    this.sprite.lineStyle(2, 0xffffff, alpha);
    this.sprite.drawCircle(0, 0, this.radius);
  }

  moveTo(x: number, y: number): void {
    this.targetPosition = { x, y };
  }

  update(deltaTime: number): void {
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.updateSpriteAppearance();
      }
    }

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) {
      const moveDistance = this.speed * deltaTime;
      const ratio = Math.min(moveDistance / distance, 1);
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
    if (this.isInvulnerable) {
      return false;
    }
    this.isInvulnerable = true;
    this.invulnerabilityTimer = this.invulnerabilityDuration;
    this.updateSpriteAppearance();
    console.log(`Player took ${damage} damage`);
    return true;
  }

  // (Gemini) isInvincible 메서드 추가
  isInvincible(): boolean {
    return this.isInvulnerable;
  }

  resetPosition(x: number, y: number): void {
    this.position = { x, y };
    this.targetPosition = { x, y };
    this.updateSpritePosition();
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.updateSpriteAppearance();
  }
}