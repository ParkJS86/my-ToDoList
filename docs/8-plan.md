# my-ToDoList 실행 계획 (WBS)

## 버전 이력
| 버전 | 요약 내용 | 근거/출처 | 날짜 |
|---|---|---|---|
| 1.0 | 최초 작성: DB/백엔드/프론트엔드 Task 분할, Task별 수행작업/완료조건/선행Task 정의 | 1~7번 docs 문서 전체, schema.sql | 2026-08-26 |
| 1.1 | 완료 조건 표시 규칙 추가(미실행 `[ ]`/정상완료 🟢/실패 🔴), DB-1 완료 항목을 🟢로 표시 | 사용자 요청 | 2026-08-26 |
| 1.2 | DB-2 수행 완료: `my_todolist` DB 생성, 마이그레이션 3개 파일 적용, `backend/.env` 접속 문자열을 `my_todolist`로 갱신, 완료 항목 🟢 표시 | DB-2 실행 결과 | 2026-08-26 |
| 1.3 | DB-3 수행 완료: `backend/src/migrations/seed.sql` 작성(pgcrypto bcrypt 해시, ON CONFLICT DO NOTHING), Admin 계정 1건·기본 Category 1건 생성 및 재실행 idempotency 확인, 완료 항목 🟢 표시 | DB-3 실행 결과 | 2026-08-26 |
| 1.4 | BE-1 수행 완료: package.json/디렉토리 뼈대/.env.example 생성, npm install 성공, 검증 테스트 27건 작성 및 전체 통과(node --test 자동탐색 방식으로 test 스크립트 수정), 완료 항목 🟢 표시 | BE-1 실행 결과 | 2026-08-26 |
| 1.5 | BE-2 수행 완료: `db/pool.js`(pg.Pool) 생성, `GET /health`(SELECT 1 확인) 구현, 정상/DB장애 양쪽 응답 확인, 완료 항목 🟢 표시 | BE-2 실행 결과 | 2026-08-27 |
| 1.6 | BE-3 로그 방식 변경: 개발환경 콘솔 / 운영환경 파일(logs/app_YYYY-MM-DD.log, 날짜별) 분기로 수정 | 사용자 요청 | 2026-08-27 |
| 1.7 | BE-3 수행 완료: `middlewares/requestLogger.js`, `middlewares/errorHandler.js` 구현, `app.js`에 express.json → requestLogger → routes → 404 catch-all → errorHandler 순서 등록, 검증 테스트 11건 작성 및 기존 27건 포함 전체 38건 통과, 완료 항목 🟢 표시 | BE-3 실행 결과 | 2026-08-27 |
| 1.8 | BE-4 수행 완료: `utils/jwt.js`, `queries/user.queries.js`, `services/auth.service.js`, `routes/auth.routes.js` 구현(signup/login/refresh/logout), 쿠키 파싱은 직접 구현(cookie-parser 미도입), 검증 테스트 신규 작성 및 기존 포함 전체 53건 통과, 완료 항목 🟢 표시 | BE-4 실행 결과 | 2026-08-27 |
| 1.9 | BE-5 수행 완료: `middlewares/auth.middleware.js`(Bearer 토큰 검증, req.user 설정), `middlewares/admin.middleware.js`(role===Admin 검증) 구현, 검증 테스트 신규 작성 및 기존 포함 전체 62건 통과, 완료 항목 🟢 표시 | BE-5 실행 결과 | 2026-08-27 |
| 1.10 | BE-6 수행 완료: `queries/user.queries.js`에 updateUser/findAllUsers 추가, `utils/userDto.js` 공용화(auth.service.js 리팩터링), `services/user.service.js`/`routes/user.routes.js`(PATCH /users/me, GET /users) 구현, 검증 테스트 신규 작성 및 기존 포함 전체 71건 통과, 완료 항목 🟢 표시 | BE-6 실행 결과 | 2026-08-27 |
| 1.11 | BE-7 수행 완료: `queries/category.queries.js`, `utils/categoryDto.js`, `services/category.service.js`(삭제 시 pool.connect() 트랜잭션으로 기본 Category 재할당), `routes/category.routes.js`(GET/POST/PATCH/DELETE /categories) 구현, 검증 테스트 신규 작성 및 기존 포함 전체 89건 통과, 완료 항목 🟢 표시 | BE-7 실행 결과 | 2026-08-27 |
| 1.12 | BE-8 수행 완료: `utils/todoStatus.js`(상태 파생), `utils/todoDto.js`, `queries/todo.queries.js`, `services/todo.service.js`, `routes/todo.routes.js`(POST/GET/PATCH/DELETE /todos) 구현. 테스트 중 `toYMD` 타임존 버그(KST 환경에서 DB DATE 값이 하루 당겨짐, 3개 파일에 중복 정의) 발견해 로컬 타임존 기준 계산으로 수정. 검증 테스트 신규 작성 및 기존 포함 전체 117건 통과, 완료 항목 🟢 표시 | BE-8 실행 결과 | 2026-08-27 |
| 1.13 | BE-9 수행 완료: BE-4~8에서 이미 작성된 테스트(be4/be6/be7/be8/todoStatus)가 5개 완료조건을 전부 커버함을 확인, 신규 코드 없이 전체 117건 재실행 통과 확인, 완료 항목 🟢 표시(회원정보 타인수정 403은 /users/me가 항상 본인만 대상이라 설계상 해당 없음으로 명시) | BE-9 실행 결과 | 2026-08-27 |
| 1.14 | FE-1 수행 완료: Vite React19+TS 프로젝트 생성(`frontend/`), zustand/@tanstack/react-query/react-router-dom 설치, FSD 6개 디렉토리(app/pages/widgets/features/entities/shared) 스켈레톤 생성, `.env.example`(VITE_API_BASE_URL) 작성, 스캐폴딩 검증 테스트 17건 통과(tsc --noEmit/npm run build 포함), `npm run dev` 정상 기동 확인, 완료 항목 🟢 표시 | FE-1 실행 결과 | 2026-08-27 |
| 1.15 | FE-2 수행 완료: `shared/config/env.ts`, `shared/lib/{logger,date}.ts`, `shared/api/httpClient.ts`(토큰 getter/401 핸들러 주입식, FSD 레이어 위반 회피), `shared/ui/{Button,Input,Modal}.tsx`(9-style.md 반영), `app/styles/tokens.css`(전역 다크 테마 적용) 구현. 검증 중 tokens.css가 body에 실제 적용 안 되던 버그(import 순서/전역 배경 미지정) 발견해 수정, 브라우저 스크린샷+컴퓨티드 스타일로 확인. 검증 테스트 29건 통과, 완료 항목 🟢 표시 | FE-2 실행 결과 | 2026-08-27 |
| 1.16 | FE-3 수행 완료: `entities/session/model/authStore.ts`(Zustand, httpClient 토큰 getter 연결), `app/ProtectedRoute.tsx`, `app/router.tsx`(`/`,`/login`,`/todos`), `pages/login`·`pages/todo-list` placeholder 구현. authStore가 `import.meta.env` 의존 체인 때문에 node:test에서 직접 import 불가해 4개 케이스 skip(가짜 검증 회피) → Playwright로 브라우저에서 직접 검증(미인증 /todos 리다이렉트, login/logout 상태 전이, 로그인 후 /todos 접근 허용), 완료 항목 🟢 표시 | FE-3 실행 결과 | 2026-08-27 |
| 1.17 | FE-4 수행 완료: `app/providers/queryClient.ts`(QueryClientProvider), `entities/{user,category,todo}`의 types/api/model(useUsers/useCategories/useTodos) 구현. `buildTodoQuery`를 httpClient 비의존 순수함수로 별도 파일 분리해 node:test 자동화 가능하게 함(5건 통과). 실제 seed Admin/신규 Member 계정으로 브라우저에서 useCategories·useUsers(403/200)·useTodos 동작 확인, 완료 항목 🟢 표시 | FE-4 실행 결과 | 2026-08-27 |
| 1.18 | FE-5 수행 완료: `shared/lib/validation.ts`(isValidEmail), `features/auth`(api/auth.api.ts, model/{useSignup,useLogin,useLogout,useRefreshToken}, ui/{LoginForm,SignupForm}), `pages/signup` 신규, `pages/login` 실제 폼 연동. `httpClient.ts`에 401 자동 재발급+재시도 인터셉터(`setRefreshHandler`, in-flight promise 캐싱, 1회 재시도) 추가, `authStore.ts`에 `setAccessToken` 액션 추가(entities→features 참조 없이 콜백 주입 패턴 유지). Playwright route interception으로 `/categories` 401→자동 `/auth/refresh`→재시도 성공까지 실제 네트워크 이벤트로 검증. node:test(isValidEmail 6건) + 브라우저 검증, 완료 항목 🟢 표시 | FE-5 실행 결과 | 2026-08-27 |
| 1.19 | FE-6 수행 완료: `shared/ui/AuthLayout.tsx`(회원가입/로그인 공용 중앙카드 레이아웃, `min()`으로 미디어쿼리 없이 반응형 처리), `SignupPage`/`LoginPage`를 AuthLayout으로 교체, 폼 에러 텍스트에 `.form-error`(danger 색상) 적용. 신규 로직 없어 자동화 테스트 없음, Playwright로 데스크톱(1280px)/모바일(375px) 스크린샷 및 회원가입→로그인→/todos 이동·이메일형식/중복이메일 에러 회귀 확인, 완료 항목 🟢 표시 | FE-6 실행 결과 | 2026-08-27 |
| 1.20 | FE-7 수행 완료: `widgets/nav-bar/model/getNavItems.ts`(역할별 메뉴 순수함수), `ui/NavBar.tsx`(역할별 메뉴+햄버거 토글+로그아웃, `NavLink`로 활성메뉴 표시), `ProtectedRoute.tsx`에 NavBar 마운트(별도 레이아웃 파일 없이 최소 수정), `TodoListPage`의 FE-5 임시 로그아웃 버튼 제거. `/profile`,`/admin/*`는 FE-11~13에서 채울 자리로 남김. node:test(getNavItems 5건) + Playwright로 Member/Admin 메뉴 차이·모바일 햄버거 토글 실증, 완료 항목 🟢 표시 | FE-7 실행 결과 | 2026-08-27 |
| 1.21 | FE-8 수행 완료: `features/todo-filter/ui/TodoFilter.tsx`(카테고리 드롭다운+상태 칩 5개, controlled), `widgets/todo-board/ui/TodoBoard.tsx`(필터 상태 소유, 표/카드 둘 다 렌더링 후 CSS 미디어쿼리로 전환), `TodoListPage`를 TodoBoard 조합으로 전면 교체(FE-4 임시 검증 코드 제거). 체크박스/편집/삭제/등록 버튼은 시각적으로만 존재(disabled, FE-9/10에서 연결). 신규 순수로직 없어 node:test 불필요, 실제 Todo 데이터로 필터 갱신·빈목록 문구·데스크톱표/모바일카드·미인증 리다이렉트 Playwright로 실증, 완료 항목 🟢 표시 | FE-8 실행 결과 | 2026-08-27 |
| 1.22 | FE-9 수행 완료: `entities/todo`에 createTodo/updateTodo API+useCreateTodo/useUpdateTodo(성공시 캐시 무효화) 추가, `shared/ui/Textarea.tsx` 신규(FE-2 보류분), `Modal.css`에 모바일 전체화면 미디어쿼리 추가, `features/todo-create-edit/ui/TodoForm.tsx`(등록/편집 공용, isValidDateRange 재사용), `pages/todo-create`·`pages/todo-edit` 구현, `/todos/new`·`/todos/:todoId/edit` 라우트 추가, TodoBoard의 등록/편집 버튼 활성화(삭제는 FE-10 몫으로 유지). 완료 체크박스는 FE-10 책임으로 폼에서 제외. 신규 순수로직 없어 node:test 불필요, Playwright로 날짜역전 인라인에러·카테고리 미지정 기본지정·편집 프리필·모달/전체화면 전환 4개 완료조건 실증, 완료 항목 🟢 표시 | FE-9 실행 결과 | 2026-08-27 |
| 1.23 | FE-10 수행 완료: `entities/todo`에 deleteTodo API+useDeleteTodo(성공시 캐시 무효화) 추가, 완료 토글은 기존 useUpdateTodo 재사용(별도 wrapper 훅 안 만듦, FE-9 선례 일관). `features/todo-toggle-complete`/`todo-delete` 디렉토리는 신설하지 않고 entities/todo/model에 통합(YAGNI). TodoBoard의 체크박스/삭제 버튼 활성화, 삭제 확인은 `window.confirm` 네이티브 사용. Playwright로 완료토글 상태재계산·삭제 후 빈목록·두계정 교차 타인Todo미노출 3개 완료조건 실증, 완료 항목 🟢 표시 | FE-10 실행 결과 | 2026-08-27 |
| 1.24 | FE-11 수행 완료: `authStore.ts`에 `updateCurrentUserInfo` 액션 추가(setAccessToken과 동일 패턴), `entities/user/model/useUpdateCurrentUser.ts` 신규(entities/user→entities/session 직접참조 안 함, authStore 갱신은 features/profile-edit이 담당), `features/profile-edit/ui/ProfileForm.tsx`(이메일 읽기전용, 비밀번호 빈값이면 payload 제외), `pages/profile` 구현, `/profile` 라우트 추가. Playwright로 이메일 disabled·이름변경 저장+성공메시지·미인증 리다이렉트 3개 완료조건 실증, 완료 항목 🟢 표시 | FE-11 실행 결과 | 2026-08-27 |
| 1.25 | FE-12 수행 완료: `app/AdminRoute.tsx` 신규(role!=='Admin'이면 /todos 리다이렉트, ProtectedRoute 안에 중첩, FE-13 재사용 예정), `entities/category`에 create/update/delete API+훅 추가(삭제 시 categories+todos 캐시 동시 무효화), `features/category-manage`(CategoryCreateForm/Row/Card, 인라인 수정), `pages/admin-category` 구현. 기본 카테고리 행은 버튼 disabled. widgets 레이어 없이 페이지가 직접 조합(YAGNI). Playwright로 Member SPA접근 차단·등록즉시반영·삭제시 Todo 기본카테고리 재할당 교차확인·기본행 비활성화 4개 완료조건 실증, 완료 항목 🟢 표시 | FE-12 실행 결과 | 2026-08-27 |
| 1.26 | FE-13 수행 완료: `pages/admin-user-list/ui/AdminUserListPage.tsx` 신규(기존 `entities/user`의 `useUsers` 재사용, 신규 로직 없어 별도 node:test 미작성), `AdminRoute` 재사용해 라우트 보호. 수정/삭제 액션 없음(범위 밖, 의도적 미구현). Playwright로 Admin 표시(이메일/이름/역할/가입일 표)·수정삭제버튼 부재·Member URL직접접근 차단 3개 완료조건 실증, 완료 항목 🟢 표시 | FE-13 실행 결과 | 2026-08-27 |
| 1.27 | FE-14 수행: 8개 화면×2뷰포트(1280×800/375×667) Playwright 실증, 예외흐름(이메일형식오류/중복이메일/로그인실패/401리다이렉트/Todo등록·수정 유효성오류/필터 빈목록/Member의 Admin화면 차단) 재현 확인. 점검 중 실버그 발견·수정: `shared/api/httpClient.ts`의 401 자동 refresh 로직이 `/auth/refresh` 자체의 401 응답에도 재귀적으로 refresh를 재시도하다 자기 자신을 기다리는 데드락에 빠져, 로그인 실패 시 로그인 버튼이 영구 disabled로 멈추는 버그였음 → `path !== '/auth/refresh'` 조건 추가로 수정, Playwright로 로그인 실패 에러 메시지 정상 표시 및 재로그인 정상 동작 재확인. 완료 항목 🟢 표시 | FE-14 실행 결과 | 2026-08-27 |
| 1.28 | 사용자 피드백 기반 프론트엔드 후속 수정 5건: ① `index.css`의 Vite 초기 스캐폴드 잔재(`#root { width:1126px; border-inline; text-align:center }`) 제거 → 데스크톱 전체 폭 미활용·화면 양끝 흰 테두리선·반응형 미적용 버그 수정, 부수효과로 로그인/회원가입 버튼이 좌측정렬되던 것은 `AuthLayout.css`에 폼 스코프 규칙 추가로 복구 ② `shared/ui/Textarea.tsx`+`Input.css`에 `.textarea` 클래스 추가(`height:auto`, 상하 패딩 균등)로 메모 입력값 세로 중앙 정렬 ③ `features/todo-create-edit/ui/TodoForm.tsx` 등록/저장 버튼을 취소 버튼보다 앞에 배치 ④ `widgets/todo-board/ui/TodoBoard.tsx`에 메모 열 추가(데스크톱 표: 기간-편집 사이, 모바일 카드: 기간 아래) ⑤ 새로고침 시 인메모리 세션이 초기화돼 모든 화면이 로그인으로 튕기던 문제 수정 — 백엔드 `POST /auth/refresh` 응답에 `user` 포함(`auth.service.js`/`auth.routes.js`/`swagger.json`), 프론트 `authStore`에 `isBootstrapping` 상태와 `bootstrapSession()` 추가해 앱 기동 시 Refresh Token 쿠키로 세션 자동 복원, `ProtectedRoute`/`IndexRedirect`가 복원 완료 전까지 리다이렉트 보류. Playwright로 `/profile`·`/admin/categories` 새로고침 후 유지 및 로그아웃 상태 회귀 없음 확인. `4-wireframe.md`(Todo목록 메모열, 등록·편집 버튼순서), `3-user-scenario.md`(시나리오3 새로고침 세션복원) 동기화 | 사용자 피드백(레이아웃/메모열/버튼순서/새로고침 세션유지) | 2026-08-27 |

