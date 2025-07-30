import { BaseScene } from './BaseScene';
import { Player } from '../core/entities/Player';
import { Enemy } from '../core/entities/Enemy';
import { Boss } from '../core/entities/Boss';
import { InputSystem } from '../core/systems/InputSystem';
import { MapSystem } from '../core/systems/MapSystem';
import { CombatSystem } from '../core/systems/CombatSystem';
import { AbilitySystem } from '../core/systems/AbilitySystem';
import { DOKKAEBI_ABILITIES } from '../core/data/abilities';
import { PixiRenderer } from '../renderer/PixiRenderer';
import { Position, Stats, GameMap } from '../shared/types';
import { Direction, BossType, EnemyType, TileType } from '../shared/enums';
import { MAP_CONFIG, CHARACTER_CONFIG } from '../shared/constants';

/**
 * 메인 게임 플레이 씬
 * 플레이어 이동, 맵 탐험, 전투 등을 담당
 */
export class GameScene extends BaseScene {
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private bosses: Boss[] = [];
  private inputSystem: InputSystem | null = null;
  private mapSystem: MapSystem | null = null;
  private combatSystem: CombatSystem | null = null;
  private abilitySystem: AbilitySystem | null = null;
  private renderer: PixiRenderer | null = null;
  private currentMap: GameMap | null = null;
  private lastMoveTime: number = 0; // 이동 쿨다운용
  private moveDelay: number = 150; // 150ms 쿨다운

  constructor(inputSystem: InputSystem, mapSystem: MapSystem, renderer: PixiRenderer) {
    super();
    this.inputSystem = inputSystem;
    this.mapSystem = mapSystem;
    this.renderer = renderer;

    // 전투 및 능력 시스템 초기화
    this.combatSystem = new CombatSystem();
    this.abilitySystem = new AbilitySystem();
  }

  protected async onInit(): Promise<void> {
    // 플레이어 생성
    this.createPlayer();

    // 맵 생성
    await this.createMap();

    // 적들 생성
    this.createEnemies();

    // 입력 핸들러 등록
    this.setupInputHandlers();

    console.log('GameScene initialized with player, map, and enemies');
  }

  protected onEnter(): void {
    // 카메라를 플레이어 위치로 이동
    if (this.player && this.renderer) {
      this.renderer.centerCameraOn(this.player.getPosition());
    }

    // 맵 렌더링
    if (this.currentMap && this.renderer) {
      this.renderer.renderMap(this.currentMap);
    }

    // 플레이어 렌더링
    this.renderPlayer();

    // 적들 렌더링
    this.renderEnemies();
  }

  protected onUpdate(deltaTime: number): void {
    // 입력 처리
    this.handleInput();

    // 능력 시스템 업데이트
    if (this.abilitySystem) {
      this.abilitySystem.update(deltaTime);
    }

    // 플레이어 업데이트
    if (this.player) {
      this.player.update(deltaTime);
    }

    // 적들 업데이트
    this.enemies.forEach((enemy) => enemy.update(deltaTime));
    this.bosses.forEach((boss) => boss.update(deltaTime));

    // 카메라 업데이트 (플레이어 따라가기)
    this.updateCamera();
  }

  protected onRender(): void {
    // 렌더링은 PixiRenderer가 자동으로 처리
    // 필요시 추가 렌더링 로직
  }

  protected onExit(): void {
    // 입력 핸들러 해제
    this.clearInputHandlers();
  }

  protected onDispose(): void {
    if (this.player) {
      this.player = null;
    }

    if (this.currentMap) {
      this.currentMap = null;
    }

    this.clearInputHandlers();
  }

  /**
   * 플레이어 생성
   */
  private createPlayer(): void {
    const playerStats: Stats = {
      health: 100,
      attack: 10,
      defense: 5,
      speed: 1,
    };

    const startPosition: Position = { x: 5, y: 5 }; // 맵 중앙 근처

    this.player = new Player('player-001', '주역술사', startPosition, playerStats);

    console.log('Player created at position:', startPosition);
  }

