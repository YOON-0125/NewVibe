import { Enemy } from '../Enemy';
import { IEnemyBehavior, EnemyUpdateContext } from './IEnemyBehavior';

// (Gemini) 기존의 단순 추적 로직을 담당하는 클래스
export class BasicChaserBehavior implements IEnemyBehavior {
  public update(enemy: Enemy, context: EnemyUpdateContext): void {
    const { playerPos, allEnemies, deltaTime } = context;
    const enemyPos = enemy.getPosition();
    const speed = enemy.getSpeed();

    // 1. 플레이어를 향한 이동 벡터 계산
    const steer = { x: playerPos.x - enemyPos.x, y: playerPos.y - enemyPos.y };
    const steerDistance = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
    if (steerDistance > 0) {
      steer.x /= steerDistance;
      steer.y /= steerDistance;
    }

    // 2. 다른 적들과의 분리 벡터 계산
    const separation = { x: 0, y: 0 };
    let neighborsCount = 0;
    const desiredSeparation = enemy.getRadius() * 2.5;

    allEnemies.forEach(other => {
      if (other !== enemy) {
        const otherPos = other.getPosition();
        const diff = { x: enemyPos.x - otherPos.x, y: enemyPos.y - otherPos.y };
        const distance = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
        
        if (distance > 0 && distance < desiredSeparation) {
          diff.x /= distance * distance;
          diff.y /= distance * distance;
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

    // 3. 두 벡터를 조합하여 최종 이동 방향 결정
    const finalMove = {
      x: steer.x + separation.x * 1.5,
      y: steer.y + separation.y * 1.5
    };

    const finalDistance = Math.sqrt(finalMove.x * finalMove.x + finalMove.y * finalMove.y);
    if (finalDistance > 0) {
        finalMove.x /= finalDistance;
        finalMove.y /= finalDistance;
    }

    // 4. 최종 위치 업데이트
    const moveDistance = speed * deltaTime;
    const newPos = {
        x: enemyPos.x + finalMove.x * moveDistance,
        y: enemyPos.y + finalMove.y * moveDistance
    };
    enemy.setPosition(newPos.x, newPos.y);
  }
}