## 문서 개요
- 목적: docs 1~7번 문서(도메인정의서/PRD/시나리오/와이어프레임/프로젝트원칙/아키텍처/ERD)와 `schema.sql`을 기준으로, 실제 구현 순서를 DB → Backend → Frontend 단위의 독립적인 Task로 분할한다.
- 전제: PRD(`2-prd.md`) 7장 Day1/Day2, 1인 개발, 2일 일정. 아래 Task는 그 일정 안에서 수행 가능한 최소 단위로 쪼갠 것이며, Day1=DB+Backend 중심, Day2=Frontend+통합 중심으로 대응된다.
- Task ID 규칙: `DB-n`(데이터베이스), `BE-n`(백엔드), `FE-n`(프론트엔드). 선행 Task가 모두 완료되어야 해당 Task를 시작할 수 있다.
- 완료 조건 표시 규칙: 미실행 `- [ ]` / 정상 완료 🟢 / 실패 🔴.

---

## 1. Database Task

### DB-1. 마이그레이션 스크립트 정리
- **수행 작업**: `docs/schema.sql`을 `backend/src/migrations/` 하위에 순번 파일로 분리한다(`001_create_users.sql`, `002_create_categories.sql`, `003_create_todos.sql`, 인덱스/유니크 인덱스는 각 테이블 생성 파일에 포함). `5-project-principle.md` 7장 백엔드 디렉토리 구조를 따른다.
- **완료 조건**
  - 🟢 `001_create_users.sql` ~ `003_create_todos.sql` 3개 파일이 순서대로 존재한다.
  - 🟢 각 파일을 순서대로 실행했을 때 오류 없이 `users`/`categories`/`todos` 3개 테이블과 관련 인덱스(`categories_single_default_idx`, `todos_user_id_idx`, `todos_category_id_idx`)가 생성된다.
  - 🟢 컬럼명/타입/제약조건이 `7-erd.md`(v1.2, updated_by/updated_at 포함) 및 `schema.sql`과 100% 일치한다.