  /**
   * 맵 생성
   */
  private async createMap(): Promise<void> {
    if (!this.mapSystem) {
      throw new Error('MapSystem not available');
    }

    // 15x15 크기의 테스트 맵 생성
    this.currentMap = await this.mapSystem.generateMap(15, 15);

    // 플레이어 시야 업데이트
    if (this.player && this.currentMap) {
      this.updatePlayerVision();
    }

    console.log('Map created with size:', this.currentMap.width, 'x', this.currentMap.height);
  }

  /**
   * 적들 생성
   */
  private createEnemies(): void {
    if (!this.currentMap) {
      console.warn('Cannot create enemies: no map available');
      return;
    }

    // 적 생성 (테스트용)
    const enemyStats: Stats = {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED,
    };

    const enemy1 = new Enemy(
      'enemy-001',
      '도깨비 전사',
      { x: 9, y: 7 },
      enemyStats,
      EnemyType.Goblin,
    );
    this.enemies.push(enemy1);

    // 보스 생성 (테스트용)
    const bossStats: Stats = {
      health: CHARACTER_CONFIG.ENEMY_BASE_HEALTH * CHARACTER_CONFIG.BOSS_HEALTH_MULTIPLIER,
      attack: CHARACTER_CONFIG.ENEMY_BASE_ATTACK * CHARACTER_CONFIG.BOSS_ATTACK_MULTIPLIER,
      defense: CHARACTER_CONFIG.ENEMY_BASE_DEFENSE * CHARACTER_CONFIG.BOSS_DEFENSE_MULTIPLIER,
      speed: CHARACTER_CONFIG.ENEMY_BASE_SPEED,
    };

    const boss1 = new Boss(
      'boss-001',
      '화염 도깨비',
      { x: 12, y: 9 },
      bossStats,
      BossType.FireDokkaebi,
      DOKKAEBI_ABILITIES[BossType.FireDokkaebi],
    );
    this.bosses.push(boss1);

    console.log('Enemies created:', this.enemies.length, 'enemies,', this.bosses.length, 'bosses');
  }

  /**
   * 입력 핸들러 설정
   */
  private setupInputHandlers(): void {
    // 이동은 handleInput()에서 처리하므로 여기서는 비활성화
    console.log('Input handlers setup (movement handled in handleInput)');
  }

  /**
   * 입력 핸들러 해제
   */
  private clearInputHandlers(): void {
    if (!this.inputSystem) return;

    this.inputSystem.clearKeyListeners();
    console.log('Input handlers cleared');
  }

  /**
   * 입력 처리 (연속 입력용)
   */
  private handleInput(): void {
    if (!this.inputSystem || !this.player) return;

    // 연속 이동을 위한 키 상태 체크 (gemini)
    if (this.inputSystem.isKeyDown('KeyW') || this.inputSystem.isKeyDown('ArrowUp')) {
      // (gemini)
      this.movePlayer(Direction.Up); // (gemini)
    } else if (this.inputSystem.isKeyDown('KeyS') || this.inputSystem.isKeyDown('ArrowDown')) {
      // (gemini)
      this.movePlayer(Direction.Down); // (gemini)
    } else if (this.inputSystem.isKeyDown('KeyA') || this.inputSystem.isKeyDown('ArrowLeft')) {
      // (gemini)
      this.movePlayer(Direction.Left); // (gemini)
    } else if (this.inputSystem.isKeyDown('KeyD') || this.inputSystem.isKeyDown('ArrowRight')) {
      // (gemini)
      this.movePlayer(Direction.Right); // (gemini)
    }

    // 전투 입력 (Space 또는 Z키)
    if (this.inputSystem.isKeyPressed('Space') || this.inputSystem.isKeyPressed('KeyZ')) {
      this.handleCombat();
    }

    // 능력 사용 입력 (숫자키 1-4)
    if (this.inputSystem.isKeyPressed('Digit1')) {
      this.useAbility(0);
    } else if (this.inputSystem.isKeyPressed('Digit2')) {
      this.useAbility(1);
    } else if (this.inputSystem.isKeyPressed('Digit3')) {
      this.useAbility(2);
    } else if (this.inputSystem.isKeyPressed('Digit4')) {
      this.useAbility(3);
    }

    // 상호작용 (E키 또는 Enter)
    if (this.inputSystem.isKeyPressed('KeyE') || this.inputSystem.isKeyPressed('Enter')) {
      this.handleInteraction();
    }
  }

