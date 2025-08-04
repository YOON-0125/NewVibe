import * as PIXI from 'pixi.js';
import { Player, Vector2 } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from './WeaponManager';

export interface CollisionResult {
  playerEnemyCollisions: { player: Player; enemy: Enemy }[];
  weaponEnemyCollisions: { projectile?: Projectile; weapon?: PIXI.Graphics; enemy: Enemy }[];
  // (Gemini) 적 투사체-플레이어 충돌 결과 추가
  enemyProjectilePlayerCollisions: { projectile: Projectile; player: Player }[];
}

export class CollisionManager {
  checkCollisions(
    player: Player, 
    enemies: Enemy[], 
    projectiles: Projectile[],
    orbitalWeapons: PIXI.Graphics[] 
  ): CollisionResult {
    const result: CollisionResult = {
      playerEnemyCollisions: [],
      weaponEnemyCollisions: [],
      enemyProjectilePlayerCollisions: [], // (Gemini) 초기화
    };

    // 플레이어-적 충돌 검사
    enemies.forEach(enemy => {
      if (enemy.isAlive() && this.checkCircleCollision(
        player.getPosition(), 
        player.getRadius(),
        enemy.getPosition(),
        enemy.getRadius()
      )) {
        result.playerEnemyCollisions.push({ player, enemy });
      }
    });

    // 아군 투사체-적 충돌 검사
    projectiles.forEach(projectile => {
      // (Gemini) 아군 투사체만 검사
      if (!projectile.isEnemyProjectile) {
        enemies.forEach(enemy => {
          if (enemy.isAlive() && this.checkCircleCollision(
            projectile.position,
            3, // 투사체 반지름
            enemy.getPosition(),
            enemy.getRadius()
          )) {
            result.weaponEnemyCollisions.push({ projectile, enemy });
          }
        });
      } else { // (Gemini) 적 투사체-플레이어 충돌 검사
        if (this.checkCircleCollision(
          projectile.position,
          projectile.sprite.width / 2, // 적 투사체 반지름
          player.getPosition(),
          player.getRadius()
        )) {
          result.enemyProjectilePlayerCollisions.push({ projectile, player });
        }
      }
    });

    // 궤도 무기-적 충돌 검사
    orbitalWeapons.forEach(weapon => {
      enemies.forEach(enemy => {
        if (enemy.isAlive() && this.checkCircleCollision(
          { x: weapon.x, y: weapon.y },
          8, // 궤도 무기 반지름
          enemy.getPosition(),
          enemy.getRadius()
        )) {
          result.weaponEnemyCollisions.push({ weapon, enemy });
        }
      });
    });

    return result;
  }

  private checkCircleCollision(
    pos1: Vector2, 
    radius1: number, 
    pos2: Vector2, 
    radius2: number
  ): boolean {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (radius1 + radius2);
  }

  private checkRectCollision(
    pos1: Vector2,
    width1: number,
    height1: number,
    pos2: Vector2,
    width2: number,
    height2: number
  ): boolean {
    return (
      pos1.x < pos2.x + width2 &&
      pos1.x + width1 > pos2.x &&
      pos1.y < pos2.y + height2 &&
      pos1.y + height1 > pos2.y
    );
  }
}