- **선행 Task**: 없음(최초 시작 Task).

### DB-2. 로컬 개발 DB 인스턴스 준비
- **수행 작업**: PostgreSQL 17 로컬 인스턴스(또는 Docker 컨테이너) 기동, `my_todolist` 데이터베이스 생성, DB-1의 마이그레이션 3개 파일을 순서대로 적용.
- **완료 조건**
  - 🟢 `psql`로 접속해 `\dt` 실행 시 `users`, `categories`, `todos` 3개 테이블이 조회된다.
  - 🟢 `POSTGRES_CONNECTION_STRING` 형식의 접속 문자열이 확정되어 있다(예: `postgresql://user:pass@localhost:5432/my_todolist`).
- **선행 Task**: DB-1.

### DB-3. 시드 데이터 작성
- **수행 작업**: 최초 관리자 계정 1건(role=Admin, bcrypt 해시된 비밀번호)과 전역 '기본' Category 1건(`is_default=true`)을 삽입하는 시드 SQL(`seed.sql`) 작성 및 실행. 도메인 정의서 6장 규칙5(기본 Category 1개) 충족 확인.
- **완료 조건**
  - 🟢 `categories` 테이블에 `is_default=true`인 행이 정확히 1건 존재한다.
  - 🟢 `users` 테이블에 role=Admin인 계정이 최소 1건 존재하고, 해당 비밀번호로 로그인 가능함을 SQL 조회로 확인했다(비밀번호 해시 값 존재 확인).
  - 🟢 동일 시드 스크립트를 재실행해도 중복 삽입 없이 안전하게 동작한다(`ON CONFLICT DO NOTHING` 등).
