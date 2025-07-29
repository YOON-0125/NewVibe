import { SceneManager } from './SceneManager';
import { InputSystem } from './systems/InputSystem';
import { MapSystem } from './systems/MapSystem';
import { PixiRenderer } from '../renderer/PixiRenderer';

/**
 * 게임의 메인 클래스
 * 게임 루프, 전체 상태 관리를 담당
 */
export class Game {
  private sceneManager!: SceneManager; // init()에서 초기화됨
  private inputSystem: InputSystem;
  private mapSystem: MapSystem;
  private renderer: PixiRenderer | null = null;
  private isRunning: boolean = false;
  private deltaTime: number = 0;
  private lastTime: number = 0;

  constructor() {
    this.inputSystem = new InputSystem();
    this.mapSystem = new MapSystem();
    // SceneManager는 init에서 생성
  }

  /**
   * 게임 초기화
   */
  public async init(canvas?: HTMLCanvasElement): Promise<void> {
    // 렌더러 생성 (캔버스가 있을 때만)
    if (canvas) {
      this.renderer = new PixiRenderer(canvas);
    } else {
      throw new Error('Canvas is required for game initialization');
    }
    
    // SceneManager 생성 (이제 renderer가 준비됨)
    this.sceneManager = new SceneManager(
      this.inputSystem,
      this.mapSystem,
      this.renderer
    );
    
    // 입력 시스템 초기화 (캔버스 전달)
    this.inputSystem.init(canvas);
    
    // 씬 매니저 초기화
    await this.sceneManager.init();
    
    console.log('Game initialized');
  }

  /**
   * 게임 시작
   */
  public start(): void {
    this.isRunning = true;
    this.lastTime = Date.now();
    this.gameLoop();
    console.log('Game started');
  }

  /**
   * 게임 정지
   */
  public stop(): void {
    this.isRunning = false;
    console.log('Game stopped');
  }

  /**
   * 게임 루프
   */
  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // 업데이트
    this.update(this.deltaTime);

    // 렌더링
    this.render();

    // 다음 프레임 요청
    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * 게임 상태 업데이트
   */
  private update(deltaTime: number): void {
    this.inputSystem.update();
    this.sceneManager.update(deltaTime);
  }

  /**
   * 렌더링
   */
  private render(): void {
    this.sceneManager.render();
  }

  /**
   * 게임 정리
   */
  public dispose(): void {
    this.stop();
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.sceneManager.dispose();
    this.inputSystem.dispose();
    
    console.log('Game disposed');
  }

  // Getters
  public getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  public getInputSystem(): InputSystem {
    return this.inputSystem;
  }

  public getMapSystem(): MapSystem {
    return this.mapSystem;
  }

  public getRenderer(): PixiRenderer | null {
    return this.renderer;
  }
}
