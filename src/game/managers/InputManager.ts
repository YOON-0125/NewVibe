import { InputData } from '../GameEngine';

export class InputManager {
  private keys: { [key: string]: boolean } = {};
  private touchActive: boolean = false;
  private lastTouchPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 키보드 이벤트
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // 터치 이벤트는 GameCanvas 컴포넌트에서 직접 처리
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true;
    
    // ESC 키로 일시정지
    if (event.code === 'Escape') {
      // 일시정지 로직은 상위에서 처리
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
  }

  isKeyPressed(keyCode: string): boolean {
    return this.keys[keyCode] || false;
  }

  processInput(): InputData[] {
    const inputs: InputData[] = [];
    
    // WASD 키로 이동 (데스크탑 지원)
    if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) {
      inputs.push({ type: 'move', x: 0, y: -1 });
    }
    if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) {
      inputs.push({ type: 'move', x: 0, y: 1 });
    }
    if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) {
      inputs.push({ type: 'move', x: -1, y: 0 });
    }
    if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) {
      inputs.push({ type: 'move', x: 1, y: 0 });
    }
    
    return inputs;
  }

  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}