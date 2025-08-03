import * as PIXI from 'pixi.js';

export interface Vector2 {
  x: number;
  y: number;
}

export class Player {
  public sprite: PIXI.Graphics;
  private position: Vector2;
  private targetPosition: Vector2;
  private speed: number = 150; // pixels per second
  private radius: number = 15;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.targetPosition = { x, y };
    
    // 플레이어 스프라이트 생성 (기하학적 도형)
    this.sprite = new PIXI.Graphics();
    this.createSprite();
    this.updateSpritePosition();
  }

  private createSprite(): void {
    this.sprite.clear();
    
    // 플레이어를 파란 원으로 표현
    this.sprite.beginFill(0x4A90E2, 1);
    this.sprite.drawCircle(0, 0, this.radius);
    this.sprite.endFill();
    
    // 테두리 추가
    this.sprite.lineStyle(2, 0xFFFFFF, 1);
    this.sprite.drawCircle(0, 0, this.radius);
  }

  moveTo(x: number, y: number): void {
    this.targetPosition = { x, y };
  }

  update(deltaTime: number): void {
    // 타겟 위치로 이동
    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) { // 최소 이동 거리
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

  takeDamage(damage: number): void {
    // 데미지 처리 로직은 GameEngine에서 관리
    console.log(`Player took ${damage} damage`);
  }
}