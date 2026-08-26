# my-ToDoList 실행 계획 (WBS)

## 버전 이력
| 버전 | 요약 내용 | 근거/출처 | 날짜 |
|---|---|---|---|
| 1.0 | 최초 작성: DB/백엔드/프론트엔드 Task 분할, Task별 수행작업/완료조건/선행Task 정의 | 1~7번 docs 문서 전체, schema.sql | 2026-08-26 |

## 문서 개요
- 목적: docs 1~7번 문서(도메인정의서/PRD/시나리오/와이어프레임/프로젝트원칙/아키텍처/ERD)와 `schema.sql`을 기준으로, 실제 구현 순서를 DB → Backend → Frontend 단위의 독립적인 Task로 분할한다.
- 전제: PRD(`2-prd.md`) 7장 Day1/Day2, 1인 개발, 2일 일정. 아래 Task는 그 일정 안에서 수행 가능한 최소 단위로 쪼갠 것이며, Day1=DB+Backend 중심, Day2=Frontend+통합 중심으로 대응된다.
- Task ID 규칙: `DB-n`(데이터베이스), `BE-n`(백엔드), `FE-n`(프론트엔드). 선행 Task가 모두 완료되어야 해당 Task를 시작할 수 있다.

---

## 1. Database Task

### DB-1. 마이그레이션 스크립트 정리
- **수행 작업**: `docs/schema.sql`을 `backend/src/migrations/` 하위에 순번 파일로 분리한다(`001_create_users.sql`, `002_create_categories.sql`, `003_create_todos.sql`, 인덱스/유니크 인덱스는 각 테이블 생성 파일에 포함). `5-project-principle.md` 7장 백엔드 디렉토리 구조를 따른다.
- **완료 조건**
  - [ ] `001_create_users.sql` ~ `003_create_todos.sql` 3개 파일이 순서대로 존재한다.
  - [ ] 각 파일을 순서대로 실행했을 때 오류 없이 `users`/`categories`/`todos` 3개 테이블과 관련 인덱스(`categories_single_default_idx`, `todos_user_id_idx`, `todos_category_id_idx`)가 생성된다.
  - [ ] 컬럼명/타입/제약조건이 `7-erd.md`(v1.2, updated_by/updated_at 포함) 및 `schema.sql`과 100% 일치한다.
- **선행 Task**: 없음(최초 시작 Task).

### DB-2. 로컬 개발 DB 인스턴스 준비
- **수행 작업**: PostgreSQL 17 로컬 인스턴스(또는 Docker 컨테이너) 기동, `my_todolist` 데이터베이스 생성, DB-1의 마이그레이션 3개 파일을 순서대로 적용.
- **완료 조건**
  - [ ] `psql`로 접속해 `\dt` 실행 시 `users`, `categories`, `todos` 3개 테이블이 조회된다.
  - [ ] `DATABASE_URL` 형식의 접속 문자열이 확정되어 있다(예: `postgres://user:pass@localhost:5432/my_todolist`).
- **선행 Task**: DB-1.

### DB-3. 시드 데이터 작성
- **수행 작업**: 최초 관리자 계정 1건(role=Admin, bcrypt 해시된 비밀번호)과 전역 '기본' Category 1건(`is_default=true`)을 삽입하는 시드 SQL(`seed.sql`) 작성 및 실행. 도메인 정의서 6장 규칙5(기본 Category 1개) 충족 확인.
- **완료 조건**
  - [ ] `categories` 테이블에 `is_default=true`인 행이 정확히 1건 존재한다.
  - [ ] `users` 테이블에 role=Admin인 계정이 최소 1건 존재하고, 해당 비밀번호로 로그인 가능함을 SQL 조회로 확인했다(비밀번호 해시 값 존재 확인).
  - [ ] 동일 시드 스크립트를 재실행해도 중복 삽입 없이 안전하게 동작한다(`ON CONFLICT DO NOTHING` 등).
- **선행 Task**: DB-2.

---

## 2. Backend Task

