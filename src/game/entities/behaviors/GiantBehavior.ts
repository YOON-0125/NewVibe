import { IEnemyBehavior, EnemyUpdateContext } from './IEnemyBehavior';
import { BasicChaserBehavior } from './BasicChaserBehavior';

// (Gemini) 거인의 행동 로직. 기본적으로는 느린 추적자.
export class GiantBehavior extends BasicChaserBehavior implements IEnemyBehavior {
  // 현재는 BasicChaserBehavior와 동일한 행동을 하므로, 추가 로직 없음.
  // 추후 거인만의 특수 패턴 (예: 돌진)을 여기에 추가할 수 있음.
}