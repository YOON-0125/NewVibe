# 조선 로그라이크 게임 아키텍처

이 문서는 조선 로그라이크 게임의 전체 아키텍처를 설명합니다.

## 📁 프로젝트 구조

```
src/
├── core/                    # 핵심 게임 로직
│   ├── Game.ts             # 게임 루프, 전체 상태 관리
│   ├── SceneManager.ts     # 씬 전환 (메뉴/게임/전투)
│   │
│   ├── entities/           # 게임 객체들
│   │   ├── Character.ts    # 기본 캐릭터 클래스
│   │   ├── Player.ts       # 플레이어
│   │   ├── Enemy.ts        # 일반 적
│   │   └── Boss.ts         # 보스 (능력 드랍용)
│   │
│   ├── systems/            # 게임 시스템들
│   │   ├── CombatSystem.ts # 전투 로직
│   │   ├── AbilitySystem.ts# 능력 관리/사용
│   │   ├── MapSystem.ts    # 맵 생성/관리
│   │   └── InputSystem.ts  # 입력 처리
│   │
│   └── data/               # 게임 데이터
│       ├── abilities.ts    # 능력 정의
│       └── enemies.ts      # 적 데이터
│
├── renderer/               # PixiJS 렌더링
│   ├── PixiRenderer.ts     # 렌더러 관리
│   ├── SpriteManager.ts    # 스프라이트 로딩/관리
│   └── TileRenderer.ts     # 타일맵 렌더링
│
├── ui/                     # React UI 컴포넌트
│   ├── GameCanvas.tsx      # PixiJS 캔버스
│   ├── HUD.tsx            # 게임 UI
│   ├── AbilityPanel.tsx   # 능력 패널
│   └── MainMenu.tsx       # 메뉴
│
├── shared/                 # 공통 요소
│   ├── types.ts           # 타입 정의
│   ├── constants.ts       # 상수
│   ├── enums.ts          # 열거형
│   └── utils.ts          # 유틸리티
│
├── assets/                # 리소스
│   ├── sprites/
│   ├── tiles/
│   └── sounds/
│
└── App.tsx               # 메인 앱 컴포넌트
```

## 🎯 핵심 게임 컨셉

### 게임 플레이
- **로그라이크**: 절차적 던전 생성, 영구 진행
- **도깨비 능력 흡수**: 보스를 처치하여 고유 능력 획득
- **전략적 성장**: 능력 조합을 통한 플레이 스타일 구축

### 도깨비 보스 타입
1. **화염 도깨비** - 화염 공격, 화상 효과
2. **물의 도깨비** - 치유, 파도 공격, 방어막
3. **대지의 도깨비** - 높은 방어력, 지진 공격
4. **바람의 도깨비** - 빠른 속도, 회피, 출혈
5. **그림자 도깨비** - 은신, 분신, 암살
6. **얼음 도깨비** - 얼림 효과, 범위 제어
7. **번개 도깨비** - 연쇄 공격, 높은 데미지
8. **독의 도깨비** - 지속 피해, 디버프

## 🏗️ 아키텍처 설계 원칙

### 1. 계층 분리
- **Core**: 게임 로직, 비즈니스 규칙
- **Renderer**: 렌더링, 시각적 표현
- **UI**: 사용자 인터페이스, React 컴포넌트
- **Shared**: 공통 타입, 유틸리티, 상수

### 2. 의존성 방향
```
UI → Core ← Renderer
     ↓
   Shared
```

### 3. 데이터 흐름
- **단방향 데이터 플로우**: React 상태 → 게임 로직 → 렌더링
- **이벤트 기반**: 게임 이벤트를 통한 시스템 간 통신
- **불변성**: 상태 변경 시 새 객체 생성

## 🎮 게임 시스템 상세

### Game.ts - 게임 루프
```typescript
class Game {
  - sceneManager: SceneManager
  - inputSystem: InputSystem
  + init(): Promise<void>
  + start(): void
  + stop(): void
  - gameLoop(): void
}
```

### Character 계층구조
```typescript
Character (abstract)
├── Player
├── Enemy
└── Boss
```

### 주요 시스템들

#### CombatSystem
- 데미지 계산
- 전투 로직
- 보스 사망 시 능력 드랍

#### AbilitySystem
- 능력 사용 및 쿨다운 관리
- 상태 효과 시스템
- 토글 능력 관리

#### MapSystem
- 절차적 던전 생성
- 충돌 검사
- 시야 및 안개 관리

