/**
 * 유틸리티 함수들
 */

import { Position } from './types';

/**
 * 수학 관련 유틸리티
 */
export const MathUtils = {
  /**
   * 두 점 사이의 거리 계산
   */
  distance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * 맨하탄 거리 계산
   */
  manhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  },

  /**
   * 각도 계산 (라디안)
   */
  angle(from: Position, to: Position): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  },

  /**
   * 값을 특정 범위로 제한
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * 선형 보간
   */
  lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  },

  /**
   * 랜덤 정수 생성 (min 이상 max 미만)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  /**
   * 랜덤 실수 생성
   */
  randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  },

  /**
   * 확률 체크 (0~1)
   */
  chance(probability: number): boolean {
    return Math.random() < probability;
  },

  /**
   * 배열에서 랜덤 요소 선택
   */
  randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * 가중치 기반 랜덤 선택
   */
  weightedChoice<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  },
};

/**
 * 배열 관련 유틸리티
 */
export const ArrayUtils = {
  /**
   * 배열 섞기 (Fisher-Yates 알고리즘)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * 배열에서 중복 제거
   */
  unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  },

  /**
   * 배열을 청크로 분할
   */
  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
};

/**
 * 문자열 관련 유틸리티
 */
export const StringUtils = {
  /**
   * 첫 글자 대문자로 변환
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 카멜케이스를 kebab-case로 변환
   */
  camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * 문자열을 숫자로 포맷팅 (천 단위 구분)
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  },

  /**
   * 시간을 문자열로 포맷팅 (mm:ss)
   */
  formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },
};

/**
 * 객체 관련 유틸리티
 */
export const ObjectUtils = {
  /**
   * 깊은 복사
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }
    
    if (typeof obj === 'object') {
      const cloned = {} as { [key: string]: any };
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone((obj as any)[key]);
      });
      return cloned as T;
    }
    
    return obj;
  },

  /**
   * 두 객체 병합 (깊은 병합)
   */
  deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = (target as any)[key];
        
        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          (result as any)[key] = this.deepMerge(targetValue, sourceValue);
        } else {
          (result as any)[key] = sourceValue;
        }
      }
    }
    
    return result;
  },
};

/**
 * 타이머 관련 유틸리티
 */
export const TimerUtils = {
  /**
   * 딜레이 함수
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 디바운스 함수
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * 스로틀 함수
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastExecution = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecution >= delay) {
        func(...args);
        lastExecution = now;
      }
    };
  },
};

/**
 * 로컬 스토리지 유틸리티
 */
export const StorageUtils = {
  /**
   * 로컬 스토리지에 저장
   */
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  /**
   * 로컬 스토리지에서 불러오기
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue || null;
    }
  },

  /**
   * 로컬 스토리지에서 제거
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  /**
   * 로컬 스토리지 비우기
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },
};

/**
 * 색상 관련 유틸리티
 */
export const ColorUtils = {
  /**
   * 16진수 색상을 RGB로 변환
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * RGB를 16진수 색상으로 변환
   */
  rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  },

  /**
   * 색상 보간
   */
  lerpColor(color1: string, color2: string, factor: number): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(MathUtils.lerp(rgb1.r, rgb2.r, factor));
    const g = Math.round(MathUtils.lerp(rgb1.g, rgb2.g, factor));
    const b = Math.round(MathUtils.lerp(rgb1.b, rgb2.b, factor));
    
    return this.rgbToHex(r, g, b);
  },
};
