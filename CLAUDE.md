# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 의존성 설치 (Playwright 테스트용)
npm install
npx playwright install chromium

# 전체 테스트 실행
npm test

# 단일 테스트 실행
npx playwright test --grep "할 일 추가"
```

## Architecture

단일 파일(`index.html`) 앱으로, 외부 빌드 도구 없이 브라우저에서 직접 열어 사용한다.

### 데이터 흐름

```
브라우저 (index.html)
  └─ Supabase JS SDK (CDN)
       └─ Supabase REST API
            └─ PostgreSQL (todo_items 테이블)
```

- **상태**: `todos` 배열 (메모리) — DB에서 매 조작마다 재조회(`loadTodos()`)
- **렌더링**: `render()` 호출 시 `#todoList` 전체 재생성 (가상 DOM 없음)
- **필터**: `filter` 변수(`all` / `active` / `done`)로 렌더링 시점에 클라이언트 필터링
- **로딩**: 조회 중 스켈레톤 UI 표시, 쓰기 중 입력/버튼 비활성화(`busy` 플래그)

### Supabase 연결 정보

| 항목 | 값 |
|---|---|
| 프로젝트 ID | `obayfbvbxlhyzimcbdgg` |
| URL | `https://obayfbvbxlhyzimcbdgg.supabase.co` |
| 인증 방식 | anon key (RLS: 익명 전체 허용) |

### DB 스키마 (`todo_items`)

```sql
id         uuid        PRIMARY KEY DEFAULT gen_random_uuid()
text       text        NOT NULL
done       boolean     NOT NULL DEFAULT false
created_at timestamptz NOT NULL DEFAULT now()
```

조회 시 `created_at DESC` 정렬 (최신 항목이 위).

### 주요 함수

| 함수 | 역할 |
|---|---|
| `loadTodos()` | DB 전체 조회 후 `render()` 호출 |
| `addTodo()` | INSERT → `loadTodos()` |
| `toggleTodo(id, currentDone)` | UPDATE done → `loadTodos()` |
| `deleteTodo(id)` | DELETE → `loadTodos()` |
| `render()` | `todos` + `filter` 기반 DOM 재생성 |

## GitHub

저장소: `https://github.com/jsryu7287/todo-project`  
브랜치: `main` (단일 브랜치)
