import * as PIXI from 'pixi.js';
import { Enemy, EnemyType } from '../entities/Enemy';
import { Vector2 } from '../entities/Player';
import { IEnemyBehavior, EnemyUpdateContext } from '../entities/behaviors/IEnemyBehavior';
import { BasicChaserBehavior } from '../entities/behaviors/BasicChaserBehavior';
import { GiantBehavior } from '../entities/behaviors/GiantBehavior';
import { SniperBehavior } from '../entities/behaviors/SniperBehavior';
import { WeaponManager } from '../managers/WeaponManager'; // (Gemini) WeaponManager 임포트

export class EnemyManager {
  private enemies: Enemy[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 0.67;
  private maxEnemies: number = 50;
  private gameTime: number = 0;
  private difficultyMultipliers = {
    health: 1.0,
    speed: 1.0,
    damage: 1.0
  };
  private weaponManager: WeaponManager; // (Gemini) WeaponManager 인스턴스 추가

  constructor(weaponManager: WeaponManager) { // (Gemini) 생성자에서 WeaponManager 주입받음
    this.weaponManager = weaponManager;
  }

  update(deltaTime: number, playerPosition: Vector2, stage: PIXI.Container, gameTime: number): void {
    this.gameTime = gameTime;
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
      this.spawnEnemies(stage);
      this.spawnTimer = 0;
    }

    const context: EnemyUpdateContext = { 
      playerPos: playerPosition, 
      deltaTime: deltaTime, 
      allEnemies: this.enemies, 
      weaponManager: this.weaponManager, // (Gemini) WeaponManager를 context에 추가
      stage: stage // (Gemini) stage도 context에 추가 (투사체 발사용)
    };
    this.enemies.forEach((enemy) => {
      enemy.update(context);
    });

    this.removeOffscreenEnemies(stage);
  }

  private spawnEnemies(stage: PIXI.Container): void {
    const spawnCount = 1;

    for (let i = 0; i < spawnCount; i++) {
      this.spawnSingleEnemy(stage);
    }
  }

  private spawnSingleEnemy(stage: PIXI.Container): void {
    const screenWidth = 375;
    const screenHeight = 455;
    const margin = 20;

    let x: number, y: number;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: x = Math.random() * screenWidth; y = -margin; break;
      case 1: x = screenWidth + margin; y = Math.random() * screenHeight; break;
      case 2: x = Math.random() * screenWidth; y = screenHeight + margin; break;
      default: x = -margin; y = Math.random() * screenHeight; break;
    }

    const enemyType = this.getEnemyTypeForCurrentTime();
    const behavior = this.getBehaviorForType(enemyType);

    const enemy = new Enemy(
      enemyType,
      x, y,
      behavior,
      {},
      this.difficultyMultipliers.speed,
      this.difficultyMultipliers.health
    );
    
    this.enemies.push(enemy);
    stage.addChild(enemy.sprite as unknown as PIXI.DisplayObject);
  }

  private getEnemyTypeForCurrentTime(): EnemyType {
    const minutes = this.gameTime / 60;
    const rand = Math.random();
    let cumulative = 0;

    // (Gemini) 확률 순서를 명확하게 하여 예측 가능성 확보
    if (minutes < 2) {
      // 0-2분: Basic 80%, Chaser 20%
      cumulative += 0.8;
      if (rand < cumulative) return EnemyType.Basic;
      cumulative += 0.2;
      if (rand < cumulative) return EnemyType.Chaser;
    } else if (minutes < 5) {
      // 2-5분: Basic 50%, Chaser 30%, Giant 15%, Sniper 5%
      cumulative += 0.5;
      if (rand < cumulative) return EnemyType.Basic;
      cumulative += 0.3;
      if (rand < cumulative) return EnemyType.Chaser;
      cumulative += 0.15;
      if (rand < cumulative) return EnemyType.Giant;
      cumulative += 0.05;
      if (rand < cumulative) return EnemyType.Sniper;
    } else {
      // 5분 이상: Basic 30%, Chaser 35%, Giant 20%, Sniper 15%
      cumulative += 0.3;
      if (rand < cumulative) return EnemyType.Basic;
      cumulative += 0.35;
      if (rand < cumulative) return EnemyType.Chaser;
      cumulative += 0.2;
      if (rand < cumulative) return EnemyType.Giant;
      cumulative += 0.15;
      if (rand < cumulative) return EnemyType.Sniper;
    }

    return EnemyType.Basic; // Fallback
  }

  private getBehaviorForType(type: EnemyType): IEnemyBehavior {
    switch (type) {
      case EnemyType.Chaser:
        return new BasicChaserBehavior();
      case EnemyType.Giant:
        return new GiantBehavior();
      case EnemyType.Sniper:
        return new SniperBehavior(); // (Gemini) SniperBehavior 반환
      case EnemyType.Basic:
      default:
        return new BasicChaserBehavior();
    }
  }

  private removeOffscreenEnemies(stage: PIXI.Container): void {
    const margin = 100;
    this.enemies = this.enemies.filter((enemy) => {
      const pos = enemy.getPosition();
      const isOffscreen = pos.x < -margin || pos.x > 375 + margin || pos.y < -margin || pos.y > 455 + margin;
      if (isOffscreen) {
        stage.removeChild(enemy.sprite as unknown as PIXI.DisplayObject);
        return false;
      }
      return true;
    });
  }

  removeEnemy(enemy: Enemy, stage: PIXI.Container): void { // (Gemini) stage 추가
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      const removedEnemy = this.enemies.splice(index, 1)[0];
      if (removedEnemy.type === EnemyType.Giant) {
        this.spawnSplitEnemies(removedEnemy.getPosition(), this.difficultyMultipliers.health, stage); // (Gemini) stage 전달
      }
    }
  }

  private spawnSplitEnemies(position: Vector2, healthMultiplier: number, stage: PIXI.Container): void { // (Gemini) stage 추가
    const numSplits = Math.min(4, Math.floor(this.gameTime / 60) + 2);
    const angleStep = (Math.PI * 2) / numSplits;
    const spawnRadius = 20;

    for (let i = 0; i < numSplits; i++) {
      const angle = angleStep * i;
      const x = position.x + Math.cos(angle) * spawnRadius;
      const y = position.y + Math.sin(angle) * spawnRadius;

      const splitEnemy = new Enemy(
        EnemyType.Basic,
        x, y,
        new BasicChaserBehavior(),
        { speed: 70, health: 15 },
        this.difficultyMultipliers.speed,
        healthMultiplier
      );
      this.enemies.push(splitEnemy);
      stage.addChild(splitEnemy.sprite as unknown as PIXI.DisplayObject); // (Gemini) 분열된 적을 stage에 추가
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  clearAllEnemies(stage: PIXI.Container): void {
    this.enemies.forEach((enemy) => {
      if (enemy.sprite && enemy.sprite.parent) {
        stage.removeChild(enemy.sprite as unknown as PIXI.DisplayObject);
      }
    });
    this.enemies = [];
  }

  updateDifficulty(health: number, speed: number, damage: number): void {
    this.difficultyMultipliers = { health, speed, damage };
  }

  getDamageMultiplier(): number {
    return this.difficultyMultipliers.damage;
  }
}