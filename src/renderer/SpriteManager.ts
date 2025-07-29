import * as PIXI from 'pixi.js';
import { MAP_CONFIG } from '../shared/constants';

/**
 * 스프라이트 매니저
 * 텍스처 로딩, 스프라이트 생성 및 관리를 담당
 */
export class SpriteManager {
  private textures: Map<string, PIXI.Texture> = new Map();
  private spritesheets: Map<string, PIXI.Spritesheet> = new Map();
  private loader: any; // PIXI.Loader 대신 임시
  private isLoaded: boolean = false;
  private app: PIXI.Application;

  constructor(app: PIXI.Application) {
    this.app = app;
    // this.loader = PIXI.Loader.shared; // v7에서 제거됨
    console.log('SpriteManager initialized');
  }

  /**
   * 리소스 로딩
   */
  public async loadResources(): Promise<void> {
    // PixiJS v7 대응 - 로더 대신 기본 텍스처만 생성
    this.createDefaultTextures();
    this.isLoaded = true;
    console.log('SpriteManager resources loaded (default textures only)');
  }

  /**
   * 기본 텍스처 생성 (이미지 파일이 없을 때 사용)
   */
  private createDefaultTextures(): void {
    // 타일 텍스처들
    this.createTileTexture('floor', 0x8B4513);
    this.createTileTexture('wall', 0x696969);
    this.createTileTexture('door', 0x654321);
    this.createTileTexture('stairs', 0xFFD700);
    this.createTileTexture('chest', 0xDC143C);

    // 캐릭터 텍스처들
    this.createEntityTexture('player', 0x00FF00, 'circle');
    this.createEntityTexture('enemy', 0xFF0000, 'circle');
    this.createEntityTexture('boss', 0xFF6600, 'circle');
    this.createEntityTexture('npc', 0x0066FF, 'circle');

    // 도깨비 보스들
    this.createEntityTexture('fire_dokkaebi', 0xFF4500, 'circle');
    this.createEntityTexture('water_dokkaebi', 0x1E90FF, 'circle');
    this.createEntityTexture('earth_dokkaebi', 0x8B4513, 'circle');
    this.createEntityTexture('wind_dokkaebi', 0x90EE90, 'circle');
    this.createEntityTexture('shadow_dokkaebi', 0x4B0082, 'circle');
    this.createEntityTexture('ice_dokkaebi', 0xB0E0E6, 'circle');
    this.createEntityTexture('lightning_dokkaebi', 0xFFFF00, 'circle');
    this.createEntityTexture('poison_dokkaebi', 0x9ACD32, 'circle');

    // 적 타입별 텍스처
    this.createEntityTexture('goblin', 0x32CD32, 'square');
    this.createEntityTexture('goblin_warrior', 0x228B22, 'square');
    this.createEntityTexture('orc', 0x8B0000, 'square');
    this.createEntityTexture('orc_shaman', 0x4B0082, 'square');
    this.createEntityTexture('skeleton', 0xF5F5DC, 'square');
    this.createEntityTexture('skeleton_archer', 0xDCDCDC, 'square');
    this.createEntityTexture('zombie', 0x556B2F, 'square');
    this.createEntityTexture('poison_zombie', 0x9ACD32, 'square');
    this.createEntityTexture('ghost', 0xE6E6FA, 'circle');
    this.createEntityTexture('wraith', 0x8B008B, 'circle');

    // 이펙트 텍스처들
    this.createEffectTexture('fire_effect', 0xFF4500);
    this.createEffectTexture('water_effect', 0x1E90FF);
    this.createEffectTexture('lightning_effect', 0xFFFF00);
    this.createEffectTexture('heal_effect', 0x00FF00);
    this.createEffectTexture('damage_effect', 0xFF0000);
  }

  /**
   * 타일 텍스처 생성
   */
  private createTileTexture(name: string, color: number): void {
    // PixiJS v7에서는 기본 색상 텍스처 사용
    const texture = PIXI.Texture.WHITE.clone();
    
    // 색상을 통해 구분 가능하도록 저장
    (texture as any).tintColor = color;
    this.textures.set(name, texture);
    
    console.log(`Created tile texture: ${name} with color: 0x${color.toString(16)}`);
  }

  /**
   * 엔티티 텍스처 생성
   */
  private createEntityTexture(name: string, color: number, shape: 'circle' | 'square' = 'circle'): void {
    const graphics = new PIXI.Graphics();
    const size = MAP_CONFIG.TILE_SIZE;
    const radius = size * 0.4;

    graphics.beginFill(color);

    if (shape === 'circle') {
      graphics.drawCircle(size / 2, size / 2, radius);
    } else {
      const rectSize = radius * 1.4;
      graphics.drawRect(
        (size - rectSize) / 2,
        (size - rectSize) / 2,
        rectSize,
        rectSize
      );
    }

    graphics.endFill();

    // 외곽선 추가
    graphics.lineStyle(2, 0x000000, 0.8);
    if (shape === 'circle') {
      graphics.drawCircle(size / 2, size / 2, radius);
    } else {
      const rectSize = radius * 1.4;
      graphics.drawRect(
        (size - rectSize) / 2,
        (size - rectSize) / 2,
        rectSize,
        rectSize
      );
    }

    const texture = PIXI.RenderTexture.create({
      width: size,
      height: size,
    });

    this.app.renderer.render(graphics as unknown as PIXI.DisplayObject, {
      renderTexture: texture,
    });

    this.textures.set(name, texture);
  }

