import { InputState, Position } from '../../shared/types';
import { KEY_BINDINGS } from '../../shared/constants';

/**
 * 입력 관리 시스템
 * 키보드와 마우스 입력을 처리
 */
export class InputSystem {
  private inputState: InputState;
  private keyListeners: Map<string, () => void> = new Map();
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.inputState = {
      keys: {},
      mouse: {
        position: { x: 0, y: 0 },
        leftButton: false,
        rightButton: false,
      },
    };
  }

  /**
   * 입력 시스템 초기화
   */
  public init(canvas?: HTMLCanvasElement): void {
    this.canvas = canvas || null;
    this.setupEventListeners();
    console.log('InputSystem initialized');
  }

  /**
   * 입력 상태 업데이트
   */
  public update(): void {
    // 현재는 이벤트 기반이므로 업데이트할 내용 없음
    // 필요시 입력 상태 후처리 로직 추가
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 키보드 이벤트
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // 마우스 이벤트
    if (this.canvas) {
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    } else {
      document.addEventListener('mousedown', this.handleMouseDown.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    // 포커스 잃을 때 모든 키 해제
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
  }

  /**
   * 키 다운 이벤트 처리
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const keyCode = event.code;
    
    // 이미 눌린 키는 무시 (키 반복 방지)
    if (this.inputState.keys[keyCode]) {
      return;
    }

    this.inputState.keys[keyCode] = true;

    // 등록된 리스너 호출
    const listener = this.keyListeners.get(keyCode);
    if (listener) {
      listener();
    }

    // 브라우저 기본 동작 방지 (게임 키들에 대해서만)
    if (this.isGameKey(keyCode)) {
      event.preventDefault();
    }
  }

  /**
   * 키 업 이벤트 처리
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const keyCode = event.code;
    this.inputState.keys[keyCode] = false;
  }

  /**
   * 마우스 다운 이벤트 처리
   */
  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // 왼쪽 버튼
      this.inputState.mouse.leftButton = true;
    } else if (event.button === 2) { // 오른쪽 버튼
      this.inputState.mouse.rightButton = true;
    }
  }

  /**
   * 마우스 업 이벤트 처리
   */
  private handleMouseUp(event: MouseEvent): void {
    if (event.button === 0) { // 왼쪽 버튼
      this.inputState.mouse.leftButton = false;
    } else if (event.button === 2) { // 오른쪽 버튼
      this.inputState.mouse.rightButton = false;
    }
  }

  /**
   * 마우스 이동 이벤트 처리
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      this.inputState.mouse.position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    } else {
      this.inputState.mouse.position = {
        x: event.clientX,
        y: event.clientY,
      };
    }
  }

  /**
   * 윈도우 포커스 잃을 때 처리
   */
  private handleWindowBlur(): void {
    // 모든 키 상태 초기화
    this.inputState.keys = {};
    this.inputState.mouse.leftButton = false;
    this.inputState.mouse.rightButton = false;
  }

  /**
   * 게임 키인지 확인
   */
  private isGameKey(keyCode: string): boolean {
    const allGameKeys = [
      ...KEY_BINDINGS.MOVE_UP,
      ...KEY_BINDINGS.MOVE_DOWN,
      ...KEY_BINDINGS.MOVE_LEFT,
      ...KEY_BINDINGS.MOVE_RIGHT,
      ...KEY_BINDINGS.ATTACK,
      ...KEY_BINDINGS.INTERACT,
      ...KEY_BINDINGS.ABILITY_1,
      ...KEY_BINDINGS.ABILITY_2,
      ...KEY_BINDINGS.ABILITY_3,
      ...KEY_BINDINGS.ABILITY_4,
      ...KEY_BINDINGS.INVENTORY,
      ...KEY_BINDINGS.MENU,
      ...KEY_BINDINGS.PAUSE,
    ];

    return allGameKeys.includes(keyCode as any);
  }

  /**
   * 특정 키가 눌려있는지 확인
   */
  public isKeyPressed(keyCode: string): boolean {
    return !!this.inputState.keys[keyCode];
  }

  /**
   * 특정 액션에 대한 키가 눌려있는지 확인
   */
  public isActionPressed(action: keyof typeof KEY_BINDINGS): boolean {
    const keys = KEY_BINDINGS[action];
    return keys.some(key => this.isKeyPressed(key));
  }

  /**
   * 마우스 버튼이 눌려있는지 확인
   */
  public isMouseButtonPressed(button: 'left' | 'right'): boolean {
    return button === 'left' 
      ? this.inputState.mouse.leftButton 
      : this.inputState.mouse.rightButton;
  }

  /**
   * 키 리스너 등록
   */
  public registerKeyListener(keyCode: string, callback: () => void): void {
    this.keyListeners.set(keyCode, callback);
  }

  /**
   * 키 리스너 제거
   */
  public unregisterKeyListener(keyCode: string): void {
    this.keyListeners.delete(keyCode);
  }

  /**
   * 모든 키 리스너 제거
   */
  public clearKeyListeners(): void {
    this.keyListeners.clear();
  }

  /**
   * 입력 시스템 정리
   */
  public dispose(): void {
    // 이벤트 리스너 제거
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('blur', this.handleWindowBlur.bind(this));

    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
      this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
      this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    this.clearKeyListeners();
    console.log('InputSystem disposed');
  }

  // Getters
  public getInputState(): InputState {
    return { ...this.inputState };
  }

  public getMousePosition(): Position {
    return { ...this.inputState.mouse.position };
  }
}
