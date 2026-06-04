# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 의존성 설치 (Playwright)
npm install
npx playwright install chromium

# 전체 테스트 실행
npm test

# 단일 테스트 실행
npx playwright test --grep "할 일 추가"
```

## Architecture

단일 파일(`index.html`) 앱으로, 외부 라이브러리 없이 순수 HTML/CSS/JS로 구성됩니다.

- **상태**: `todos` 배열 (메모리) + `localStorage` (영속)
- **렌더링**: `render()` 호출 시 `#todoList` 전체를 재생성 (가상 DOM 없음)
- **필터**: `filter` 변수(`all` / `active` / `done`)로 렌더링 시점에 필터링
- **테스트**: `todo.test.js` — Playwright E2E, `file://` 프로토콜로 index.html 직접 로드
