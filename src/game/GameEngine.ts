import * as PIXI from 'pixi.js';
import { Player } from './entities/Player';
import { EnemyManager } from './managers/EnemyManager';
import { WeaponManager } from './managers/WeaponManager';
import { InputManager } from './managers/InputManager';
import { CollisionManager } from './managers/CollisionManager';
import { GameAction } from '../contexts/GameStateContext';

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

    // 컨테이너에 캔버스 추가
    const container = document.querySelector('.game-canvas') as HTMLElement;
    if (container) {
      container.appendChild(this.app.view as HTMLCanvasElement);
    }

    // 게임 오브젝트 초기화
    this.player = new Player(this.app.screen.width / 2, this.app.screen.height / 2);
    this.enemyManager = new EnemyManager();
    this.weaponManager = new WeaponManager(this.player);
    this.inputManager = new InputManager();
    this.collisionManager = new CollisionManager();

    // 씬에 추가
    this.app.stage.addChild(this.player.sprite as unknown as PIXI.DisplayObject);

    // 초기 무기 추가
    this.weaponManager.addOrbitalWeapon(this.app.stage);

    // 게임 루프 설정
    this.app.ticker.add(this.gameLoop.bind(this));
  }

  start(): void {
    this.isRunning = true;
    this.gameTime = 0;
    this.score = 0;
  }

  pause(): void {
    this.isRunning = false;
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
    if (!this.isRunning) return;

    const delta = deltaTime / 60; // PIXI ticker를 초 단위로 변환
    this.gameTime += delta;

    // 게임 시간 업데이트
    this.dispatch({ type: 'UPDATE_TIME', payload: this.gameTime });

    // 15분 승리 조건
    if (this.gameTime >= 900) { // 15분 = 900초
      this.isRunning = false;
      this.dispatch({ type: 'GAME_OVER' });
      return;
    }

    // 게임 오브젝트 업데이트
    this.player.update(delta);
    this.enemyManager.update(delta, this.player.getPosition(), this.app.stage);
    this.weaponManager.update(delta, this.enemyManager.getEnemies(), this.app.stage);

    // 충돌 검사
    const collisions = this.collisionManager.checkCollisions(
      this.player,
      this.enemyManager.getEnemies(),
      this.weaponManager.getProjectiles()
    );

    // 충돌 처리
    this.handleCollisions(collisions);

    // 플레이어 위치 업데이트
    const playerPos = this.player.getPosition();
    this.dispatch({
      type: 'UPDATE_PLAYER',
      payload: { x: playerPos.x, y: playerPos.y }
    });
  }

  private handleCollisions(collisions: any): void {
    // 플레이어-적 충돌
    if (collisions.playerEnemyCollisions.length > 0) {
      // 플레이어 데미지 처리
      collisions.playerEnemyCollisions.forEach(() => {
        this.dispatch({
          type: 'UPDATE_PLAYER',
          payload: { health: Math.max(0, 90) } // 임시 데미지 처리
        });
      });
    }

    // 무기-적 충돌
    collisions.weaponEnemyCollisions.forEach((collision: any) => {
      // 적이 죽었는지 확인
      const isDead = collision.enemy.takeDamage(collision.projectile?.damage || 15);
      
      if (isDead) {
        // 적 제거
        this.enemyManager.removeEnemy(collision.enemy);
        this.app.stage.removeChild(collision.enemy.sprite as unknown as PIXI.DisplayObject);
        
        // 경험치 추가
        this.dispatch({ type: 'ADD_EXPERIENCE', payload: 10 });
        
        // 점수 추가
        this.score += 100;
        this.dispatch({ type: 'UPDATE_SCORE', payload: this.score });
      }
      
      // 투사체가 있다면 제거
      if (collision.projectile) {
        this.weaponManager.removeProjectile(collision.projectile);
        this.app.stage.removeChild(collision.projectile.sprite as unknown as PIXI.DisplayObject);
      }
    });
  }
}