- **선행 Task**: DB-2.

---

## 2. Backend Task

### BE-1. 백엔드 프로젝트 초기화
- **수행 작업**: `backend/` 디렉토리에 Node.js + Express 프로젝트 생성(`package.json`), `pg` 설치(Prisma 등 ORM 설치 금지), `5-project-principle.md` 7장 디렉토리 구조(`routes/services/queries/middlewares/db/migrations/utils/test`) 생성, `.env.example` 작성(`POSTGRES_CONNECTION_STRING`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `PORT`, `CORS_ORIGIN`).
- **완료 조건**
  - 🟢 `npm install` 정상 완료, `package.json`에 `express`, `pg`, `bcrypt`, `jsonwebtoken` 등 필요한 최소 패키지만 등록되어 있다(Prisma 미포함).
  - 🟢 `5-project-principle.md` 7장과 동일한 폴더 트리가 생성되어 있다.
  - 🟢 `.env.example`이 존재하고 실제 `.env`는 `.gitignore`에 포함되어 있다.
- **선행 Task**: 없음(DB-1과 병행 가능).

### BE-2. DB 커넥션 풀 및 헬스체크
- **수행 작업**: `db/pool.js`에 `pg.Pool`(max 20 내외) 단일 인스턴스 생성. `GET /health`에서 `SELECT 1`로 DB 연결 확인 후 응답하는 엔드포인트 구현.
- **완료 조건**
  - 🟢 서버 기동 후 `GET /health` 호출 시 200과 함께 DB 연결 정상 여부가 응답된다.
  - 🟢 DB 연결 실패 시 `/health`가 5xx를 반환한다(수동으로 DB 중단 후 확인).
- **선행 Task**: BE-1, DB-2.

