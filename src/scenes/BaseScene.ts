/**
 * 모든 씬이 구현해야 하는 기본 인터페이스
 */
export interface IScene {
  /**
   * 씬 초기화
   */
  init(): Promise<void>;

  /**
   * 씬 진입 시 호출
   */
  enter(): void;

  /**
   * 씬 업데이트
   */
  update(deltaTime: number): void;

  /**
   * 씬 렌더링
   */
  render(): void;

  /**
   * 씬 종료 시 호출
   */
  exit(): void;

  /**
   * 씬 정리
   */
  dispose(): void;
}

/**
 * 기본 씬 추상 클래스
 */
export abstract class BaseScene implements IScene {
  protected isActive: boolean = false;
  protected isInitialized: boolean = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    
    await this.onInit();
    this.isInitialized = true;
    console.log(`${this.constructor.name} initialized`);
  }

  public enter(): void {
    this.isActive = true;
    this.onEnter();
    console.log(`${this.constructor.name} entered`);
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return;
    this.onUpdate(deltaTime);
  }

  public render(): void {
    if (!this.isActive) return;
    this.onRender();
  }

  public exit(): void {
    this.isActive = false;
    this.onExit();
    console.log(`${this.constructor.name} exited`);
  }

  public dispose(): void {
    this.isActive = false;
    this.onDispose();
    console.log(`${this.constructor.name} disposed`);
  }

  // 서브클래스에서 구현할 추상 메서드들
  protected abstract onInit(): Promise<void>;
  protected abstract onEnter(): void;
  protected abstract onUpdate(deltaTime: number): void;
  protected abstract onRender(): void;
  protected abstract onExit(): void;
  protected abstract onDispose(): void;

  // Getters
  public getIsActive(): boolean {
    return this.isActive;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}
