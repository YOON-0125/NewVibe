/**
 * @file LocalStorage 관련 유틸리티 함수 모음
 *       - 게임의 영구 데이터를 안전하게 저장하고 불러옵니다.
 */

import { ArtifactID } from "../data/artifacts";

// LocalStorage에서 사용할 키(key)를 상수로 정의하여 오타를 방지합니다.
const OWNED_ARTIFACTS_KEY = 'newvibe_owned_artifacts';

/**
 * 플레이어가 보유한 유물 ID 목록을 LocalStorage에 저장합니다.
 * @param ids - 저장할 유물 ID의 배열
 */
export function saveOwnedArtifacts(ids: ArtifactID[]): void {
  try {
    // 유물 ID 배열을 JSON 문자열로 변환하여 저장합니다.
    const jsonValue = JSON.stringify(ids);
    localStorage.setItem(OWNED_ARTIFACTS_KEY, jsonValue);
  } catch (error) {
    console.error("Error saving owned artifacts to localStorage:", error);
  }
}

/**
 * LocalStorage에서 플레이어가 보유한 유물 ID 목록을 불러옵니다.
 * @returns 저장된 유물 ID 배열. 저장된 값이 없거나 오류 발생 시 빈 배열을 반환합니다.
 */
export function loadOwnedArtifacts(): ArtifactID[] {
  try {
    const jsonValue = localStorage.getItem(OWNED_ARTIFACTS_KEY);
    if (jsonValue) {
      // JSON 문자열을 파싱하여 유물 ID 배열로 변환합니다.
      const parsedValue = JSON.parse(jsonValue);
      // 혹시 모를 타입 오류에 대비하여 배열인지 확인합니다.
      if (Array.isArray(parsedValue)) {
        return parsedValue as ArtifactID[];
      }
    }
  } catch (error) {
    console.error("Error loading owned artifacts from localStorage:", error);
  }
  // 값이 없거나 오류가 발생하면 빈 배열을 반환합니다.
  return [];
}