### BE-3. 공통 미들웨어(로깅/에러 핸들링) 구현
- **수행 작업**: `middlewares/requestLogger.js`(메서드/경로/상태코드/응답시간/userId 로그), `middlewares/errorHandler.js`(표준 에러 응답 `{error:{message, status}}`, 401/403/400/404/500 매핑) 구현 및 `app.js`에 `express.json() → requestLogger → routes → errorHandler` 순서로 등록. 로그 출력 대상은 `NODE_ENV`로 분기: 개발환경(`development`)에서는 콘솔에 출력하고, 운영환경(`production`)에서는 파일시스템의 날짜별 로그 파일(`logs/app_YYYY-MM-DD.log`, 당일 날짜 기준 자정 이후 요청부터는 새 날짜 파일에 기록)에 append 방식으로 기록한다.
- **완료 조건**
  - 🟢 임의의 라우트에서 `next(err)` 또는 `throw`한 에러가 `errorHandler`를 거쳐 `{error:{message, status}}` 형식으로 응답된다.
  - 🟢 개발환경(`NODE_ENV=development`)에서 모든 요청에 대해 콘솔에 `메서드/경로/상태코드/응답시간` 로그가 한 줄씩 출력된다.
  - 🟢 운영환경(`NODE_ENV=production`)에서 동일한 로그가 콘솔 대신 당일 날짜의 `logs/app_YYYY-MM-DD.log` 파일에 한 줄씩 append된다.
  - 🟢 비밀번호/토큰 값이 로그에 출력되지 않는다.
- **선행 Task**: BE-1.

### BE-4. 인증 API (회원가입/로그인/토큰재발급/로그아웃)
- **수행 작업**: `utils/jwt.js`(Access/Refresh 서명·검증), `auth.service.js`(bcrypt 해시/검증, 토큰 발급), `auth.routes.js`(`POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`) 구현. 이메일 형식 검증 + `users.email` UNIQUE 기반 중복 체크(3-user-scenario.md 시나리오1~4).
- **완료 조건**
  - 🟢 이메일 형식이 아닌 값으로 회원가입 시 400 응답.
  - 🟢 중복 이메일로 회원가입 시 400(또는 409) 응답, `users`에 중복 저장되지 않는다.
  - 🟢 정상 회원가입 후 해당 계정으로 로그인 시 Access Token(응답 바디) + Refresh Token(Set-Cookie, httpOnly)이 발급된다.
  - 🟢 잘못된 비밀번호로 로그인 시 401, 계정 존재 여부가 응답 메시지에 노출되지 않는다.
  - 🟢 만료된 Access Token으로 API 호출 시 401, 이후 `POST /auth/refresh`로 새 Access Token 발급이 확인된다(BE-5 보호 라우트가 아직 없어 `utils/jwt.js`의 `verifyAccessToken` 단위 테스트로 만료 시 예외 발생 확인, refresh 흐름은 통합 테스트로 확인).
  - 🟢 `POST /auth/logout` 호출 시 Refresh Token 쿠키가 만료 처리된다.
- **선행 Task**: BE-2, BE-3, DB-3.

### BE-5. 인증/인가 미들웨어
- **수행 작업**: `middlewares/auth.middleware.js`(Access Token 검증, 실패 시 401, 성공 시 `req.user` 설정), `middlewares/admin.middleware.js`(`req.user.role === 'Admin'` 검증, 실패 시 403) 구현.
- **완료 조건**
  - 🟢 토큰 없이 보호 라우트 호출 시 401.
  - 🟢 Member 계정으로 Admin 전용 라우트 호출 시 403.
  - 🟢 Admin 계정으로 Admin 전용 라우트 호출 시 정상 통과된다.
- **선행 Task**: BE-4.

### BE-6. User API (회원정보 수정, 회원 목록 조회)
- **수행 작업**: `user.service.js`/`user.routes.js`에 `PATCH /users/me`(본인 정보 수정, 소유권은 토큰의 userId로 판단하므로 별도 파라미터 검증 불필요), `GET /users`(Admin 전용, 전체 회원 목록 조회) 구현.
- **완료 조건**
  - 🟢 로그인한 사용자가 자신의 이름 등 정보를 수정하면 DB에 반영되고 `updated_by`/`updated_at`이 본인/현재시각으로 갱신된다.
  - 🟢 Member 계정이 `GET /users` 호출 시 403.
  - 🟢 Admin 계정이 `GET /users` 호출 시 전체 회원 목록(email/name/role/createdAt)이 반환된다.
- **선행 Task**: BE-5.

### BE-7. Category API (조회 + Admin CRUD + 삭제 재할당)
- **수행 작업**: `category.service.js`/`category.routes.js`에 `GET /categories`(전체 조회, 모든 인증 사용자), `POST/PATCH/DELETE /categories/:id`(Admin 전용) 구현. 삭제 시 참조 중인 `todos.category_id`를 기본 Category로 일괄 재할당하는 로직을 `pg` 트랜잭션(`BEGIN/COMMIT/ROLLBACK`)으로 구현(3-admin-scenario.md 시나리오3, 도메인 8장).
- **완료 조건**
  - 🟢 Member 계정도 `GET /categories` 조회는 가능하지만 등록/수정/삭제 시도 시 403.
  - 🟢 Admin이 신규 Category 등록 시 `created_by`가 해당 Admin의 `user_id`로 저장된다.
  - 🟢 참조 중인 Todo가 있는 Category를 삭제하면, 해당 Todo들의 `category_id`가 기본 Category로 재할당된 뒤 Category가 삭제된다(pool.connect() 트랜잭션, BEGIN/COMMIT/ROLLBACK).
  - 🟢 기본(`is_default=true`) Category 삭제/수정 시도는 애플리케이션 레벨에서 400으로 차단된다.
- **선행 Task**: BE-5.

