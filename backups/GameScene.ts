import { BaseScene } from './BaseScene';
import { Player } from '../core/entities/Player';
import { InputSystem } from '../core/systems/InputSystem';
import { MapSystem } from '../core/systems/MapSystem';
import { PixiRenderer } from '../renderer/PixiRenderer';
import { Position, Stats, GameMap } from '../shared/types';
import { Direction } from '../shared/enums';
import { MAP_CONFIG } from '../shared/constants';

/**
 * 메인 게임 플레이 씬
 * 플레이어 이동, 맵 탐험, 전투 등을 담당
 */
export class GameScene extends BaseScene {
  private player: Player | null = null;
  private inputSystem: InputSystem | null = null;
  private mapSystem: MapSystem | null = null;
  private renderer: PixiRenderer | null = null;
  private currentMap: GameMap | null = null;
  private lastMoveTime: number = 0; // 이동 쿨다운용
  private moveDelay: number = 150; // 150ms 쿨다운

  constructor(
    inputSystem: InputSystem,
    mapSystem: MapSystem,
    renderer: PixiRenderer
  ) {
    super();
    this.inputSystem = inputSystem;
    this.mapSystem = mapSystem;
    this.renderer = renderer;
  }

  protected async onInit(): Promise<void> {
    // 플레이어 생성
    this.createPlayer();
    
    // 맵 생성
    await this.createMap();
    
    // 입력 핸들러 등록
    this.setupInputHandlers();
    
    console.log('GameScene initialized with player and map');
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
  }

  protected onUpdate(deltaTime: number): void {
    // 입력 처리
    this.handleInput();
    
    // 플레이어 업데이트
    if (this.player) {
      this.player.update(deltaTime);
    }
    
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

    this.player = new Player(
      'player-001',
      '주역술사',
      startPosition,
      playerStats
    );

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

    // 연속 이동을 위한 키 상태 체크
    if (this.inputSystem.isKeyPressed('KeyW') || this.inputSystem.isKeyPressed('ArrowUp')) {
      this.movePlayer(Direction.Up);
    } else if (this.inputSystem.isKeyPressed('KeyS') || this.inputSystem.isKeyPressed('ArrowDown')) {
      this.movePlayer(Direction.Down);
    } else if (this.inputSystem.isKeyPressed('KeyA') || this.inputSystem.isKeyPressed('ArrowLeft')) {
      this.movePlayer(Direction.Left);
    } else if (this.inputSystem.isKeyPressed('KeyD') || this.inputSystem.isKeyPressed('ArrowRight')) {
      this.movePlayer(Direction.Right);
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

  // Getters
  public getPlayer(): Player | null {
    return this.player;
  }

  public getCurrentMap(): GameMap | null {
    return this.currentMap;
  }
}
