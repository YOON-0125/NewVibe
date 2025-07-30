import * as PIXI from 'pixi.js';
import { Position, GameMap, RenderObject } from '../shared/types';
import { GAME_CONFIG, MAP_CONFIG, COLORS } from '../shared/constants';
import { TileType } from '../shared/enums';
import { SpriteManager } from './SpriteManager';

/**
 * PixiJS 렌더러
 * 게임의 모든 렌더링을 담당
 */
export class PixiRenderer {
  private app: PIXI.Application;
  private gameContainer: PIXI.Container;
  private mapContainer: PIXI.Container;
  private entityContainer: PIXI.Container;
  private uiContainer: PIXI.Container;
  private spriteManager: SpriteManager;
  
  private cameraX: number = 0;
  private cameraY: number = 0;
  private zoom: number = 1.0;

  private tileSprites: Map<string, PIXI.Sprite> = new Map();
  private entitySprites: Map<string, PIXI.Sprite> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    // PixiJS 애플리케이션 초기화
    this.app = new PIXI.Application({
      view: canvas,
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      backgroundColor: 0x000000,
      antialias: true,
    });

    // 컨테이너 생성 및 계층 구조 설정
    this.gameContainer = new PIXI.Container();
    this.mapContainer = new PIXI.Container();
    this.entityContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();

    // 계층 순서 설정
    this.gameContainer.addChild(this.mapContainer as unknown as PIXI.DisplayObject);
    this.gameContainer.addChild(this.entityContainer as unknown as PIXI.DisplayObject);
    
    this.app.stage.addChild(this.gameContainer as unknown as PIXI.DisplayObject);
    this.app.stage.addChild(this.uiContainer as unknown as PIXI.DisplayObject);

    // SpriteManager 초기화
    this.spriteManager = new SpriteManager(this.app);
    this.spriteManager.loadResources();

    // 테스트용 엔티티 생성 제거 - GameScene에서 관리