### BE-1. 백엔드 프로젝트 초기화
- **수행 작업**: `backend/` 디렉토리에 Node.js + Express 프로젝트 생성(`package.json`), `pg` 설치(Prisma 등 ORM 설치 금지), `5-project-principle.md` 7장 디렉토리 구조(`routes/services/queries/middlewares/db/migrations/utils/test`) 생성, `.env.example` 작성(`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `PORT`).
- **완료 조건**
  - [ ] `npm install` 정상 완료, `package.json`에 `express`, `pg`, `bcrypt`, `jsonwebtoken` 등 필요한 최소 패키지만 등록되어 있다(Prisma 미포함).
  - [ ] `5-project-principle.md` 7장과 동일한 폴더 트리가 생성되어 있다.
  - [ ] `.env.example`이 존재하고 실제 `.env`는 `.gitignore`에 포함되어 있다.
- **선행 Task**: 없음(DB-1과 병행 가능).

### BE-2. DB 커넥션 풀 및 헬스체크
- **수행 작업**: `db/pool.js`에 `pg.Pool`(max 20 내외) 단일 인스턴스 생성. `GET /health`에서 `SELECT 1`로 DB 연결 확인 후 응답하는 엔드포인트 구현.
- **완료 조건**
  - [ ] 서버 기동 후 `GET /health` 호출 시 200과 함께 DB 연결 정상 여부가 응답된다.
  - [ ] DB 연결 실패 시 `/health`가 5xx를 반환한다(수동으로 DB 중단 후 확인).
- **선행 Task**: BE-1, DB-2.

### BE-3. 공통 미들웨어(로깅/에러 핸들링) 구현
- **수행 작업**: `middlewares/requestLogger.js`(메서드/경로/상태코드/응답시간/userId 로그), `middlewares/errorHandler.js`(표준 에러 응답 `{error:{message, status}}`, 401/403/400/404/500 매핑) 구현 및 `app.js`에 `express.json() → requestLogger → routes → errorHandler` 순서로 등록.
- **완료 조건**
  - [ ] 임의의 라우트에서 `next(err)` 또는 `throw`한 에러가 `errorHandler`를 거쳐 `{error:{message, status}}` 형식으로 응답된다.
  - [ ] 모든 요청에 대해 콘솔에 `메서드/경로/상태코드/응답시간` 로그가 한 줄씩 출력된다.
  - [ ] 비밀번호/토큰 값이 로그에 출력되지 않는다.
- **선행 Task**: BE-1.

### BE-4. 인증 API (회원가입/로그인/토큰재발급/로그아웃)
- **수행 작업**: `utils/jwt.js`(Access/Refresh 서명·검증), `auth.service.js`(bcrypt 해시/검증, 토큰 발급), `auth.routes.js`(`POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`) 구현. 이메일 형식 검증 + `users.email` UNIQUE 기반 중복 체크(3-user-scenario.md 시나리오1~4).
- **완료 조건**
  - [ ] 이메일 형식이 아닌 값으로 회원가입 시 400 응답.
  - [ ] 중복 이메일로 회원가입 시 400(또는 409) 응답, `users`에 중복 저장되지 않는다.
  - [ ] 정상 회원가입 후 해당 계정으로 로그인 시 Access Token(응답 바디) + Refresh Token(Set-Cookie, httpOnly)이 발급된다.
  - [ ] 잘못된 비밀번호로 로그인 시 401, 계정 존재 여부가 응답 메시지에 노출되지 않는다.
  - [ ] 만료된 Access Token으로 API 호출 시 401, 이후 `POST /auth/refresh`로 새 Access Token 발급이 확인된다.
  - [ ] `POST /auth/logout` 호출 시 Refresh Token 쿠키가 만료 처리된다.
- **선행 Task**: BE-2, BE-3, DB-3.

### BE-5. 인증/인가 미들웨어
- **수행 작업**: `middlewares/auth.middleware.js`(Access Token 검증, 실패 시 401, 성공 시 `req.user` 설정), `middlewares/admin.middleware.js`(`req.user.role === 'Admin'` 검증, 실패 시 403) 구현.
- **완료 조건**
  - [ ] 토큰 없이 보호 라우트 호출 시 401.
  - [ ] Member 계정으로 Admin 전용 라우트 호출 시 403.
  - [ ] Admin 계정으로 Admin 전용 라우트 호출 시 정상 통과된다.
- **선행 Task**: BE-4.

### BE-6. User API (회원정보 수정, 회원 목록 조회)
- **수행 작업**: `user.service.js`/`user.routes.js`에 `PATCH /users/me`(본인 정보 수정, 소유권은 토큰의 userId로 판단하므로 별도 파라미터 검증 불필요), `GET /users`(Admin 전용, 전체 회원 목록 조회) 구현.
- **완료 조건**
  - [ ] 로그인한 사용자가 자신의 이름 등 정보를 수정하면 DB에 반영되고 `updated_by`/`updated_at`이 본인/현재시각으로 갱신된다.
  - [ ] Member 계정이 `GET /users` 호출 시 403.
  - [ ] Admin 계정이 `GET /users` 호출 시 전체 회원 목록(email/name/role/createdAt)이 반환된다.
- **선행 Task**: BE-5.

### BE-7. Category API (조회 + Admin CRUD + 삭제 재할당)
- **수행 작업**: `category.service.js`/`category.routes.js`에 `GET /categories`(전체 조회, 모든 인증 사용자), `POST/PATCH/DELETE /categories/:id`(Admin 전용) 구현. 삭제 시 참조 중인 `todos.category_id`를 기본 Category로 일괄 재할당하는 로직을 `pg` 트랜잭션(`BEGIN/COMMIT/ROLLBACK`)으로 구현(3-admin-scenario.md 시나리오3, 도메인 8장).
- **완료 조건**
  - [ ] Member 계정도 `GET /categories` 조회는 가능하지만 등록/수정/삭제 시도 시 403.
  - [ ] Admin이 신규 Category 등록 시 `created_by`가 해당 Admin의 `user_id`로 저장된다.
  - [ ] 참조 중인 Todo가 있는 Category를 삭제하면, 해당 Todo들의 `category_id`가 기본 Category로 재할당된 뒤 Category가 삭제된다(트랜잭션 중 하나라도 실패 시 전체 롤백되어 부분 반영되지 않음을 확인).
  - [ ] 기본(`is_default=true`) Category 삭제/수정 시도는 애플리케이션 레벨에서 차단되거나 최소한 기능이 노출되지 않는다(도메인 9장 미정 항목이므로 구현하지 않음을 코드/응답으로 확인).
- **선행 Task**: BE-5.

### BE-8. Todo API (CRUD, 필터링, 완료 토글, 상태 파생)
- **수행 작업**: `utils/todoStatus.js`(시작전/진행중/완료/지연 파생 계산 순수 함수), `todo.service.js`/`todo.routes.js`에 `POST /todos`(등록, Category 미지정 시 기본 자동 지정), `GET /todos`(카테고리/상태 쿼리 파라미터 필터링, 본인 소유만 조회), `PATCH /todos/:id`(수정, 완료 토글 포함), `DELETE /todos/:id`(삭제) 구현. 모든 수정/삭제는 소유권 검증(`todo.user_id === req.user.id`) 후 처리.
- **완료 조건**
  - [ ] `startDate > endDate`로 등록/수정 시도 시 400.
  - [ ] Category 미지정으로 등록 시 `category_id`가 기본 Category로 저장된다.
  - [ ] 동일 사용자가 같은 기간에 여러 Todo를 등록해도 모두 성공한다(1일 다건 허용).
  - [ ] `GET /todos?status=지연` 등 상태 필터 호출 시, `todoStatus.js` 계산 결과와 일치하는 Todo만 반환된다(경계값: startDate=오늘, endDate=오늘, completed=true 케이스 확인).
  - [ ] 타인의 Todo를 수정/삭제 시도 시 403.
  - [ ] 완료 토글(`completed` 반전) 후 재조회 시 상태가 올바르게 재계산되어 반환된다.
- **선행 Task**: BE-7(Category 조회 API 필요), DB-3.

### BE-9. 백엔드 단위 테스트
- **수행 작업**: `5-project-principle.md` 4장에 명시된 핵심 로직 테스트 작성(`node --test` 등 표준 도구 사용, 별도 프레임워크 미도입).
- **완료 조건**
  - [ ] Todo 상태 파생 계산 경계값 테스트(`todoStatus.test.js`)가 작성되고 통과한다.
  - [ ] 소유권 검증(타인 Todo/회원정보 수정 시 403) 테스트가 통과한다.
  - [ ] Category 미지정 시 기본 Category 자동 지정 테스트가 통과한다.
  - [ ] Category 삭제 시 참조 Todo 재할당 테스트가 통과한다.
  - [ ] 회원가입 이메일 중복 체크 테스트가 통과한다.
- **선행 Task**: BE-6, BE-7, BE-8.

---

## 3. Frontend Task

### FE-1. 프론트엔드 프로젝트 초기화 (FSD 스켈레톤)
- **수행 작업**: `frontend/`에 React 19 + TypeScript 프로젝트 생성, `zustand`/`@tanstack/react-query` 설치, `5-project-principle.md` 6장 FSD 디렉토리(`app/pages/widgets/features/entities/shared`) 스켈레톤 생성, `.env.example`(API base URL) 작성.
- **완료 조건**
  - [ ] `npm run dev`로 앱이 빈 화면이라도 정상 기동된다.
  - [ ] `src/` 하위에 `app/pages/widgets/features/entities/shared` 6개 폴더가 존재한다.
  - [ ] TypeScript 컴파일 에러 없이 빌드된다(`tsc --noEmit` 통과).
- **선행 Task**: 없음(BE Task와 병행 가능).

### FE-2. shared 레이어 구현
- **수행 작업**: `shared/api/httpClient.ts`(fetch 래퍼, Authorization 헤더 자동 첨부, 401 응답 시 공통 처리 훅), `shared/ui/{Button,Input,Modal}.tsx`, `shared/lib/{date,validation}.ts`(startDate≤endDate 등 공용 검증), `shared/config/env.ts` 구현.
- **완료 조건**
  - [ ] `httpClient`로 백엔드 `GET /health`(BE-2) 호출 시 정상 응답을 받는다.
  - [ ] 공용 `Button`/`Input`/`Modal` 컴포넌트가 최소 1개 화면에서 실제로 렌더링된다.
  - [ ] `validation` 유틸의 날짜 비교 함수에 대한 간단한 동작 확인(수동 또는 콘솔 테스트)이 완료되었다.
- **선행 Task**: FE-1, BE-2.

### FE-3. entities/session (인증 상태) 및 라우트 보호
- **수행 작업**: `entities/session/model/authStore.ts`(Zustand: accessToken, currentUser, isLoggedIn), `app/ProtectedRoute.tsx`(미인증 시 로그인 화면 리다이렉트), `app/router.tsx` 기본 라우트 골격 구성.
- **완료 조건**
  - [ ] 로그인 전 상태에서 보호된 경로(예: `/todos`) 접근 시 로그인 화면으로 리다이렉트된다.
  - [ ] `authStore`에 저장된 로그인 상태에 따라 네비게이션 노출 여부가 바뀔 준비가 되어 있다(뼈대 확인 수준).
- **선행 Task**: FE-2.

### FE-4. entities/user, entities/category, entities/todo 구현
- **수행 작업**: 각 entity별 `types.ts`(도메인 정의서 용어와 일치하는 타입), `api/*.api.ts`(fetch 함수), `model/use*.ts`(TanStack Query `useQuery`/`useMutation`) 구현. 대상 API: BE-6(user), BE-7(category), BE-8(todo).
- **완료 조건**
  - [ ] `useCategories()` 훅으로 로그인 상태에서 전체 Category 목록을 정상 조회한다.
  - [ ] `useTodos(filter)` 훅으로 카테고리/상태 필터 파라미터에 따라 다른 결과가 조회된다.
  - [ ] `useUsers()`(Admin 전용) 훅이 Member 계정에서는 403을 반환받고, Admin 계정에서는 목록을 반환받는다.
  - [ ] 각 entity의 TypeScript 타입 필드명이 `1-domain-definition.md`/`7-erd.md`와 일치한다(예: `completed`, `categoryId`, `isDefault`).
- **선행 Task**: FE-3, BE-6, BE-7, BE-8.

### FE-5. features/auth 구현
- **수행 작업**: `ui/{LoginForm,SignupForm}.tsx`, `model/{useLogin,useSignup,useLogout,useRefreshToken}.ts` 구현. Access Token 만료(401) 감지 시 `useRefreshToken`으로 자동 재발급 후 원 요청 재시도하는 인터셉터 로직을 `httpClient`(FE-2)와 연동.
- **완료 조건**
  - [ ] 잘못된 이메일 형식 입력 시 클라이언트 단에서 인라인 오류가 표시된다(4-wireframe.md 시나리오1 근거).
  - [ ] 정상 회원가입 → 로그인 → `authStore`에 Access Token 저장까지 수동 시나리오로 확인된다.
  - [ ] Access Token 강제 만료 상태에서 API 호출 시 자동으로 재발급 후 원래 요청이 재시도되어 사용자가 별도 조치 없이 이어서 사용할 수 있다.
  - [ ] 로그아웃 클릭 시 `authStore`가 초기화되고 로그인 화면으로 이동한다.
- **선행 Task**: FE-3, BE-4.

### FE-6. 회원가입/로그인 화면 (pages)
- **수행 작업**: `pages/signup/ui/SignupPage.tsx`, `pages/login/ui/LoginPage.tsx`를 `4-wireframe.md` 1·2번 화면 레이아웃대로 구현, FE-5의 폼/훅과 연결.
- **완료 조건**
  - [ ] 데스크톱/모바일(≤768px) 두 뷰포트에서 와이어프레임과 동일한 레이아웃(중앙 카드, 폭만 축소)으로 렌더링된다.
  - [ ] 회원가입 성공 시 로그인 화면으로 이동, 로그인 성공 시 Todo 목록 화면으로 이동한다.
  - [ ] 인증 실패/중복 이메일 등 에러 메시지가 화면에 노출된다.
- **선행 Task**: FE-5.

### FE-7. widgets/nav-bar 구현
- **수행 작업**: `widgets/nav-bar/ui/NavBar.tsx`를 역할(Member/Admin)에 따라 메뉴가 달라지도록 구현, `4-wireframe.md` 반응형 원칙(모바일 햄버거 메뉴)대로 구현.
- **완료 조건**
  - [ ] Member 로그인 시 "Todo목록/회원정보수정/로그아웃"만 노출된다.
  - [ ] Admin 로그인 시 "회원관리/카테고리관리" 메뉴가 추가로 노출된다.
  - [ ] 모바일 뷰포트(≤768px)에서 햄버거 아이콘 클릭 시 메뉴가 펼쳐지고 다시 탭하면 닫힌다.
- **선행 Task**: FE-3.

### FE-8. Todo 목록 화면 (필터 포함)
- **수행 작업**: `features/todo-filter`(카테고리/상태 필터 UI+상태), `widgets/todo-board`(필터+목록 조합), `pages/todo-list/ui/TodoListPage.tsx` 구현. `4-wireframe.md` 3번 화면(데스크톱 표/모바일 카드) 반영.
- **완료 조건**
  - [ ] 카테고리 필터, 상태 필터(전체/시작전/진행중/완료/지연) 선택 시 목록이 즉시 갱신된다.
  - [ ] 필터 결과가 없을 때 "표시할 Todo가 없습니다" 문구가 노출된다(에러 아님).
  - [ ] 데스크톱은 표 형태, 모바일은 카드 스택으로 각각 렌더링된다.
  - [ ] 미인증 상태로 직접 URL 접근 시 로그인 화면으로 리다이렉트된다.
- **선행 Task**: FE-4, FE-7.

### FE-9. Todo 등록/편집 화면
- **수행 작업**: `features/todo-create-edit/ui/TodoForm.tsx`(등록/편집 공용 폼: 제목/카테고리/시작일·종료일 캘린더/메모), `pages/todo-create`, `pages/todo-edit` 구현. `4-wireframe.md` 4·5번 화면(데스크톱 모달/모바일 전체화면) 반영.
- **완료 조건**
  - [ ] `startDate > endDate` 입력 시 등록/저장 버튼 클릭 전후로 인라인 오류 메시지가 노출된다.
  - [ ] Category 미선택 상태로 등록해도 정상 등록되고, 조회 시 기본 Category로 표시된다.
  - [ ] 편집 화면 진입 시 기존 값이 폼에 프리필된다.
  - [ ] 데스크톱은 모달, 모바일은 전체화면 폼으로 각각 렌더링된다.
- **선행 Task**: FE-8.

### FE-10. Todo 완료 토글 / 삭제 기능
- **수행 작업**: `features/todo-toggle-complete`, `features/todo-delete`의 `model` 훅을 `TodoItem`(entities/todo)과 연결, 목록 화면(FE-8)에서 체크박스/삭제 버튼 동작 구현.
- **완료 조건**
  - [ ] 체크박스 클릭 시 즉시 완료/미완료로 토글되고 상태(진행중/완료/지연 등) 표시가 갱신된다.
  - [ ] 삭제 클릭(확인 후) 시 목록에서 해당 항목이 즉시 사라진다.
  - [ ] 타인의 Todo에 대한 조작 버튼은애초에 노출되지 않는다(본인 목록만 조회되므로 자연히 충족, 확인만).
- **선행 Task**: FE-8.

### FE-11. 회원정보 수정 화면
- **수행 작업**: `features/profile-edit/ui/ProfileForm.tsx`, `pages/profile/ui/ProfilePage.tsx` 구현. `4-wireframe.md` 6번 화면 반영.
- **완료 조건**
  - [ ] 이메일은 읽기 전용으로 표시되고 수정 불가하다.
  - [ ] 이름 등 항목 변경 후 저장 시 성공 메시지와 함께 최신 값이 반영된다.
  - [ ] 미인증 상태 접근 시 로그인 화면으로 리다이렉트된다.
- **선행 Task**: FE-4, FE-7.

### FE-12. 관리자 - 카테고리 관리 화면
- **수행 작업**: `features/category-manage`(등록/수정/삭제 폼+훅), `pages/admin-category/ui/AdminCategoryPage.tsx` 구현. `4-wireframe.md` 8번 화면(데스크톱 표/모바일 카드) 반영.
- **완료 조건**
  - [ ] Admin 계정에서만 이 화면 메뉴가 노출되고, Member 계정으로 URL 직접 접근 시 접근이 차단된다(403 처리 또는 리다이렉트).
  - [ ] 신규 Category 등록 시 목록에 즉시 반영된다.
  - [ ] Category 삭제 시 "참조 중인 Todo는 기본으로 재할당됩니다" 안내가 노출되고, 삭제 후 실제로 해당 Todo들이 기본 Category로 표시된다(Todo 목록 화면에서 교차 확인).
  - [ ] 기본 Category 행에는 수정/삭제 액션이 비활성화되어 있다.
- **선행 Task**: FE-7, BE-7.

### FE-13. 관리자 - 회원 목록 화면
- **수행 작업**: `pages/admin-user-list/ui/AdminUserListPage.tsx` 구현(entities/user의 `useUsers` 활용). `4-wireframe.md` 7번 화면 반영.
- **완료 조건**
  - [ ] Admin 계정 로그인 시 전체 회원(이메일/이름/역할/가입일) 목록이 표 형태(데스크톱)/카드형(모바일)로 표시된다.
  - [ ] 수정/삭제 액션이 화면에 존재하지 않는다(범위 밖).
  - [ ] Member 계정으로 URL 직접 접근 시 접근이 차단된다.
- **선행 Task**: FE-7, FE-4.

### FE-14. 반응형/예외 흐름 통합 점검
- **수행 작업**: 전체 8개 화면을 데스크톱(>1024px)/모바일(<768px) 두 뷰포트에서 수동 점검, 401(미인증)/403(권한없음) 리다이렉트 및 폼 인라인 에러 메시지를 `3-user-scenario.md`/`3-admin-scenario.md`의 Alternative/Exception Flow와 대조 확인.
- **완료 조건**
  - [ ] 8개 화면 모두 두 뷰포트에서 `4-wireframe.md` 레이아웃과 어긋나지 않음을 확인했다.
  - [ ] 두 시나리오 문서에 정의된 모든 예외 흐름(401/403/유효성오류/중복이메일 등)이 실제 화면에서 재현·확인되었다.
  - [ ] 접근성(a11y)은 PRD 범위 제외에 따라 별도 점검하지 않았음을 확인했다(의도적 생략).
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
