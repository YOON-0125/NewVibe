import { Enemy } from '../Enemy';
import { Vector2 } from '../Player';
import { WeaponManager } from '../../managers/WeaponManager';
import * as PIXI from 'pixi.js';

// (Gemini) 적의 업데이트에 필요한 모든 정보를 담는 컨텍스트 객체
export interface EnemyUpdateContext {
  playerPos: Vector2;
  allEnemies: Enemy[];
  deltaTime: number;
  weaponManager: WeaponManager; // (Gemini) 추가
  stage: PIXI.Container; // (Gemini) 추가
}

// (Gemini) 모든 적 행동 패턴이 구현해야 할 인터페이스
export interface IEnemyBehavior {
  update(enemy: Enemy, context: EnemyUpdateContext): void;
}