    console.log('PixiRenderer initialized');
  }

  /**
   * 렌더러 시작
   */
  public start(): void {
    this.app.ticker.start();
  }

  /**
   * 테스트용 엔티티 생성
   */
  private createTestEntities(): void {
    // 플레이어 테스트 (타일 그리드에 맞춤)
    const playerSprite = this.createEntitySprite('player');
    const playerTileX = 6;
    const playerTileY = 6;
    playerSprite.x = playerTileX * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    playerSprite.y = playerTileY * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    playerSprite.anchor.set(0.5); // 중앙 정렬
    this.entityContainer.addChild(playerSprite as unknown as PIXI.DisplayObject);

    // 적 테스트 (타일 그리드에 맞춤)
    const enemySprite = this.createEntitySprite('enemy');
    const enemyTileX = 9;
    const enemyTileY = 7;
    enemySprite.x = enemyTileX * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    enemySprite.y = enemyTileY * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    enemySprite.anchor.set(0.5); // 중앙 정렬
    this.entityContainer.addChild(enemySprite as unknown as PIXI.DisplayObject);

    // 보스 테스트 (타일 그리드에 맞춤)
    const bossSprite = this.createEntitySprite('boss');
    const bossTileX = 12;
    const bossTileY = 9;
    bossSprite.x = bossTileX * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    bossSprite.y = bossTileY * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    bossSprite.anchor.set(0.5); // 중앙 정렬
    this.entityContainer.addChild(bossSprite as unknown as PIXI.DisplayObject);

    console.log('Test entities created (aligned to tile grid)');
  }

  /**
   * 렌더러 정지
   */
  public stop(): void {
    this.app.ticker.stop();
  }

  /**
   * 맵 렌더링
   */
  public renderMap(map: GameMap): void {
    // 기존 타일 스프라이트 제거
    this.clearMapSprites();

    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const tile = map.tiles[x][y];
        this.renderTile(tile, x, y);
      }
    }
  }

  /**
   * 타일 렌더링
   */
  private renderTile(tile: any, x: number, y: number): void {
    const tileKey = `${x}_${y}`;
    
    // 이미 렌더링된 타일이면 업데이트만
    let sprite = this.tileSprites.get(tileKey);
    
    if (!sprite) {
      sprite = this.createTileSprite(tile.type);
      sprite.x = x * MAP_CONFIG.TILE_SIZE;
      sprite.y = y * MAP_CONFIG.TILE_SIZE;
      
      this.mapContainer.addChild(sprite as unknown as PIXI.DisplayObject);
      this.tileSprites.set(tileKey, sprite);
    }

    // 가시성 업데이트
    this.updateTileVisibility(sprite, tile);
  }

  /**
   * 타일 스프라이트 생성
   */
  private createTileSprite(tileType: TileType): PIXI.Sprite {
    const graphics = new PIXI.Graphics();
    
    switch (tileType) {
      case TileType.Floor:
        graphics.beginFill(0x8B4513); // 갈색 바닥
        break;
      case TileType.Wall:
        graphics.beginFill(0x696969); // 회색 벽
        break;
      case TileType.Door:
        graphics.beginFill(0x654321); // 어두운 갈색 문
        break;
      case TileType.Stairs:
        graphics.beginFill(0xFFD700); // 금색 계단
        break;
      default:
        graphics.beginFill(0x000000); // 검은색 빈 공간
        break;
    }
    
    graphics.drawRect(0, 0, MAP_CONFIG.TILE_SIZE, MAP_CONFIG.TILE_SIZE);
    graphics.endFill();

    // 격자 테두리 추가
    graphics.lineStyle(1, 0x333333, 0.5);
    graphics.drawRect(0, 0, MAP_CONFIG.TILE_SIZE, MAP_CONFIG.TILE_SIZE);

    const texture = PIXI.RenderTexture.create({
      width: MAP_CONFIG.TILE_SIZE,
      height: MAP_CONFIG.TILE_SIZE,
    });
    
    if (this.app.renderer) {
      this.app.renderer.render(graphics as unknown as PIXI.DisplayObject, {
        renderTexture: texture,
      });
    } else {
      console.warn('Renderer not available for tile sprite creation');
    }
    
    return new PIXI.Sprite(texture);
  }

  /**
   * 타일 가시성 업데이트
   */
  private updateTileVisibility(sprite: PIXI.Sprite, tile: any): void {
    if (tile.visible) {
      sprite.alpha = 1.0; // 완전히 보임
    } else if (tile.explored) {
      sprite.alpha = 0.3; // 반투명 (이미 탐험했지만 현재 안 보임)
    } else {
      sprite.alpha = 0.0; // 완전히 안 보임
    }
  }

  /**
   * 엔티티 렌더링
   */
  public renderEntity(entity: RenderObject): void {
    let sprite = this.entitySprites.get(entity.id);

    if (!sprite) {
      sprite = this.createEntitySprite(entity.sprite);
      this.entityContainer.addChild(sprite as unknown as PIXI.DisplayObject);
      this.entitySprites.set(entity.id, sprite);
    }

    // 위치 업데이트
    sprite.x = entity.position.x * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    sprite.y = entity.position.y * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
    sprite.anchor.set(0.5); // 중앙 정렬
    sprite.visible = entity.visible;
    sprite.zIndex = entity.zIndex;
  }

  /**
   * 엔티티 스프라이트 생성
   */
  private createEntitySprite(spriteType: string): PIXI.Sprite {
    // SpriteManager에서 스프라이트 가져오기 시도
    const sprite = this.spriteManager.createSprite(spriteType);
    if (sprite) {
      return sprite;
    }

    // 폴백: 기본 방식으로 생성
    const graphics = new PIXI.Graphics();
    
    switch (spriteType) {
      case 'player':
        graphics.beginFill(0x00FF00); // 초록색 플레이어
        graphics.drawCircle(0, 0, MAP_CONFIG.TILE_SIZE / 3);
        break;
      case 'enemy':
        graphics.beginFill(0xFF0000); // 빨간색 적
        graphics.drawCircle(0, 0, MAP_CONFIG.TILE_SIZE / 4);
        break;
      case 'boss':
        graphics.beginFill(0xFF6600); // 주황색 보스
        graphics.drawCircle(0, 0, MAP_CONFIG.TILE_SIZE / 2);
        break;
      default:
        graphics.beginFill(0xFFFFFF); // 기본 흰색
        graphics.drawRect(-MAP_CONFIG.TILE_SIZE / 4, -MAP_CONFIG.TILE_SIZE / 4, 
                         MAP_CONFIG.TILE_SIZE / 2, MAP_CONFIG.TILE_SIZE / 2);
        break;
    }
    
    graphics.endFill();

    const texture = PIXI.RenderTexture.create({
      width: MAP_CONFIG.TILE_SIZE,
      height: MAP_CONFIG.TILE_SIZE,
    });
    
    if (this.app.renderer) {
      this.app.renderer.render(graphics as unknown as PIXI.DisplayObject, {
        renderTexture: texture,
      });
    } else {
      console.warn('Renderer not available for entity sprite creation');
    }
    
    return new PIXI.Sprite(texture);
  }

  /**
   * 엔티티 제거
   */
  public removeEntity(entityId: string): void {
    const sprite = this.entitySprites.get(entityId);
    if (sprite) {
      this.entityContainer.removeChild(sprite as unknown as PIXI.DisplayObject);
      this.entitySprites.delete(entityId);
    }
  }

  /**
   * 카메라 위치 설정
   */
  public setCameraPosition(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
    this.updateCameraTransform();
  }

  /**
   * 카메라를 특정 위치로 중앙 정렬
   */
  public centerCameraOn(position: Position): void {
    const centerX = (position.x * MAP_CONFIG.TILE_SIZE) - (GAME_CONFIG.CANVAS_WIDTH / 2);
    const centerY = (position.y * MAP_CONFIG.TILE_SIZE) - (GAME_CONFIG.CANVAS_HEIGHT / 2);
    
    this.setCameraPosition(centerX, centerY);
  }

  /**
   * 줌 설정
   */
  public setZoom(zoom: number): void {
    this.zoom = Math.max(0.5, Math.min(3.0, zoom)); // 0.5x ~ 3.0x 제한
    this.updateCameraTransform();
  }

  /**
   * 카메라 변환 업데이트
   */
  private updateCameraTransform(): void {
    this.gameContainer.scale.set(this.zoom);
    this.gameContainer.x = -this.cameraX * this.zoom;
    this.gameContainer.y = -this.cameraY * this.zoom;
  }

  /**
   * 화면 좌표를 월드 좌표로 변환
   */
  public screenToWorld(screenX: number, screenY: number): Position {
    return {
      x: Math.floor((screenX / this.zoom + this.cameraX) / MAP_CONFIG.TILE_SIZE),
      y: Math.floor((screenY / this.zoom + this.cameraY) / MAP_CONFIG.TILE_SIZE),
    };
  }

  /**
   * 월드 좌표를 화면 좌표로 변환
   */
  public worldToScreen(worldX: number, worldY: number): Position {
    return {
      x: (worldX * MAP_CONFIG.TILE_SIZE - this.cameraX) * this.zoom,
      y: (worldY * MAP_CONFIG.TILE_SIZE - this.cameraY) * this.zoom,
    };
  }

  /**
   * UI 텍스트 렌더링
   */
  public renderText(text: string, x: number, y: number, style?: Partial<PIXI.TextStyle>): PIXI.Text {
    const defaultStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 2,
    });

    const textStyle = { ...defaultStyle, ...style } as PIXI.TextStyle;
    const textObject = new PIXI.Text(text, textStyle);
    
    textObject.x = x;
    textObject.y = y;
    
    this.uiContainer.addChild(textObject as unknown as PIXI.DisplayObject);
    
    return textObject;
  }

  /**
   * UI 요소들 제거
   */
  public clearUI(): void {
    while (this.uiContainer.children.length > 0) {
      const child = this.uiContainer.children[0];
      this.uiContainer.removeChild(child as unknown as PIXI.DisplayObject);
    }
  }

  /**
   * 맵 스프라이트들 제거
   */
  private clearMapSprites(): void {
    while (this.mapContainer.children.length > 0) {
      const child = this.mapContainer.children[0];
      this.mapContainer.removeChild(child as unknown as PIXI.DisplayObject);
    }
    this.tileSprites.clear();
  }

  /**
   * 모든 엔티티 스프라이트 제거
   */
  public clearEntities(): void {
    while (this.entityContainer.children.length > 0) {
      const child = this.entityContainer.children[0];
      this.entityContainer.removeChild(child as unknown as PIXI.DisplayObject);
    }
    this.entitySprites.clear();
  }

  /**
   * 디버그 정보 렌더링
   */
  public renderDebugInfo(info: string[]): void {
    // 기존 디버그 텍스트 제거
    const debugTexts = this.uiContainer.children.filter(child => 
      (child as any).debugInfo === true
    );
    debugTexts.forEach(text => this.uiContainer.removeChild(text as unknown as PIXI.DisplayObject));

    // 새 디버그 정보 렌더링
    info.forEach((line, index) => {
      const text = this.renderText(line, 10, 10 + index * 20, {
        fontSize: 12,
        fill: 0x00FF00,
      });
      (text as any).debugInfo = true;
    });
  }

  /**
   * 스크린샷 촬영
   */
  public takeScreenshot(): string {
    if (!this.app.renderer) {
      console.warn('Renderer not available for screenshot');
      return '';
    }
    return this.app.renderer.plugins.extract.base64(this.app.stage);
  }

  /**
   * 렌더러 정리
   */
  public dispose(): void {
    this.app.ticker.stop();
    this.clearMapSprites();
    this.clearEntities();
    this.clearUI();
    if (this.spriteManager) {
      this.spriteManager.clearCache();
    }
    this.app.destroy(true, true);
    console.log('PixiRenderer disposed');
  }

  // Getters
  public getApp(): PIXI.Application {
    return this.app;
  }

  public getCameraPosition(): Position {
    return { x: this.cameraX, y: this.cameraY };
  }

  public getZoom(): number {
    return this.zoom;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }
}