### BE-8. Todo API (CRUD, 필터링, 완료 토글, 상태 파생)
- **수행 작업**: `utils/todoStatus.js`(시작전/진행중/완료/지연 파생 계산 순수 함수), `todo.service.js`/`todo.routes.js`에 `POST /todos`(등록, Category 미지정 시 기본 자동 지정), `GET /todos`(카테고리/상태 쿼리 파라미터 필터링, 본인 소유만 조회), `PATCH /todos/:id`(수정, 완료 토글 포함), `DELETE /todos/:id`(삭제) 구현. 모든 수정/삭제는 소유권 검증(`todo.user_id === req.user.id`) 후 처리.
- **완료 조건**
  - 🟢 `startDate > endDate`로 등록/수정 시도 시 400.
  - 🟢 Category 미지정으로 등록 시 `category_id`가 기본 Category로 저장된다.
  - 🟢 동일 사용자가 같은 기간에 여러 Todo를 등록해도 모두 성공한다(1일 다건 허용).
  - 🟢 `GET /todos?status=지연` 등 상태 필터 호출 시, `todoStatus.js` 계산 결과와 일치하는 Todo만 반환된다(경계값: startDate=오늘, endDate=오늘, completed=true 케이스 확인).
  - 🟢 타인의 Todo를 수정/삭제 시도 시 403.
  - 🟢 완료 토글(`completed` 반전) 후 재조회 시 상태가 올바르게 재계산되어 반환된다.
- **선행 Task**: BE-7(Category 조회 API 필요), DB-3.

### BE-9. 백엔드 단위 테스트
- **수행 작업**: `5-project-principle.md` 4장에 명시된 핵심 로직 테스트 작성(`node --test` 등 표준 도구 사용, 별도 프레임워크 미도입).
- **완료 조건**
  - 🟢 Todo 상태 파생 계산 경계값 테스트(`todoStatus.test.js`)가 작성되고 통과한다.
  - 🟢 소유권 검증(타인 Todo 수정/삭제 시 403, `be8-todo.test.js`)이 통과한다. 회원정보 수정(`PATCH /users/me`)은 URL에 대상을 지정하지 않고 항상 요청자 본인만 수정하는 구조라 "타인 수정 시 403" 케이스 자체가 성립하지 않음(설계상 해당 없음).
  - 🟢 Category 미지정 시 기본 Category 자동 지정 테스트(`be8-todo.test.js`)가 통과한다.
  - 🟢 Category 삭제 시 참조 Todo 재할당 테스트(`be7-category.test.js`)가 통과한다.
  - 🟢 회원가입 이메일 중복 체크 테스트(`be4-auth.test.js`)가 통과한다.
- **선행 Task**: BE-6, BE-7, BE-8.

---

## 3. Frontend Task

### FE-1. 프론트엔드 프로젝트 초기화 (FSD 스켈레톤)
- **수행 작업**: `frontend/`에 React 19 + TypeScript 프로젝트 생성, `zustand`/`@tanstack/react-query` 설치, `5-project-principle.md` 6장 FSD 디렉토리(`app/pages/widgets/features/entities/shared`) 스켈레톤 생성, `.env.example`(API base URL) 작성.
- **완료 조건**
  - 🟢 `npm run dev`로 앱이 빈 화면이라도 정상 기동된다.
  - 🟢 `src/` 하위에 `app/pages/widgets/features/entities/shared` 6개 폴더가 존재한다.
  - 🟢 TypeScript 컴파일 에러 없이 빌드된다(`tsc --noEmit` 통과).
- **선행 Task**: 없음(BE Task와 병행 가능).

### FE-2. shared 레이어 구현
- **수행 작업**: `shared/api/httpClient.ts`(fetch 래퍼, Authorization 헤더 자동 첨부, 401 응답 시 공통 처리 훅), `shared/ui/{Button,Input,Modal}.tsx`, `shared/lib/{date,validation}.ts`(startDate≤endDate 등 공용 검증), `shared/config/env.ts` 구현.
- **완료 조건**
  - 🟢 `httpClient`로 백엔드 `GET /health`(BE-2) 호출 시 정상 응답을 받는다.
  - 🟢 공용 `Button`/`Input`/`Modal` 컴포넌트가 최소 1개 화면에서 실제로 렌더링된다(App.tsx 임시 데모, 스크린샷/컴퓨티드 스타일로 9-style.md 색상 적용 확인).
  - 🟢 `date.ts`의 `isValidDateRange` 날짜 비교 함수 동작 확인 완료(node:test 3케이스 통과). 이메일 등 그 외 validation은 실제 사용처(FE-6)에서 추가하기로 함(YAGNI).
- **선행 Task**: FE-1, BE-2.

### FE-3. entities/session (인증 상태) 및 라우트 보호
- **수행 작업**: `entities/session/model/authStore.ts`(Zustand: accessToken, currentUser, isLoggedIn), `app/ProtectedRoute.tsx`(미인증 시 로그인 화면 리다이렉트), `app/router.tsx` 기본 라우트 골격 구성.
- **완료 조건**
  - 🟢 로그인 전 상태에서 보호된 경로(예: `/todos`) 접근 시 로그인 화면으로 리다이렉트된다(Playwright로 실브라우저 확인).
  - 🟢 `authStore`에 저장된 로그인 상태에 따라 네비게이션 노출 여부가 바뀔 준비가 되어 있다(login/logout 상태 전이 및 로그인 후 `/todos` 접근 허용을 브라우저에서 확인, 실제 네비게이션 UI는 FE-7에서 연결).
- **선행 Task**: FE-2.

### FE-4. entities/user, entities/category, entities/todo 구현
- **수행 작업**: 각 entity별 `types.ts`(도메인 정의서 용어와 일치하는 타입), `api/*.api.ts`(fetch 함수), `model/use*.ts`(TanStack Query `useQuery`/`useMutation`) 구현. 대상 API: BE-6(user), BE-7(category), BE-8(todo).
- **완료 조건**
  - 🟢 `useCategories()` 훅으로 로그인 상태에서 전체 Category 목록을 정상 조회한다(Admin/Member 계정 모두 브라우저에서 확인).
  - 🟢 `useTodos(filter)` 훅으로 카테고리/상태 필터 파라미터에 따라 다른 결과가 조회된다(`buildTodoQuery` 순수함수 분리 후 node:test 5건으로 쿼리스트링 생성 검증).
  - 🟢 `useUsers()`(Admin 전용) 훅이 Member 계정에서는 403을 반환받고, Admin 계정에서는 목록을 반환받는다(브라우저에서 두 계정으로 실제 API 응답 확인, 페이지에서는 role 기반 enabled로 게이팅).
  - 🟢 각 entity의 TypeScript 타입 필드명이 `1-domain-definition.md`/`7-erd.md`/swagger.json과 일치한다(`tsc --noEmit` 통과로 확인).
