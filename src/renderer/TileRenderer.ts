import * as PIXI from 'pixi.js';
import { GameMap, Tile, Position } from '../shared/types';
import { TileType } from '../shared/enums';
import { MAP_CONFIG } from '../shared/constants';
import { SpriteManager } from './SpriteManager';

/**
 * 타일 렌더러
 * 맵 타일들의 렌더링을 전담하는 클래스
 */
export class TileRenderer {
  private container: PIXI.Container;
  private spriteManager: SpriteManager;
  private tileSprites: Map<string, PIXI.Sprite> = new Map();
  private visibilityOverlay: PIXI.Graphics;
  private fogOfWar: boolean = true;
  private app: PIXI.Application;

  constructor(container: PIXI.Container, spriteManager: SpriteManager, app: PIXI.Application) {
    this.container = container;
    this.spriteManager = spriteManager;
    this.app = app;
    
    // 가시성 오버레이 생성 (안개 효과)
    this.visibilityOverlay = new PIXI.Graphics();
    this.container.addChild(this.visibilityOverlay as unknown as PIXI.DisplayObject);
    
    console.log('TileRenderer initialized');
  }

  /**
   * 맵 전체 렌더링
   */
  public renderMap(map: GameMap): void {
    this.clearTiles();

    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const tile = map.tiles[x][y];
        this.renderTile(tile, x, y);
      }
    }

    if (this.fogOfWar) {
      this.updateFogOfWar(map);
    }
  }

  /**
   * 개별 타일 렌더링
   */
  private renderTile(tile: Tile, x: number, y: number): void {
    const tileKey = this.getTileKey(x, y);
    let sprite = this.tileSprites.get(tileKey);

    if (!sprite) {
      const newSprite = this.createTileSprite(tile.type);
      if (!newSprite) return;
      sprite = newSprite;

      sprite.x = x * MAP_CONFIG.TILE_SIZE;
      sprite.y = y * MAP_CONFIG.TILE_SIZE;
      
      this.container.addChild(sprite as unknown as PIXI.DisplayObject);
      this.tileSprites.set(tileKey, sprite);
    }

    // 타일 상태에 따른 렌더링 업데이트
    this.updateTileAppearance(sprite, tile);
  }

  /**
   * 타일 스프라이트 생성
   */
  private createTileSprite(tileType: TileType): PIXI.Sprite | null {
    const textureName = this.getTileTextureName(tileType);
    const sprite = this.spriteManager.createSprite(textureName);
    
    if (!sprite) {
      // 기본 텍스처로 대체
      return this.createFallbackTileSprite(tileType);
    }

    return sprite;
  }

  /**
   * 기본 타일 스프라이트 생성 (텍스처 로딩 실패 시)
   */
  private createFallbackTileSprite(tileType: TileType): PIXI.Sprite {
    const graphics = new PIXI.Graphics();
    const color = this.getTileColor(tileType);
    
    graphics.beginFill(color);
    graphics.drawRect(0, 0, MAP_CONFIG.TILE_SIZE, MAP_CONFIG.TILE_SIZE);
    graphics.endFill();

    // 테두리 추가
    graphics.lineStyle(1, 0x333333, 0.5);
    graphics.drawRect(0, 0, MAP_CONFIG.TILE_SIZE, MAP_CONFIG.TILE_SIZE);

    const texture = PIXI.RenderTexture.create({
      width: MAP_CONFIG.TILE_SIZE,
      height: MAP_CONFIG.TILE_SIZE,
    });

    this.app.renderer.render(graphics as unknown as PIXI.DisplayObject, {
      renderTexture: texture,
    });

    return new PIXI.Sprite(texture);
  }

  /**
   * 타일 타입에 따른 텍스처 이름 반환
   */
  private getTileTextureName(tileType: TileType): string {
    switch (tileType) {
      case TileType.Floor: return 'floor';
      case TileType.Wall: return 'wall';
      case TileType.Door: return 'door';
      case TileType.Stairs: return 'stairs';
      case TileType.Chest: return 'chest';
      default: return 'floor';
    }
  }

  /**
   * 타일 타입에 따른 기본 색상 반환
   */
  private getTileColor(tileType: TileType): number {
    switch (tileType) {
      case TileType.Floor: return 0x8B4513; // 갈색
      case TileType.Wall: return 0x696969; // 회색
      case TileType.Door: return 0x654321; // 어두운 갈색
      case TileType.Stairs: return 0xFFD700; // 금색
      case TileType.Chest: return 0xDC143C; // 빨간색
      default: return 0x000000; // 검은색
    }
  }

  /**
   * 타일 외관 업데이트 (가시성, 탐험 상태 등)
   */
  private updateTileAppearance(sprite: PIXI.Sprite, tile: Tile): void {
    if (!this.fogOfWar) {
      sprite.alpha = 1.0;
      sprite.tint = 0xFFFFFF;
      return;
    }

    if (tile.visible) {
      // 현재 보이는 타일
      sprite.alpha = 1.0;
      sprite.tint = 0xFFFFFF;
    } else if (tile.explored) {
      // 이미 탐험했지만 현재 안 보이는 타일
      sprite.alpha = 0.5;
      sprite.tint = 0x808080; // 회색조
    } else {
      // 아직 탐험하지 않은 타일
      sprite.alpha = 0.0;
    }
  }

  /**
   * 안개 효과 업데이트
   */
  private updateFogOfWar(map: GameMap): void {
    this.visibilityOverlay.clear();
    
    if (!this.fogOfWar) return;

    // 검은 배경으로 전체 덮기
    this.visibilityOverlay.beginFill(0x000000, 0.8);
    this.visibilityOverlay.drawRect(
      0, 0, 
      map.width * MAP_CONFIG.TILE_SIZE, 
      map.height * MAP_CONFIG.TILE_SIZE
    );
    this.visibilityOverlay.endFill();

    // 보이는 타일 영역을 구멍으로 뚫기
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const tile = map.tiles[x][y];
        
        if (tile.visible) {
          // 구멍을 뚫어서 타일이 보이도록 함
          this.visibilityOverlay.beginHole();
          this.visibilityOverlay.drawRect(
            x * MAP_CONFIG.TILE_SIZE,
            y * MAP_CONFIG.TILE_SIZE,
            MAP_CONFIG.TILE_SIZE,
            MAP_CONFIG.TILE_SIZE
          );
          this.visibilityOverlay.endHole();
        }
      }
    }
  }

  /**
   * 특정 영역만 업고데이트 (성능 최적화)
   */
  public updateRegion(map: GameMap, centerX: number, centerY: number, radius: number): void {
    const minX = Math.max(0, centerX - radius);
    const maxX = Math.min(map.width - 1, centerX + radius);
    const minY = Math.max(0, centerY - radius);
    const maxY = Math.min(map.height - 1, centerY + radius);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const tile = map.tiles[x][y];
        const tileKey = this.getTileKey(x, y);
        const sprite = this.tileSprites.get(tileKey);
        
        if (sprite) {
          this.updateTileAppearance(sprite, tile);
        }
      }
    }

    // 해당 영역의 안개 업데이트
    if (this.fogOfWar) {
      this.updateFogOfWarRegion(map, minX, minY, maxX, maxY);
    }
  }

  /**
   * 특정 영역의 안개 업데이트
   */
  private updateFogOfWarRegion(map: GameMap, minX: number, minY: number, maxX: number, maxY: number): void {
    // 전체 안개를 다시 그리는 것보다 효율적인 방법이 필요하지만
    // 간단한 구현을 위해 전체 안개를 다시 그림
    this.updateFogOfWar(map);
  }

  /**
   * 타일 하이라이트 (마우스 오버 등)
   */
  public highlightTile(x: number, y: number, color: number = 0xFFFF00, alpha: number = 0.3): void {
    this.clearHighlights();

    const highlight = new PIXI.Graphics();
    highlight.beginFill(color, alpha);
    highlight.drawRect(
      x * MAP_CONFIG.TILE_SIZE,
      y * MAP_CONFIG.TILE_SIZE,
      MAP_CONFIG.TILE_SIZE,
      MAP_CONFIG.TILE_SIZE
    );
    highlight.endFill();

    this.container.addChild(highlight as unknown as PIXI.DisplayObject);
    (highlight as any).isHighlight = true; // 나중에 제거하기 위한 마킹
  }

  /**
   * 경로 표시
   */
  public showPath(path: Position[], color: number = 0x00FF00, alpha: number = 0.5): void {
    this.clearPath();

    path.forEach((pos, index) => {
      const pathSprite = new PIXI.Graphics();
      pathSprite.beginFill(color, alpha);
      
      // 시작점과 끝점은 다른 모양으로
      if (index === 0) {
        // 시작점: 원
        pathSprite.drawCircle(
          pos.x * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2,
          pos.y * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2,
          MAP_CONFIG.TILE_SIZE / 4
        );
      } else if (index === path.length - 1) {
        // 끝점: 다이아몬드
        const centerX = pos.x * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
        const centerY = pos.y * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 2;
        const size = MAP_CONFIG.TILE_SIZE / 4;
        
        pathSprite.drawPolygon([
          centerX, centerY - size,
          centerX + size, centerY,
          centerX, centerY + size,
          centerX - size, centerY
        ]);
      } else {
        // 중간점: 작은 사각형
        pathSprite.drawRect(
          pos.x * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 3,
          pos.y * MAP_CONFIG.TILE_SIZE + MAP_CONFIG.TILE_SIZE / 3,
          MAP_CONFIG.TILE_SIZE / 3,
          MAP_CONFIG.TILE_SIZE / 3
        );
      }
      
      pathSprite.endFill();
      this.container.addChild(pathSprite as unknown as PIXI.DisplayObject);
      (pathSprite as any).isPath = true; // 나중에 제거하기 위한 마킹
    });
  }

  /**
   * 그리드 라인 표시/숨기기
   */
  public setGridVisible(visible: boolean): void {
    const existingGrid = this.container.children.find(child => (child as any).isGrid);
    
    if (existingGrid) {
      existingGrid.visible = visible;
      return;
    }

    if (!visible) return;

    // 그리드 생성
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x333333, 0.3);

    // 세로선
    for (let x = 0; x <= 50; x++) { // 최대 맵 크기 가정
      grid.moveTo(x * MAP_CONFIG.TILE_SIZE, 0);
      grid.lineTo(x * MAP_CONFIG.TILE_SIZE, 50 * MAP_CONFIG.TILE_SIZE);
    }

    // 가로선
    for (let y = 0; y <= 50; y++) {
      grid.moveTo(0, y * MAP_CONFIG.TILE_SIZE);
      grid.lineTo(50 * MAP_CONFIG.TILE_SIZE, y * MAP_CONFIG.TILE_SIZE);
    }

    this.container.addChild(grid as unknown as PIXI.DisplayObject);
    (grid as any).isGrid = true;
  }

  /**
   * 안개 모드 토글
   */
  public setFogOfWarEnabled(enabled: boolean): void {
    this.fogOfWar = enabled;
    this.visibilityOverlay.visible = enabled;
  }

  /**
   * 타일 키 생성
   */
  private getTileKey(x: number, y: number): string {
    return `${x}_${y}`;
  }

  /**
   * 하이라이트 제거
   */
  public clearHighlights(): void {
    const highlights = this.container.children.filter(child => (child as any).isHighlight);
    highlights.forEach(highlight => {
      this.container.removeChild(highlight);
    });
  }

  /**
   * 경로 표시 제거
   */
  public clearPath(): void {
    const pathSprites = this.container.children.filter(child => (child as any).isPath);
    pathSprites.forEach(pathSprite => {
      this.container.removeChild(pathSprite);
    });
  }

  /**
   * 모든 타일 제거
   */
  public clearTiles(): void {
    for (const sprite of this.tileSprites.values()) {
      this.container.removeChild(sprite as unknown as PIXI.DisplayObject);
    }
    this.tileSprites.clear();
  }

  /**
   * 렌더러 정리
   */
  public dispose(): void {
    this.clearTiles();
    this.clearHighlights();
    this.clearPath();
    
    if (this.visibilityOverlay) {
      this.container.removeChild(this.visibilityOverlay as unknown as PIXI.DisplayObject);
    }
    
    console.log('TileRenderer disposed');
  }

  /**
   * 렌더링 통계
   */
  public getRenderStats(): {
    tilesRendered: number;
    visibleTiles: number;
    memoryUsageMB: number;
  } {
    let visibleTiles = 0;
    let totalPixels = 0;

    for (const sprite of this.tileSprites.values()) {
      if (sprite.visible && sprite.alpha > 0) {
        visibleTiles++;
      }
      
      if (sprite.texture && sprite.texture.baseTexture) {
        totalPixels += sprite.texture.baseTexture.width * sprite.texture.baseTexture.height;
      }
    }

    const memoryUsageMB = (totalPixels * 4) / (1024 * 1024); // RGBA = 4바이트

    return {
      tilesRendered: this.tileSprites.size,
      visibleTiles,
      memoryUsageMB: Math.round(memoryUsageMB * 100) / 100,
    };
  }

  // Getters
  public isFogOfWarEnabled(): boolean {
    return this.fogOfWar;
  }

  public getTileCount(): number {
    return this.tileSprites.size;
  }
}