## 🎨 렌더링 아키텍처

### PixiJS 구조
```
App Stage
├── Game Container
│   ├── Map Container (타일들)
│   └── Entity Container (캐릭터들)
└── UI Container (React 오버레이)
```

### 렌더링 파이프라인
1. **SpriteManager**: 텍스처 로딩 및 스프라이트 생성
2. **TileRenderer**: 맵 타일 렌더링, 안개 효과
3. **PixiRenderer**: 전체 렌더링 관리, 카메라 제어

## 📱 UI 아키텍처

### React 컴포넌트 구조
```
App
├── MainMenu
├── GameCanvas (PixiJS)
├── HUD
└── AbilityPanel
```

### 상태 관리
- **React State**: UI 상태 관리
- **Game Instance**: 게임 로직 상태
- **Props Drilling**: 간단한 상태 전달

## 🔧 기술 스택

### 프론트엔드
- **React 19.1.1**: UI 프레임워크
- **TypeScript 4.9.5**: 타입 안전성
- **PixiJS 7.4.3**: 2D 렌더링 엔진
- **Tailwind CSS**: 스타일링

### 개발 도구
- **React Scripts**: 빌드 도구
- **Prettier**: 코드 포맷팅
- **ESLint**: 코드 품질

## 📋 개발 우선순위

### Phase 1: 기본 게임플레이 (완료)
- [x] 프로젝트 구조 설정
- [x] 기본 엔티티 시스템
- [x] 전투 시스템
- [x] 능력 시스템
- [x] 맵 생성
- [x] 기본 렌더링

### Phase 2: 게임 확장 (진행 중)
- [ ] 실제 게임 루프 연결
- [ ] 플레이어 이동 및 상호작용
- [ ] AI 시스템
- [ ] 사운드 시스템
- [ ] 저장/로드 시스템

### Phase 3: 콘텐츠 확장
- [ ] 더 많은 적 타입
- [ ] 아이템 시스템
- [ ] 퀘스트 시스템
- [ ] 밸런스 조정

### Phase 4: 폴리싱
- [ ] 애니메이션 시스템
- [ ] 파티클 효과
- [ ] UI/UX 개선
- [ ] 성능 최적화

## 🔒 타입 안전성

### TypeScript 설정
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### 주요 타입들
- `Position`: 좌표 정보
- `Stats`: 캐릭터 스탯
- `Ability`: 능력 정의
- `GameMap`: 맵 데이터
- `Scene`: 게임 씬

## 🎨 코딩 컨벤션

### 파일 네이밍
- **Classes**: PascalCase (e.g., `Player.ts`)
- **Components**: PascalCase (e.g., `GameCanvas.tsx`)
- **Types/Interfaces**: PascalCase (e.g., `Position`)
- **Enums**: PascalCase (e.g., `BossType`)

### 코드 스타일
- **들여쓰기**: 2 spaces
- **문자열**: 작은따옴표 (`'`)
- **세미콜론**: 항상 사용
- **후행 쉼표**: 모든 다중 줄에서 사용

### PixiJS 타입 이슈 해결
```typescript
// PixiJS 객체를 addChild할 때 타입 단언 사용
stage.addChild(graphics as unknown as PIXI.DisplayObject);
```

## 🚀 성능 고려사항

### 렌더링 최적화
- **Object Pooling**: 스프라이트 재사용
- **Culling**: 화면 밖 객체 렌더링 스킵
- **Batching**: 동일한 텍스처의 객체들 배치 렌더링

### 메모리 관리
- **텍스처 캐싱**: 중복 로딩 방지
- **적절한 해제**: 사용하지 않는 리소스 정리
- **가비지 컬렉션**: 임시 객체 최소화

## 🐛 디버깅

### 개발 모드 기능
- **Debug Overlay**: FPS, 메모리 사용량 표시
- **Console Logging**: 상세한 게임 로그
- **Hot Reload**: 코드 변경 시 자동 리로드

### 성능 모니터링
- **PixiJS Stats**: 렌더링 통계
- **Memory Usage**: 텍스처 메모리 사용량
- **Frame Rate**: 프레임 레이트 모니터링

## 📚 참고 자료

### 기술 문서
- [PixiJS Documentation](https://pixijs.download/release/docs/index.html)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 게임 개발
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Real-Time Rendering](https://www.realtimerendering.com/)

---

*최종 업데이트: 2025년 7월 29일*
