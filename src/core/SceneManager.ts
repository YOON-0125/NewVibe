import { Scene } from '../shared/types';
import { IScene } from '../scenes/BaseScene';
import { GameScene } from '../scenes/GameScene';
import { Player } from './entities/Player'; // 추가
import { InputSystem } from './systems/InputSystem';
import { MapSystem } from './systems/MapSystem';
import { PixiRenderer } from '../renderer/PixiRenderer';

/**
 * 씬 관리자
 * 메뉴/게임/전투 씬 전환을 담당
 */
export class SceneManager {
  private currentScene: Scene = Scene.Game; // 테스트용으로 게임씬으로 시작
  private scenes: Map<Scene, IScene> = new Map();
  private inputSystem: InputSystem;
  private mapSystem: MapSystem;
  private renderer: PixiRenderer;

  constructor(
    inputSystem: InputSystem,
    mapSystem: MapSystem,
    renderer: PixiRenderer
  ) {
    this.inputSystem = inputSystem;
    this.mapSystem = mapSystem;
    this.renderer = renderer;
  }

  /**
   * 씬 매니저 초기화
   */
  public async init(): Promise<void> {
    // GameScene 생성
    const gameScene = new GameScene(
      this.inputSystem,
      this.mapSystem,
      this.renderer
    );
    
    this.scenes.set(Scene.Game, gameScene);
    
    // 현재 씬 초기화
    const currentSceneInstance = this.scenes.get(this.currentScene);
    if (currentSceneInstance) {
      await currentSceneInstance.init();
      currentSceneInstance.enter();
    }
    
    console.log('SceneManager initialized with GameScene');
  }

  /**
   * 씬 전환
   */
  public changeScene(newScene: Scene): void {
    console.log(`Changing scene from ${this.currentScene} to ${newScene}`);
    
    // 현재 씬 정리
    this.exitCurrentScene();
    
    // 새 씬으로 전환
    this.currentScene = newScene;
    this.enterNewScene();
  }

  /**
   * 현재 씬 업데이트
   */
  public update(deltaTime: number): void {
    const scene = this.scenes.get(this.currentScene);
    if (scene) {
      scene.update(deltaTime);
    }
  }

  /**
   * 현재 씬 렌더링
   */
  public render(): void {
    const scene = this.scenes.get(this.currentScene);
    if (scene) {
      scene.render();
    }
  }

  /**
   * 현재 씬 종료 처리
   */
  private exitCurrentScene(): void {
    const scene = this.scenes.get(this.currentScene);
    if (scene) {
      scene.exit();
    }
  }

  /**
   * 새 씬 진입 처리
   */
  private enterNewScene(): void {
    const scene = this.scenes.get(this.currentScene);
    if (scene) {
      scene.enter();
    }
  }

  /**
   * 씬 매니저 정리
   */
  public dispose(): void {
    for (const scene of this.scenes.values()) {
      scene.dispose();
    }
    this.scenes.clear();
    console.log('SceneManager disposed');
  }

  // Getters
  public getCurrentScene(): Scene {
    return this.currentScene;
  }

  public getCurrentSceneInstance(): IScene | undefined {
    return this.scenes.get(this.currentScene);
  }

  /**
   * 현재 플레이어 가져오기 (GameScene에서)
   */
  public getCurrentPlayer(): Player | null {
    const gameScene = this.scenes.get(Scene.Game) as GameScene;
    return gameScene?.getPlayer() || null;
  }
}