  /**
   * 플레이어 이동
   */
  private movePlayer(direction: Direction): void {
    if (!this.player || !this.currentMap) return;

    // 이동 쿨다운 체크
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveDelay) {
      return; // 아직 쿨다운 중
    }

    const currentPos = this.player.getPosition();
    const newPos = this.getNewPosition(currentPos, direction);

    // 맵 경계 체크
    if (!this.isValidPosition(newPos)) {
      return;
    }

    // 이동 가능 체크 (벽 등)
    if (!this.canMoveTo(newPos)) {
      return;
    }

    // 플레이어 이동
    const moved = this.player.move(direction);

    if (moved) {
      this.lastMoveTime = currentTime; // 마지막 이동 시간 업데이트

      // 시야 업데이트
      this.updatePlayerVision();

      // 플레이어 렌더링 업데이트
      this.renderPlayer();

      console.log(`Player moved to position: ${newPos.x}, ${newPos.y}`);
    }
  }

  /**
   * 새 위치 계산
   */
  private getNewPosition(currentPos: Position, direction: Direction): Position {
    const newPos = { ...currentPos };

    switch (direction) {
      case Direction.Up:
        newPos.y -= 1;
        break;
      case Direction.Down:
        newPos.y += 1;
        break;
      case Direction.Left:
        newPos.x -= 1;
        break;
      case Direction.Right:
        newPos.x += 1;
        break;
    }

    return newPos;
  }

  /**
   * 위치 유효성 체크
   */
  private isValidPosition(position: Position): boolean {
    if (!this.currentMap) return false;

    return (
      position.x >= 0 &&
      position.x < this.currentMap.width &&
      position.y >= 0 &&
      position.y < this.currentMap.height
    );
  }

  /**
   * 이동 가능 여부 체크
   */
  private canMoveTo(position: Position): boolean {
    if (!this.currentMap || !this.isValidPosition(position)) {
      return false;
    }

    const tile = this.currentMap.tiles[position.x][position.y];

    // 벽이나 장애물이 아닌 경우만 이동 가능
    return tile.walkable;
  }

  /**
   * 플레이어 시야 업데이트
   */
  private updatePlayerVision(): void {
    if (!this.player || !this.currentMap || !this.mapSystem) return;

    const playerPos = this.player.getPosition();
    const visionRange = 3; // 시야 범위

    // 시야 범위 내 타일들을 보이도록 설정
    for (let x = playerPos.x - visionRange; x <= playerPos.x + visionRange; x++) {
      for (let y = playerPos.y - visionRange; y <= playerPos.y + visionRange; y++) {
        if (this.isValidPosition({ x, y })) {
          const tile = this.currentMap.tiles[x][y];
          tile.visible = true;
          tile.explored = true;
        }
      }
    }

    // 렌더러에 맵 업데이트 알림
    if (this.renderer) {
      this.renderer.renderMap(this.currentMap);
    }
  }

  /**
   * 카메라 업데이트
   */
  private updateCamera(): void {
    if (!this.player || !this.renderer) return;

    const playerPos = this.player.getPosition();
    this.renderer.centerCameraOn(playerPos);
  }

  /**
   * 플레이어 렌더링
   */
  private renderPlayer(): void {
    if (!this.player || !this.renderer) return;

    const renderObject = {
      id: this.player.getId(),
      sprite: 'player',
      position: this.player.getPosition(),
      visible: true,
      zIndex: 10, // 플레이어는 항상 위에
    };

    this.renderer.renderEntity(renderObject);
  }

  /**
   * 적들 렌더링
   */
  private renderEnemies(): void {
    if (!this.renderer) return;

    // 일반 적들 렌더링
    this.enemies.forEach((enemy) => {
      const renderObject = {
        id: enemy.getId(),
        sprite: 'enemy',
        position: enemy.getPosition(),
        visible: enemy.getIsAlive(),
        zIndex: 5,
      };
      this.renderer!.renderEntity(renderObject);
    });

    // 보스들 렌더링
    this.bosses.forEach((boss) => {
      const renderObject = {
        id: boss.getId(),
        sprite: 'boss',
        position: boss.getPosition(),
        visible: boss.getIsAlive(),
        zIndex: 6,
      };
      this.renderer!.renderEntity(renderObject);
    });
  }

  /**
   * 전투 처리
   */
  private handleCombat(): void {
    if (!this.player || !this.combatSystem) return;

    const playerPos = this.player.getPosition();

    // 인접한 적 찾기
    const nearbyEnemies = [...this.enemies, ...this.bosses].filter((enemy) => {
      if (!enemy.getIsAlive()) return false;

      const enemyPos = enemy.getPosition();
      const distance = Math.abs(playerPos.x - enemyPos.x) + Math.abs(playerPos.y - enemyPos.y);
      return distance <= 1; // 인접한 칸 (1칸 거리)
    });

    if (nearbyEnemies.length > 0) {
      // 첫 번째 적과 전투
      const target = nearbyEnemies[0];
      const combatResult = this.combatSystem.performAttack(this.player, target);

      if (combatResult) {
        console.log(`전투: ${this.player.getName()} vs ${target.getName()}`);

        // 적이 죽었으면 렌더링 업데이트
        this.renderEnemies();
      }
    } else {
      console.log('전투 가능한 적이 근처에 없습니다.');
    }
  }

  /**
   * 능력 사용
   */
  private useAbility(abilityIndex: number): void {
    if (!this.player || !this.abilitySystem) return;

    const abilities = this.player.getAbilities();
    if (abilityIndex >= 0 && abilityIndex < abilities.length) {
      const ability = abilities[abilityIndex];
      const used = this.abilitySystem.useAbility(this.player, ability);

      if (used) {
        console.log(`능력 사용: ${ability.name}`);
      } else {
        console.log(`능력 사용 실패: ${ability.name} (쿨다운 또는 자원 부족)`);
      }
    } else {
      console.log(`능력 슬롯 ${abilityIndex + 1}에 능력이 없습니다.`);
    }
  }

  /**
   * 상호작용 처리 (계단, 아이템 등)
   */
  private handleInteraction(): void {
    if (!this.player || !this.currentMap) return;

    const playerPos = this.player.getPosition();

    // 현재 위치의 타일 확인
    if (this.isValidPosition(playerPos)) {
      const currentTile = this.currentMap.tiles[playerPos.x][playerPos.y];

      // 계단 상호작용
      if (currentTile.type === TileType.Stairs) {
        // TileType.Stairs
        console.log('계단을 발견했습니다! 다음 층으로...');
        // 다음 층 이동 로직 (추후 구현)
        this.goToNextFloor();
      } else {
        console.log('상호작용할 수 있는 것이 없습니다.');
      }
    }
  }

  /**
   * 다음 층으로 이동
   */
  private goToNextFloor(): void {
    console.log('다음 층으로 이동합니다! (추후 구현 예정)');
    // 다음 층 로직은 추후 구현
    // 예: 새로운 맵 생성, 적 리셋, 보상 지급 등
  }

  // Getters
  public getPlayer(): Player | null {
    return this.player;
  }

  public getCurrentMap(): GameMap | null {
    return this.currentMap;
  }
}
