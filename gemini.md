TypeScript 파일은 항상 Prettier로 포맷해야 합니다.

[PixiJS 타입 오류 방지 규칙]

프로젝트에서 PixiJS v7을 사용하며,

TypeScript에서 Graphics, Sprite, Container 등의 객체를 stage.addChild() 또는
유사한 함수(addChild, removeChild)에 전달할 때 타입 오류(TS2345)가 발생할 수 있음.

이 오류는 PixiJS의 타입 정의 문제로, 런타임 동작에는 문제가 없음.

따라서 아래와 같이 **타입 단언(Type Assertion)**을 반드시 사용해야 함:

tsx
app.stage.addChild(graphics as unknown as PIXI.DisplayObject);
다른 PixiJS 객체(sprite, container 등)도 동일한 방식으로 단언문을 붙여 사용한다.

.d.ts 글로벌 타입 패치로는 이 문제를 해결할 수 없으므로
타입 단언 사용을 프로젝트 표준 규칙으로 지정한다.

코드 작성AI 를 확인할 필요가 있으므로 코드를 수정할 때는 삭제할 곳은 주석처리 후 (claude) 라고 기재 후 삭제.
코드를 삽입, 추가할 때는 주석을 달아 (Gemini) 라고 기재 바람.