  /**
   * 이펙트 텍스처 생성
   */
  private createEffectTexture(name: string, color: number): void {
    const graphics = new PIXI.Graphics();
    const size = MAP_CONFIG.TILE_SIZE;

    // 반짝이는 효과를 위한 별 모양
    graphics.beginFill(color, 0.8);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.3;
    const innerRadius = size * 0.15;
    const spikes = 5;

    graphics.moveTo(centerX, centerY - outerRadius);

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
      const y = centerY + Math.sin(angle - Math.PI / 2) * radius;
      graphics.lineTo(x, y);
    }

    graphics.closePath();
    graphics.endFill();

    const texture = PIXI.RenderTexture.create({
      width: size,
      height: size,
    });

    this.app.renderer.render(graphics as unknown as PIXI.DisplayObject, {
      renderTexture: texture,
    });

    this.textures.set(name, texture);
  }

  /**
   * 로딩된 리소스 처리 - PixiJS v7에서 비활성화
   */
  private processLoadedResources(): void {
    console.log('processLoadedResources: v7에서는 자동 처리됨');
  }

  /**
   * 텍스처 가져오기
   */
  public getTexture(name: string): PIXI.Texture | null {
    return this.textures.get(name) || null;
  }

  /**
   * 스프라이트 생성
   */
  public createSprite(textureName: string): PIXI.Sprite | null {
    const texture = this.getTexture(textureName);
    if (!texture) {
      console.warn(`Texture not found: ${textureName}`);
      return null;
    }

    return new PIXI.Sprite(texture);
  }

  /**
   * 애니메이션 스프라이트 생성
   */
  public createAnimatedSprite(textureNames: string[]): PIXI.AnimatedSprite | null {
    const textures: PIXI.Texture[] = [];

    for (const name of textureNames) {
      const texture = this.getTexture(name);
      if (texture) {
        textures.push(texture);
      }
    }

    if (textures.length === 0) {
      console.warn(`No textures found for animation: ${textureNames}`);
      return null;
    }

    return new PIXI.AnimatedSprite(textures);
  }

  /**
   * 스프라이트시트에서 애니메이션 생성
   */
  public createAnimationFromSpritesheet(
    spritesheetName: string,
    animationPrefix: string
  ): PIXI.AnimatedSprite | null {
    const spritesheet = this.spritesheets.get(spritesheetName);
    if (!spritesheet) {
      console.warn(`Spritesheet not found: ${spritesheetName}`);
      return null;
    }

    const textures: PIXI.Texture[] = [];
    for (const textureName of Object.keys(spritesheet.textures)) {
      if (textureName.startsWith(animationPrefix)) {
        textures.push(spritesheet.textures[textureName]);
      }
    }

    if (textures.length === 0) {
      console.warn(`No animation frames found for: ${animationPrefix}`);
      return null;
    }

    return new PIXI.AnimatedSprite(textures);
  }

  /**
   * 텍스처 캐시 정리
   */
  public clearCache(): void {
    for (const texture of this.textures.values()) {
      if (texture.baseTexture) {
        texture.baseTexture.destroy();
      }
    }
    this.textures.clear();
    this.spritesheets.clear();
  }

  /**
   * 텍스처 미리 로딩 (성능 최적화)
   */
  public preloadTextures(textureNames: string[]): void {
    for (const name of textureNames) {
      const texture = this.getTexture(name);
      if (texture && texture.baseTexture) {
        // PixiJS v7에서는 자동으로 최적화됨
        console.log(`Preloaded texture: ${name}`);
      }
    }
  }

  /**
   * 동적 텍스처 생성 (런타임에 그래픽 생성)
   */
  public createDynamicTexture(
    name: string,
    width: number,
    height: number,
    drawFunction: (graphics: PIXI.Graphics) => void
  ): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    drawFunction(graphics);

    const texture = PIXI.RenderTexture.create({ width, height });
    this.app.renderer.render(graphics as unknown as PIXI.DisplayObject, {
      renderTexture: texture,
    });

    this.textures.set(name, texture);
    return texture;
  }

  /**
   * 텍스처 메모리 사용량 확인
   */
  public getMemoryUsage(): {
    textureCount: number;
    spritesheetCount: number;
    estimatedMemoryMB: number;
  } {
    let totalPixels = 0;

    for (const texture of this.textures.values()) {
      if (texture.baseTexture) {
        totalPixels += texture.baseTexture.width * texture.baseTexture.height;
      }
    }

    // 대략적인 메모리 사용량 계산 (RGBA = 4바이트)
    const estimatedMemoryMB = (totalPixels * 4) / (1024 * 1024);

    return {
      textureCount: this.textures.size,
      spritesheetCount: this.spritesheets.size,
      estimatedMemoryMB: Math.round(estimatedMemoryMB * 100) / 100,
    };
  }

  // Getters
  public isResourcesLoaded(): boolean {
    return this.isLoaded;
  }

  public getAvailableTextures(): string[] {
    return Array.from(this.textures.keys());
  }

  public getAvailableSpritesheets(): string[] {
    return Array.from(this.spritesheets.keys());
  }
}
