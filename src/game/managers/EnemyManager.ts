import * as PIXI from 'pixi.js';
import { Enemy } from '../entities/Enemy';
import { Vector2 } from '../entities/Player';

export class EnemyManager {
  private enemies: Enemy[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 2; // 2초마다 스폰
  private maxEnemies: number = 50;

  update(deltaTime: number, playerPosition: Vector2, stage: PIXI.Container): void {
    // 적 스폰
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
      this.spawnEnemy(stage);
      this.spawnTimer = 0;
    }

    // 모든 적 업데이트
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, playerPosition);
    });

    // 화면 밖 적 제거
    this.removeOffscreenEnemies(stage);
  }

  private spawnEnemy(stage: PIXI.Container): void {
    // 화면 경계에서 랜덤 위치에 스폰
    const screenWidth = 375;
    const screenHeight = 455;
    const margin = 50;
    
    let x: number, y: number;
    
    // 화면 가장자리에서 스폰
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: // 위쪽
        x = Math.random() * screenWidth;
        y = -margin;
        break;
      case 1: // 오른쪽
        x = screenWidth + margin;
        y = Math.random() * screenHeight;
        break;
      case 2: // 아래쪽
        x = Math.random() * screenWidth;
        y = screenHeight + margin;
        break;
      case 3: // 왼쪽
      default:
        x = -margin;
        y = Math.random() * screenHeight;
        break;
    }

    const enemy = new Enemy(x, y);
    this.enemies.push(enemy);
    stage.addChild(enemy.sprite as unknown as PIXI.DisplayObject);
  }

  private removeOffscreenEnemies(stage: PIXI.Container): void {
    const screenWidth = 375;
    const screenHeight = 455;
    const margin = 100;

    this.enemies = this.enemies.filter(enemy => {
      const pos = enemy.getPosition();
      const isOffscreen = 
        pos.x < -margin || 
        pos.x > screenWidth + margin || 
        pos.y < -margin || 
        pos.y > screenHeight + margin;

      if (isOffscreen) {
        stage.removeChild(enemy.sprite as unknown as PIXI.DisplayObject);
        return false;
      }
      return true;
    });
  }

  removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  clear(stage: PIXI.Container): void {
    this.enemies.forEach(enemy => {
      stage.removeChild(enemy.sprite as unknown as PIXI.DisplayObject);
    });
    this.enemies = [];
  }
}