- **선행 Task**: FE-3, BE-6, BE-7, BE-8.

### FE-5. features/auth 구현
- **수행 작업**: `ui/{LoginForm,SignupForm}.tsx`, `model/{useLogin,useSignup,useLogout,useRefreshToken}.ts` 구현. Access Token 만료(401) 감지 시 `useRefreshToken`으로 자동 재발급 후 원 요청 재시도하는 인터셉터 로직을 `httpClient`(FE-2)와 연동.
- **완료 조건**
  - 🟢 잘못된 이메일 형식 입력 시 클라이언트 단에서 인라인 오류가 표시된다(Playwright로 SignupForm 실제 확인, `isValidEmail` node:test 6건 통과).
  - 🟢 정상 회원가입 → 로그인 → `authStore`에 Access Token 저장까지 확인됨(실제 네트워크 요청의 `Authorization: Bearer` 헤더로 검증).
  - 🟢 Access Token 강제 만료 상태에서 API 호출 시 자동으로 재발급 후 원래 요청이 재시도되어 사용자가 별도 조치 없이 이어서 사용할 수 있다(Playwright route interception으로 `GET /categories` 첫 응답만 401 위조 → 자동 `/auth/refresh`(200) → 재시도 성공(200) 확인, 사용자는 `/todos`에 그대로 유지됨).
  - 🟢 로그아웃 클릭 시 `authStore`가 초기화되고 로그인 화면으로 이동한다(로그아웃 후 `/todos` 재접근 시 다시 `/login`으로 리다이렉트되어 세션 초기화 확인).
- **선행 Task**: FE-3, BE-4.

### FE-6. 회원가입/로그인 화면 (pages)
- **수행 작업**: `pages/signup/ui/SignupPage.tsx`, `pages/login/ui/LoginPage.tsx`를 `4-wireframe.md` 1·2번 화면 레이아웃대로 구현, FE-5의 폼/훅과 연결.
- **완료 조건**
  - 🟢 데스크톱/모바일(≤768px) 두 뷰포트에서 와이어프레임과 동일한 레이아웃(중앙 카드, 폭만 축소)으로 렌더링된다(`shared/ui/AuthLayout` 공용화, Playwright 스크린샷으로 1280px/375px 확인).
  - 🟢 회원가입 성공 시 로그인 화면으로 이동, 로그인 성공 시 Todo 목록 화면으로 이동한다(브라우저 회귀 확인).
  - 🟢 인증 실패/중복 이메일 등 에러 메시지가 화면에 노출된다(`.form-error`로 danger 색상 적용, 실제 중복 이메일 시나리오로 확인).
- **선행 Task**: FE-5.

### FE-7. widgets/nav-bar 구현
- **수행 작업**: `widgets/nav-bar/ui/NavBar.tsx`를 역할(Member/Admin)에 따라 메뉴가 달라지도록 구현, `4-wireframe.md` 반응형 원칙(모바일 햄버거 메뉴)대로 구현.
- **완료 조건**
  - 🟢 Member 로그인 시 "Todo목록/회원정보수정/로그아웃"만 노출된다(신규 계정으로 브라우저 확인).
  - 🟢 Admin 로그인 시 "회원관리/카테고리관리" 메뉴가 추가로 노출된다(seed 계정으로 브라우저 확인, 순서도 와이어프레임과 일치).
  - 🟢 모바일 뷰포트(375px)에서 햄버거 아이콘 클릭 시 메뉴가 펼쳐지고(☰→✕) 다시 탭하면 닫힌다(✕→☰), 브라우저로 확인.
- **선행 Task**: FE-3.

### FE-8. Todo 목록 화면 (필터 포함)
- **수행 작업**: `features/todo-filter`(카테고리/상태 필터 UI+상태), `widgets/todo-board`(필터+목록 조합), `pages/todo-list/ui/TodoListPage.tsx` 구현. `4-wireframe.md` 3번 화면(데스크톱 표/모바일 카드) 반영.
- **완료 조건**
  - 🟢 카테고리 필터, 상태 필터(전체/시작전/진행중/완료/지연) 선택 시 목록이 즉시 갱신된다(실제 Todo 3건으로 브라우저 확인).
  - 🟢 필터 결과가 없을 때 "표시할 Todo가 없습니다" 문구가 노출된다(에러 아님, "시작전" 필터로 확인).
  - 🟢 데스크톱은 표 형태, 모바일은 카드 스택(좌측 상태색 바)으로 각각 렌더링된다(1280px/375px 스크린샷으로 확인, CSS 미디어쿼리로 둘 다 렌더링 후 하나만 표시).
  - 🟢 미인증 상태로 직접 URL 접근 시 로그인 화면으로 리다이렉트된다(회귀 확인).
- **선행 Task**: FE-4, FE-7.

### FE-9. Todo 등록/편집 화면
- **수행 작업**: `features/todo-create-edit/ui/TodoForm.tsx`(등록/편집 공용 폼: 제목/카테고리/시작일·종료일 캘린더/메모), `pages/todo-create`, `pages/todo-edit` 구현. `4-wireframe.md` 4·5번 화면(데스크톱 모달/모바일 전체화면) 반영.
- **완료 조건**
  - 🟢 `startDate > endDate` 입력 시 등록/저장 버튼 클릭 전후로 인라인 오류 메시지가 노출된다(브라우저 확인, 모달 유지+에러 표시).
  - 🟢 Category 미선택 상태로 등록해도 정상 등록되고, 조회 시 기본 Category로 표시된다(실제 등록→목록 반영 확인).
  - 🟢 편집 화면 진입 시 기존 값이 폼에 프리필된다(제목/시작일/종료일 값 일치 확인).
  - 🟢 데스크톱은 모달, 모바일은 전체화면 폼으로 각각 렌더링된다(1280px 모달/375px 전체화면 스크린샷 확인).
