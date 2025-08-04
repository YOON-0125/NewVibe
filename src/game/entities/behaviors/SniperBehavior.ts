import { IEnemyBehavior, EnemyUpdateContext } from './IEnemyBehavior';
import { Vector2 } from '../Player';
import { Enemy } from '../Enemy';

// (Gemini) 저격수의 행동 로직
export class SniperBehavior implements IEnemyBehavior {
  private attackCooldown: number = 0;
  private attackInterval: number = 2; // 2초마다 공격
  private preferredDistance: number = 150; // 플레이어와 유지하려는 거리
  private attackRange: number = 200; // 공격 가능 거리

  update(enemy: Enemy, context: EnemyUpdateContext): void {
    const { playerPos, deltaTime, allEnemies } = context;
    const enemyPos = enemy.getPosition();
    const speed = enemy.getSpeed();

    const dx = playerPos.x - enemyPos.x;
    const dy = playerPos.y - enemyPos.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    let moveDirection: Vector2 = { x: 0, y: 0 };

    // 1. 거리 유지 AI
    if (distanceToPlayer < this.preferredDistance - 10) { // 너무 가까우면 뒤로
      moveDirection = { x: -dx, y: -dy };
    } else if (distanceToPlayer > this.preferredDistance + 10) { // 너무 멀면 앞으로
      moveDirection = { x: dx, y: dy };
    }

    // 이동 방향 정규화
    const moveDistance = Math.sqrt(moveDirection.x * moveDirection.x + moveDirection.y * moveDirection.y);
    if (moveDistance > 0) {
      moveDirection.x /= moveDistance;
      moveDirection.y /= moveDistance;
    }

    // 2. 다른 적들과의 분리
    const separation = { x: 0, y: 0 };
    let neighborsCount = 0;
    const desiredSeparation = enemy.getRadius() * 2.5;

    allEnemies.forEach(other => {
      if (other !== enemy) {
        const otherPos = other.getPosition();
        const diff = { x: enemyPos.x - otherPos.x, y: enemyPos.y - otherPos.y };
        const dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
        
        if (dist > 0 && dist < desiredSeparation) {
          diff.x /= dist * dist;
          diff.y /= dist * dist;
          separation.x += diff.x;
          separation.y += diff.y;
          neighborsCount++;
        }
      }
    });

    if (neighborsCount > 0) {
      separation.x /= neighborsCount;
      separation.y /= neighborsCount;
      const separationDistance = Math.sqrt(separation.x * separation.x + separation.y * separation.y);
      if (separationDistance > 0) {
        separation.x /= separationDistance;
        separation.y /= separationDistance;
      }
    }

    // 3. 최종 이동 방향 (거리 유지 + 분리)
    const finalMove = {
      x: moveDirection.x + separation.x * 1.5,
      y: moveDirection.y + separation.y * 1.5
    };

    const finalDistance = Math.sqrt(finalMove.x * finalMove.x + finalMove.y * finalMove.y);
    if (finalDistance > 0) {
        finalMove.x /= finalDistance;
        finalMove.y /= finalDistance;
    }

    // 4. 위치 업데이트
    const actualMoveDistance = speed * deltaTime;
    const newPos = {
        x: enemyPos.x + finalMove.x * actualMoveDistance,
        y: enemyPos.y + finalMove.y * actualMoveDistance
    };
    enemy.setPosition(newPos.x, newPos.y);

    // 5. 공격 로직
    this.attackCooldown -= deltaTime;
    if (this.attackCooldown <= 0 && distanceToPlayer <= this.attackRange) {
      context.weaponManager.fireEnemyProjectile(
        enemyPos,
        playerPos,
        10, // 데미지
        150, // 속도
        context.stage
      );
      this.attackCooldown = this.attackInterval;
    }
  }
}
