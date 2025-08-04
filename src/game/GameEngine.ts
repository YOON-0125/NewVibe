import * as PIXI from 'pixi.js';
import { Enemy } from './entities/Enemy';
import { Player } from './entities/Player';
import { EnemyManager } from './managers/EnemyManager';
import { WeaponManager } from './managers/WeaponManager';
import { InputManager } from './managers/InputManager';
import { CollisionManager } from './managers/CollisionManager';
import { GameAction, GameState, GameStats } from '../contexts/GameStateContext';

export interface InputData {
  type: 'move' | 'pause' | 'resume';
  x?: number;
  y?: number;
}

export class GameEngine {
  private app: PIXI.Application;
  private player!: Player;
  private enemyManager!: EnemyManager;
  private weaponManager!: WeaponManager;
  private inputManager!: InputManager;
  private collisionManager!: CollisionManager;
  private isRunning: boolean = false;
  private gameTime: number = 0;
  private dispatch: React.Dispatch<GameAction>;
  private score: number = 0;
  private currentPlayerLevel: number = 1;
  private currentPlayerHealth: number = 100;
  private difficultyLevel: number = 0;
  private gameState?: GameState;

  constructor(container: HTMLElement, dispatch: React.Dispatch<GameAction>) {
    this.dispatch = dispatch;
    this.app = new PIXI.Application({
      width: 375,
      height: 455,
      backgroundColor: 0x1a1a1a,
      antialias: true,
    });
  }

  async init(): Promise<void> {
    const container = document.querySelector('.game-canvas') as HTMLElement;
    if (container) {
      container.appendChild(this.app.view as HTMLCanvasElement);
    }

    this.player = new Player(this.app.screen.width / 2, this.app.screen.height / 2);
    this.weaponManager = new WeaponManager(this.player);
    this.enemyManager = new EnemyManager(this.weaponManager);
    this.inputManager = new InputManager();
    this.collisionManager = new CollisionManager();

    this.app.stage.addChild(this.player.sprite as unknown as PIXI.DisplayObject);

    this.app.ticker.add(this.gameLoop.bind(this));
  }

  start(initialState: GameState): void {
    this.updateFromGameState(initialState);
    this.isRunning = true;
  }

  restart(initialState: GameState): void {
    this.gameTime = 0;
    this.score = 0;
    this.currentPlayerLevel = 1;
    this.currentPlayerHealth = 100;

    if (this.enemyManager) {
      this.enemyManager.clearAllEnemies(this.app.stage);
    }

    if (this.weaponManager) {
      this.weaponManager.clear(this.app.stage);
    }

    if (this.player) {
      this.player.resetPosition(this.app.screen.width / 2, this.app.screen.height / 2);
    }
    this.start(initialState);
  }

  updateFromGameState(state: GameState): void {
    this.gameState = state;

    // (Gemini) 플레이어 능력치 업데이트
    this.player.speed = state.player.speed; // 플레이어 속도 업데이트
    this.player.maxHealth = state.player.maxHealth; // 플레이어 최대 체력 업데이트
    this.currentPlayerLevel = state.player.level;
    this.currentPlayerHealth = state.player.health; // 현재 체력 업데이트

    // (Gemini) 난이도 관련 능력치 업데이트
    this.updateDifficulty(
      state.difficulty.level,
      state.difficulty.enemyHealthMultiplier,
      state.difficulty.enemySpeedMultiplier,
      state.difficulty.enemyDamageMultiplier,
    );

    // (Gemini) 무기 능력치 업데이트 (WeaponManager에서 상세 처리)
    this.weaponManager.updateWeaponStats(state);

    // (Gemini) 궤도 무기 및 방어막 시각적 업데이트 (WeaponManager에서 처리)
    if (state.weapons.shield.level > 0) {
      this.weaponManager.upgradeShield(this.app.stage);
    }
    if (
      state.weapons.orbital.level > 0 &&
      this.weaponManager.getOrbitalWeapons().length < state.weapons.orbital.count
    ) {
      this.weaponManager.addOrbitalWeapon(this.app.stage, state.weapons.orbital.damage); // (Gemini) damage 인자 추가
    }
  }

  updateDifficulty(
    difficultyLevel: number,
    healthMultiplier: number,
    speedMultiplier: number,
    damageMultiplier: number,
  ): void {
    this.difficultyLevel = difficultyLevel;
    if (this.enemyManager) {
      this.enemyManager.updateDifficulty(healthMultiplier, speedMultiplier, damageMultiplier);
    }
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    this.isRunning = true;
  }

  destroy(): void {
    this.app.destroy(true);
  }

  handleInput(input: InputData): void {
    if (input.type === 'move' && input.x !== undefined && input.y !== undefined) {
      this.player.moveTo(input.x, input.y);
    }
  }