- **선행 Task**: FE-8.

### FE-10. Todo 완료 토글 / 삭제 기능
- **수행 작업**: `features/todo-toggle-complete`, `features/todo-delete`의 `model` 훅을 `TodoItem`(entities/todo)과 연결, 목록 화면(FE-8)에서 체크박스/삭제 버튼 동작 구현.
- **완료 조건**
  - 🟢 체크박스 클릭 시 즉시 완료/미완료로 토글되고 상태(진행중/완료/지연 등) 표시가 갱신된다(진행중→체크→완료, 재클릭→진행중 재계산 확인).
  - 🟢 삭제 클릭(확인 후) 시 목록에서 해당 항목이 즉시 사라진다(`window.confirm` 사용, 삭제 후 빈 목록 문구까지 확인).
  - 🟢 타인의 Todo에 대한 조작 버튼은애초에 노출되지 않는다(두 계정 교차 확인으로 검증, 본인 목록만 조회되므로 자연히 충족).
- **선행 Task**: FE-8.

### FE-11. 회원정보 수정 화면
- **수행 작업**: `features/profile-edit/ui/ProfileForm.tsx`, `pages/profile/ui/ProfilePage.tsx` 구현. `4-wireframe.md` 6번 화면 반영.
- **완료 조건**
  - 🟢 이메일은 읽기 전용으로 표시되고 수정 불가하다(Input disabled, 값 확인).
  - 🟢 이름 등 항목 변경 후 저장 시 성공 메시지와 함께 최신 값이 반영된다("저장되었습니다" + 폼 값 갱신 확인).
  - 🟢 미인증 상태 접근 시 로그인 화면으로 리다이렉트된다(`/profile` 직접 접근 회귀 확인).
- **선행 Task**: FE-4, FE-7.

### FE-12. 관리자 - 카테고리 관리 화면
- **수행 작업**: `features/category-manage`(등록/수정/삭제 폼+훅), `pages/admin-category/ui/AdminCategoryPage.tsx` 구현. `4-wireframe.md` 8번 화면(데스크톱 표/모바일 카드) 반영.
- **완료 조건**
  - 🟢 Admin 계정에서만 이 화면 메뉴가 노출되고(FE-7 검증됨), Member 계정으로 URL 직접 접근 시 접근이 차단된다(`AdminRoute` 신규 구현, SPA 접근으로 `/todos` 리다이렉트 확인).
  - 🟢 신규 Category 등록 시 목록에 즉시 반영된다(브라우저 확인).
  - 🟢 Category 삭제 시 "참조 중인 Todo는 기본으로 재할당됩니다" 안내(상시문구+confirm)가 노출되고, 삭제 후 실제로 해당 Todo들이 기본 Category로 표시된다(Todo 목록 화면 교차 확인, categories+todos 캐시 동시 무효화).
  - 🟢 기본 Category 행에는 수정/삭제 액션이 비활성화되어 있다(disabled 확인).
- **선행 Task**: FE-7, BE-7.

### FE-13. 관리자 - 회원 목록 화면
- **수행 작업**: `pages/admin-user-list/ui/AdminUserListPage.tsx` 구현(entities/user의 `useUsers` 활용). `4-wireframe.md` 7번 화면 반영.
- **완료 조건**
  - 🟢 Admin 계정 로그인 시 전체 회원(이메일/이름/역할/가입일) 목록이 표 형태(데스크톱)/카드형(모바일)로 표시된다.
  - 🟢 수정/삭제 액션이 화면에 존재하지 않는다(범위 밖).
  - 🟢 Member 계정으로 URL 직접 접근 시 접근이 차단된다.
- **선행 Task**: FE-7, FE-4.

### FE-14. 반응형/예외 흐름 통합 점검
- **수행 작업**: 전체 8개 화면을 데스크톱(>1024px)/모바일(<768px) 두 뷰포트에서 수동 점검, 401(미인증)/403(권한없음) 리다이렉트 및 폼 인라인 에러 메시지를 `3-user-scenario.md`/`3-admin-scenario.md`의 Alternative/Exception Flow와 대조 확인.
- **완료 조건**
  - 🟢 8개 화면 모두 두 뷰포트에서 `4-wireframe.md` 레이아웃과 어긋나지 않음을 확인했다.
  - 🟢 두 시나리오 문서에 정의된 모든 예외 흐름(401/403/유효성오류/중복이메일 등)이 실제 화면에서 재현·확인되었다.
  - 🟢 접근성(a11y)은 PRD 범위 제외에 따라 별도 점검하지 않았음을 확인했다(의도적 생략).
- **선행 Task**: FE-6, FE-9, FE-10, FE-11, FE-12, FE-13.

---

## 참고: Task ↔ 문서 근거 요약
| 영역 | Task | 주요 근거 문서 |
|---|---|---|
| DB | DB-1~3 | 7-erd.md, schema.sql, 1-domain-definition.md 6장 |
| Backend | BE-1~3 | 5-project-principle.md 5·7장 |
| Backend | BE-4~5 | 2-prd.md 4·5·6장, 3-user-scenario.md 시나리오1~4 |
| Backend | BE-6~8 | 1-domain-definition.md 6·8장, 3-user/3-admin-scenario.md |
| Backend | BE-9 | 5-project-principle.md 4장 |
| Frontend | FE-1~4 | 5-project-principle.md 2·6장(FSD) |
| Frontend | FE-5~6 | 3-user-scenario.md 시나리오1~4, 4-wireframe.md 1·2번 |
| Frontend | FE-7~11 | 4-wireframe.md 3~6번, 3-user-scenario.md 시나리오6~10 |
| Frontend | FE-12~13 | 4-wireframe.md 7·8번, 3-admin-scenario.md |
| Frontend | FE-14 | 4-wireframe.md 반응형 원칙, 3-user/3-admin-scenario.md 예외흐름 |