  private gameLoop(deltaTime: number): void {
    if (!this.isRunning || !this.gameState) return;

    const delta = deltaTime / 60;
    this.gameTime += delta;

    this.player.update(delta);
    this.enemyManager.update(delta, this.player.getPosition(), this.app.stage, this.gameTime);

    this.weaponManager.update(delta, this.app.stage);
    this.weaponManager.fireProjectiles(delta, this.enemyManager.getEnemies(), this.app.stage);

    const collisions = this.collisionManager.checkCollisions(
      this.player,
      this.enemyManager.getEnemies(),
      this.weaponManager.getProjectiles(),
      this.weaponManager.getOrbitalWeapons(),
    );
    this.handleCollisions(collisions);

    const shieldTargets = this.weaponManager.getShieldDamageTargets(this.enemyManager.getEnemies());
    if (shieldTargets.length > 0) {
      const shieldDamage = this.gameState.weapons.shield.damage;
      shieldTargets.forEach((enemy) => {
        this.handleDamageEvent(enemy, shieldDamage, 'shield');
      });
    }

    const playerPos = this.player.getPosition();
    this.dispatch({
      type: 'UPDATE_PLAYER',
      payload: {
        x: playerPos.x,
        y: playerPos.y,
        health: this.currentPlayerHealth,
      },
    });
    this.dispatch({ type: 'UPDATE_TIME', payload: this.gameTime });

    if (this.gameTime >= 600) {
      // (Gemini) 테스트를 위해 10초로 수정 // 사용자 600초로 수정
      this.isRunning = false;
      this.dispatch({ type: 'INCREASE_DIFFICULTY' });
      this.dispatch({ type: 'GAME_VICTORY' });
      return;
    }
  }

  private handleDamageEvent(
    enemy: Enemy,
    damage: number,
    weaponId: 'projectile' | 'orbital' | 'shield' | 'unknown',
  ) {
    if (!this.gameState) return;

    const isDead = enemy.takeDamage(damage);
    const currentStats = this.gameState.stats;
    const newStats: GameStats = JSON.parse(JSON.stringify(currentStats));

    newStats.damageDealt += damage;

    if (!newStats.weaponStats[weaponId]) {
      newStats.weaponStats[weaponId] = { kills: 0, damage: 0, maxSingleDamage: 0 };
    }
    const weaponStat = newStats.weaponStats[weaponId];
    weaponStat.damage += damage;
    if (damage > weaponStat.maxSingleDamage) {
      weaponStat.maxSingleDamage = damage;
    }

    if (damage > newStats.highestDamage.damage) {
      newStats.highestDamage = { weaponId, damage };
    }

    if (isDead) {
      newStats.enemiesKilled += 1;
      newStats.experienceGained += 10;
      weaponStat.kills += 1;

      this.enemyManager.removeEnemy(enemy, this.app.stage); // (Gemini) stage 전달
      this.app.stage.removeChild(enemy.sprite as unknown as PIXI.DisplayObject);
    }

    this.dispatch({ type: 'UPDATE_STATS', payload: newStats });
  }

  private handleCollisions(collisions: any): void {
    if (collisions.playerEnemyCollisions.length > 0 && !this.player.isInvincible()) {
      const baseDamage = 10 + (this.currentPlayerLevel - 1) * 0.5;
      const difficultyMultiplier = this.enemyManager
        ? this.enemyManager.getDamageMultiplier()
        : 1.0;
      const damage = Math.floor(baseDamage * difficultyMultiplier);

      this.player.takeDamage(damage);

      const newHealth = Math.max(0, this.currentPlayerHealth - damage);
      this.currentPlayerHealth = newHealth;

      if (newHealth <= 0) {
        this.isRunning = false;
        this.dispatch({ type: 'GAME_OVER' });
      }
    }

    collisions.weaponEnemyCollisions.forEach((collision: any) => {
      if (!this.gameState) return;

      let damage = 0;
      let weaponId: 'projectile' | 'orbital' | 'unknown' = 'unknown';

      if (collision.projectile) {
        weaponId = 'projectile';
        damage = this.gameState.weapons.projectile.damage;
        this.weaponManager.removeProjectile(collision.projectile);
        this.app.stage.removeChild(collision.projectile.sprite as unknown as PIXI.DisplayObject);
      } else if (collision.weapon) {
        weaponId = 'orbital';
        damage = this.gameState.weapons.orbital.damage;
      }

      if (damage > 0) {
        this.handleDamageEvent(collision.enemy, damage, weaponId);
      }
    });

    // (Gemini) 적 투사체-플레이어 충돌 처리
    collisions.enemyProjectilePlayerCollisions.forEach((collision: any) => {
      if (!this.gameState) return;

      const projectile = collision.projectile;
      const player = collision.player;

      if (!player.isInvincible()) {
        const damage = projectile.damage; // 적 투사체의 데미지
        this.player.takeDamage(damage);

        const newHealth = Math.max(0, this.currentPlayerHealth - damage);
        this.currentPlayerHealth = newHealth;

        if (newHealth <= 0) {
          this.isRunning = false;
          this.dispatch({ type: 'GAME_OVER' });
        }
      }
      // 적 투사체는 플레이어에게 닿으면 사라짐
      this.weaponManager.removeProjectile(projectile);
      this.app.stage.removeChild(projectile.sprite as unknown as PIXI.DisplayObject);
    });
  }
}
