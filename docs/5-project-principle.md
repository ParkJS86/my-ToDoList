# my-ToDoList 프로젝트 구조 설계 원칙

## 버전 이력
| 버전 | 요약 내용 | 근거/출처 | 날짜 |
|---|---|---|---|
| 1.0 | 최초 작성: 최상위 원칙, 의존성/레이어 원칙, 코드/네이밍 원칙, 테스트/품질 원칙, 설정/보안/운영 원칙, 프론트/백엔드 디렉토리 구조 | 1-domain-definition.md, 2-prd.md, 3-user-scenario.md, 3-admin-scenario.md, 4-wireframe.md | 2026-08-26 |
| 1.1 | 5장에 로깅/에러 핸들링 미들웨어 원칙 추가(요청 로거·중앙 에러 핸들러 역할, 미들웨어 등록 순서, 표준 에러 응답 포맷) | 사용자 요청 | 2026-08-26 |
| 1.2 | 프론트엔드 레이어(2장)와 디렉토리 구조(6장)를 FSD(Feature-Sliced Design, app/pages/widgets/features/entities/shared)로 전면 재구성. 기존 api/hooks/store/components 평면 구조를 슬라이스+세그먼트 구조로 대체 | 사용자 요청 | 2026-08-26 |

## 문서 개요
- 목적: PRD(`2-prd.md`)에 확정된 기술스택(React 19 + TypeScript + Zustand + TanStack Query / Node.js + Express + pg / PostgreSQL 17)과 2일 일정·1인 개발 제약 하에서, 실제 코드를 작성할 때 따를 구조/네이밍/테스트/보안 원칙을 정의한다.
- 이 문서는 새로운 규칙을 만들지 않으며, 도메인 정의서/PRD/시나리오/와이어프레임에 이미 정해진 내용을 "어떻게 코드로 옮길지" 구체화한 것이다. 충돌 시 항상 도메인 정의서 > PRD > 본 문서 순으로 우선한다.

---

## 1. 모든 스택에 공통인 최상위 원칙

1인 개발자가 2일 안에 MVP를 완성해야 하므로, 아래 원칙은 전부 "빠르고 정확하게 끝내기"를 위한 수단이다.

- **YAGNI**: PRD 3.2 확장 범위(소셜 로그인, Redis 캐시, 서버측 Refresh Token 블랙리스트, 관리자 대시보드 등)에 대비한 코드/설정/추상화를 미리 만들지 않는다. 지금 필요한 3개 테이블, 지금 필요한 API만 구현한다.
- **관심사 분리, 최소 레이어**: PRD 6장 유지보수성 원칙에 따라 라우트-서비스-쿼리(백엔드), UI-상태-서버동기화(프론트) 정도로만 나눈다. 그 이상의 레이어(도메인 모델 클래스, 리포지토리 인터페이스 추상화 등)는 만들지 않는다. 단, DB의 snake_case 컬럼을 API 응답의 camelCase 필드로 바꿔주는 최소한의 `xxxDto.js` 변환 함수(예: `userDto.js`, `categoryDto.js`, `todoDto.js`)는 허용한다 — 클래스나 별도 계층이 아닌 순수 변환 함수 하나로 유지한다.
- **일관성 > 개인 취향**: 한 번 정한 네이밍/폴더 구조/에러 응답 포맷은 프로젝트 전체에서 동일하게 반복한다. 새 기능을 추가할 때 기존 패턴을 복사해서 쓰는 것이 가장 빠르다.
- **문서-코드 정합성**: 코드의 엔티티명·필드명·상태값은 도메인 정의서 2장 용어와 반드시 일치시킨다(예: `completed`, `categoryId`, `isDefault`, Role `Member`/`Admin`). 구현 중 도메인 문서와 다르게 갈 수밖에 없다면 코드보다 먼저 문서를 고치지 않는다 — 2일 일정에서는 문서를 다시 쓸 시간이 없으므로, 애초에 문서 용어를 그대로 코드에 옮긴다.
- **가짜 확장성 금지**: "나중에 마이크로서비스로 쪼갤 수도 있으니" 같은 이유로 미리 서비스 경계를 나누거나 이벤트 버스를 두지 않는다. PRD 4.2가 명시하듯 단일 Express + 단일 PostgreSQL로 시작하고 끝낸다.
- **파생 데이터는 저장하지 않는다**: Todo 상태(시작전/진행중/완료/지연)는 도메인 정의서 5장대로 저장 필드가 아니라 조회 시점 계산 값이다. 상태 갱신 배치, 상태 컬럼, 상태 동기화 로직은 만들지 않는다.

## 2. 의존성/레이어 원칙

### 프론트엔드: FSD(Feature-Sliced Design) 레이어
6장 디렉토리 구조와 동일하게 `app → pages → widgets → features → entities → shared` 6개 레이어로 나눈다. 각 레이어는 슬라이스(도메인/기능 단위 폴더)로 다시 나뉘고, 슬라이스 내부는 역할별 세그먼트(`ui/`, `model/`, `api/`)로 구성한다.

- **app**: 앱 초기화, 전역 Provider(TanStack QueryClient, 라우터), 전역 스타일. 비즈니스 로직 없음.
- **pages**: 와이어프레임 8개 화면과 1:1 대응하는 라우트 단위. 하위 레이어(widgets/features/entities/shared)를 조합만 하고, 자체 비즈니스 로직은 두지 않는다.
- **widgets**: 여러 화면에서 재사용되는 복합 UI 블록(상단 네비게이션, Todo 목록+필터 조합 등). 여러 feature/entity를 조합할 수 있다.
- **features**: 사용자 행동 단위 기능(로그인, Todo 등록/수정, 완료 토글, 삭제, 필터링, Category 관리 등). 각 feature는 자신의 `ui/`(폼·버튼), `model/`(로컬 상태·mutation 훅)을 가진다.
- **entities**: 도메인 정의서의 User/Category/Todo(및 인증 세션)에 대응하는 최소 단위 — 타입, 조회 API(`useQuery`), 표시용 UI(카드/행 하나). 비즈니스 규칙(소유권 검증 등)은 여기 두지 않고 백엔드/features에 둔다.
- **shared**: 어떤 도메인에도 속하지 않는 범용 코드 — API 클라이언트 베이스, 공용 UI 컴포넌트(Button/Input), 유틸, 환경설정.
- **의존 방향(FSD 핵심 규칙)**: 상위 레이어만 하위 레이어를 import할 수 있다(`app → pages → widgets → features → entities → shared`). 같은 레이어의 슬라이스끼리는 서로 import하지 않는다(예: `features/auth`가 `features/todo-create`를 import 금지). 역방향(하위가 상위를 import) 금지.
- **Zustand 위치**: 서버에 없는 클라이언트 전역 상태(Access Token, 로그인 사용자, UI 필터 선택값)는 `entities/session`(인증) 또는 해당 feature의 `model/`에 둔다. Todo/Category/User 서버 데이터는 Zustand에 넣지 않고 TanStack Query 캐시만 사용한다(상태 이중 관리 금지).
- **2일 일정 실용화**: FSD의 슬라이스별 `index.ts`(public API) 배럴 파일 강제, ESLint 레이어 경계 강제 플러그인 도입 등은 시간이 남으면 추가하고, MVP에서는 폴더 구조와 import 방향 규칙만 사람이 지키는 수준으로 시작한다(YAGNI).

### 백엔드: 라우트 - 서비스 - 쿼리 3계층
- **라우트(routes/)**: HTTP 요청/응답, 입력 유효성 검증(예: startDate ≤ endDate), 인증/권한 미들웨어 연결만 담당. 비즈니스 로직을 두지 않는다.
- **서비스(services/)**: 비즈니스 로직 전담 — 소유권 검증, 기본 Category 자동 지정, Category 삭제 시 Todo 재할당, 상태 파생 계산 등 도메인 정의서 6장 규칙이 여기 모인다.
- **쿼리(queries/ 또는 각 서비스 내 db 함수)**: pg를 이용한 SQL 실행만 담당. 여기서 비즈니스 판단(권한 체크 등)을 하지 않는다.
- **의존 방향**: `routes → services → queries → pg Pool`. 역방향 금지(쿼리 계층이 서비스를 호출하거나, 라우트가 쿼리를 직접 호출하지 않는다).
- **Prisma 미사용에 따른 쿼리 계층 원칙**(PRD 4.1):
  - 모든 SQL은 파라미터 바인딩(`$1, $2 …`)으로 작성한다. 문자열 concat으로 값 삽입 금지(SQL 인젝션 방지, PRD 6장).
  - 쿼리 함수는 테이블당 하나의 모듈로 모은다(`todo.queries.js`, `category.queries.js`, `user.queries.js`). ORM이 주는 타입 안전성이 없으므로, 쿼리 함수의 입력/출력 형태를 함수 상단 주석 한 줄로 명시한다(예: `-- returns: {id, userId, categoryId, title, ...}`).
  - 스키마 변경은 `migrations/` 폴더의 순번이 매겨진 `.sql` 파일로만 관리하고, 애플리케이션 코드에서 스키마를 암묵적으로 바꾸지 않는다(ORM의 auto-migrate 없음).
  - 트랜잭션이 필요한 로직(예: Category 삭제 + Todo 일괄 재할당)은 서비스 계층에서 `pg` 클라이언트를 꺼내 `BEGIN/COMMIT/ROLLBACK`으로 직접 감싸고, 쿼리 함수는 트랜잭션 여부를 모르게 클라이언트(`client` 또는 `pool`)를 인자로 받는 형태로 작성한다.

## 3. 코드/네이밍 원칙

도메인 정의서 2장 용어(User/Category/Todo, completed 등)를 그대로 코드 전반에 사용한다. 번역하거나 축약하지 않는다(예: `todo`를 `task`로 바꾸지 않음).

| 대상 | 컨벤션 | 예시 |
|---|---|---|
| DB 테이블명 | 스네이크케이스, 복수형 | `users`, `categories`, `todos` |
| DB 컬럼명 | 스네이크케이스 | `user_id`, `category_id`, `is_default`, `completed`, `start_date`, `end_date`, `created_at`, `updated_at`, `created_by` |
| 백엔드 파일명 | 케밥/도메인명.역할.js | `todo.routes.js`, `todo.service.js`, `todo.queries.js`, `auth.middleware.js` |
| 백엔드 함수/변수명 | camelCase, DB 컬럼과 매핑 시 그대로 camelCase 변환 | `getTodosByUserId`, `categoryId`, `isDefault` |
| API 응답 JSON 필드 | camelCase (DB snake_case → API 응답에서 camelCase로 매핑) | `{ id, userId, categoryId, startDate, endDate, completed, status }` |
| 프론트 컴포넌트 파일/명 | PascalCase | `TodoList.tsx`, `TodoForm.tsx`, `CategoryFilter.tsx` |
| 프론트 훅 파일/명 | camelCase, `use` 접두사 | `useTodos.ts`, `useAuthStore.ts` |
| 프론트 변수/함수명 | camelCase | `handleToggleComplete`, `selectedCategoryId` |
| 상태(Status) 값 | 도메인 정의서 5장 한글 라벨을 그대로 코드 상수 키로 매핑 | `'PENDING' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'` (표시 시 시작전/진행중/완료/지연으로 매핑) |
| Role 값 | 도메인 정의서 2장 표기 그대로 | `'Member' | 'Admin'` |

- 약어 남발 금지: `usr`, `cat`, `tdo` 같은 축약 대신 `user`, `category`, `todo` 전체 표기 사용.
- 불리언은 `is/has` 접두사(`isDefault`, `completed`는 도메인 정의서 원 필드명을 그대로 유지하여 예외로 둔다).

## 4. 테스트/품질 원칙

2일 일정 + 1인 개발 제약(PRD 8장 리스크)을 그대로 인정하고, "커버리지 숫자"가 아니라 "핵심 비즈니스 로직 회귀 방지"에만 테스트 시간을 쓴다.

- **80% 커버리지 등 수치 목표는 강요하지 않는다.** 대신 아래 항목만 테스트한다(백엔드 서비스 계층 단위 테스트 위주):
  - Todo 상태 파생 계산 로직(도메인 5장: 시작전/진행중/완료/지연 4가지 경계값 — startDate=오늘, endDate=오늘, completed=true 등)
  - startDate ≤ endDate 유효성 검증
  - 소유권 검증(타인 Todo/회원정보 수정·삭제 시 403)
  - Category 미지정 시 기본 Category 자동 지정
  - Category 삭제 시 참조 Todo의 기본 Category 재할당
  - 회원가입 이메일 중복 체크
- **하지 않는 것**: UI 컴포넌트 스냅샷 테스트, E2E 테스트 자동화, 프론트 상태관리(Zustand/TanStack Query) 자체에 대한 테스트, 100% 브랜치 커버리지 추구. 시간이 남으면 추가하되 MVP 완료를 우선한다.
- **수동 검증으로 대체 가능한 항목**: 반응형 레이아웃, 401/403 리다이렉트 UX, 폼 인라인 에러 메시지 — 와이어프레임 기준 눈으로 확인.
- 테스트 프레임워크는 새로 고르지 않고 Node 생태계 표준(예: `node --test` 또는 이미 있는 최소 도구)으로 처리해 셋업 시간을 줄인다.

## 5. 설정/보안/운영 원칙 (PRD 4/6장 기반)

- **환경변수**: `.env`로 관리하고 `.gitignore`에 포함한다. 최소 항목: `POSTGRES_CONNECTION_STRING`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`(예: 15m), `REFRESH_TOKEN_EXPIRES_IN`(예: 7d), `PORT`, `CORS_ORIGIN`(콤마로 구분된 허용 origin 목록). `.env.example`을 함께 커밋해 재현 가능하게 한다.
- **비밀번호**: bcrypt로 해시 저장(PRD 4.1, 시나리오 1). 평문 비밀번호는 로그에도 남기지 않는다.
- **JWT Access/Refresh Token**:
  - Access Token은 단기(예: 15분), API 요청 시 `Authorization: Bearer` 헤더로 전달.
  - Refresh Token은 장기(예: 7일), httpOnly 쿠키로만 저장(PRD 6장 — XSS로부터 탈취 방지).
  - Access Token 만료(401) → 클라이언트가 Refresh Token으로 재발급 요청 → 재발급 실패 시 로그인 화면으로(시나리오 3).
  - 서버측 Refresh Token 블랙리스트/무효화는 PRD 3.2 확장 범위이므로 MVP에서 구현하지 않는다. 로그아웃은 쿠키 삭제로 처리.
- **인가**: 모든 보호 라우트에 인증 미들웨어(JWT 검증) 적용 → 미인증 401. Role 검증이 필요한 라우트(Category 등록/수정/삭제, 회원 목록 조회)에는 별도 Admin 전용 미들웨어 적용 → 권한 없음 403. 소유권 검증(Todo/회원정보 수정·삭제)은 서비스 계층에서 `resource.userId === req.user.id` 비교로 처리한다.
- **입력 검증**: 라우트 계층에서 요청 바디 형식(이메일 정규식, 필수 필드, 날짜 형식) 검증 후 서비스로 전달. SQL은 항상 파라미터 바인딩 사용.
- **커넥션 풀**: `pg.Pool` 하나를 앱 시작 시 생성해 재사용, `max: 20` 내외(PRD 4.2). 요청마다 새 커넥션을 만들지 않는다.
- **인덱스**: `users.email`(UNIQUE), `todos.user_id`, `todos.category_id`에 기본 인덱스만 적용(PRD 4.2) — 그 이상 최적화하지 않는다.
- **헬스체크**: `GET /health`로 DB 연결 여부만 확인하는 엔드포인트 하나만 둔다. 별도 메트릭 수집기(Prometheus 등)는 도입하지 않는다.
- **CORS**: 별도 라이브러리(`cors` 패키지) 없이 최소 미들웨어로 처리한다. `CORS_ORIGIN` 환경변수(콤마 구분 다중 origin 허용)에 등록된 origin만 `Access-Control-Allow-Origin`으로 반영하고, Refresh Token 쿠키 전달을 위해 `Access-Control-Allow-Credentials: true`를 함께 설정한다(이 경우 와일드카드 `*` 사용 불가).
- **API 문서**: 개발환경(`NODE_ENV!=='production'`)에서만 `GET /api-docs`(swagger-ui-express)로 `swagger.json`을 노출한다. 운영환경에서는 등록하지 않는다.

### 로깅/에러 핸들링 미들웨어
비즈니스 로직(서비스 계층)이 로깅·에러 응답 형식까지 신경 쓰지 않도록, Express 미들웨어 2개로 관심사를 분리한다. 둘 다 `app.js`에서 라우트 전/후에 각각 등록한다.

- **요청 로거 미들웨어(`requestLogger.js`, 모든 라우트보다 먼저 등록)**: 요청마다 메서드/경로/상태코드/응답시간/(로그인 상태면) `userId`를 한 줄로 남긴다. 비밀번호·토큰 등 민감정보는 로그에 남기지 않는다. 별도 로깅 라이브러리(winston 등) 도입 없이 `res.on('finish')` 훅으로 로그 라인을 만들고, `NODE_ENV`로 출력 대상만 분기한다: 개발환경(`development`)은 `console.log`, 운영환경(`production`)은 날짜별 로그 파일(`logs/app_YYYY-MM-DD.log`, 자정이 지나면 새 날짜 파일에 append)에 기록한다.
- **중앙 에러 핸들러 미들웨어(`errorHandler.js`, 모든 라우트 뒤에 마지막으로 등록)**: 라우트/서비스에서 발생한 모든 에러(동기 throw, `next(err)`로 전달된 에러)를 여기서 한 곳으로 모아 처리한다. 개별 라우트/서비스는 `try/catch`로 응답 포맷을 직접 만들지 않고, 의미 있는 에러 객체(`status`, `message` 포함)를 만들어 `throw` 또는 `next(err)`로 위임한다.
  - 표준 에러 응답 포맷: `{ "error": { "message": string, "status": number } }` — 프론트/모든 시나리오 문서(3-user-scenario.md, 3-admin-scenario.md)의 401/403/유효성오류 응답과 형식을 통일한다.
  - 상태코드 매핑: 인증 실패/미인증(도메인 8장) → 401, 권한 없음(소유권 위반, Admin 전용 API 호출) → 403, 입력 유효성 오류(이메일 형식, startDate>endDate, 이메일 중복) → 400, 존재하지 않는 리소스 → 404, 그 외 예기치 못한 에러 → 500(내부 상세 메시지는 응답에 노출하지 않고 서버 로그에만 기록).
  - 5xx 에러는 요청 로거와 별도로 스택 트레이스까지 콘솔에 남긴다(운영 중 원인 추적용, 별도 에러 수집 서비스는 MVP 범위 밖).
- **등록 순서**: `express.json() → requestLogger → routes(auth/user/todo/category) → errorHandler`. `errorHandler`는 항상 마지막(4개 인자 `(err, req, res, next)` 시그니처)에 두어 이전 모든 미들웨어/라우트의 에러를 수집한다.

## 6. 프론트엔드 디렉토리 구조 (FSD: Feature-Sliced Design)

```
frontend/
├── src/
│   ├── app/                          # 앱 전역 초기화 (비즈니스 로직 없음)
│   │   ├── providers/
│   │   │   └── queryClient.ts        # TanStack QueryClient 설정
│   │   ├── router.tsx                # 라우트 ↔ pages 매핑
│   │   ├── ProtectedRoute.tsx        # entities/session 상태로 미인증(401) 시 로그인 화면 리다이렉트
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── pages/                        # 와이어프레임 8개 화면과 1:1 대응 (조합만, 로직 없음)
│   │   ├── signup/ui/SignupPage.tsx
│   │   ├── login/ui/LoginPage.tsx
│   │   ├── todo-list/ui/TodoListPage.tsx
│   │   ├── todo-create/ui/TodoCreatePage.tsx
│   │   ├── todo-edit/ui/TodoEditPage.tsx
│   │   ├── profile/ui/ProfilePage.tsx
│   │   ├── admin-user-list/ui/AdminUserListPage.tsx
│   │   └── admin-category/ui/AdminCategoryPage.tsx
│   │
│   ├── widgets/                      # 여러 화면에서 재사용되는 복합 블록
│   │   ├── nav-bar/ui/NavBar.tsx     # 반응형 상단 네비게이션(햄버거 메뉴 포함)
│   │   └── todo-board/ui/TodoBoard.tsx  # 필터 + 목록 조합(todo-filter feature + todo entity 사용)
│   │
│   ├── features/                     # 사용자 행동 단위 기능
│   │   ├── auth/
│   │   │   ├── ui/{LoginForm,SignupForm}.tsx
│   │   │   └── model/{useLogin,useSignup,useLogout,useRefreshToken}.ts
│   │   ├── todo-create-edit/
│   │   │   ├── ui/TodoForm.tsx       # 등록/편집 공용 폼
│   │   │   └── model/useTodoMutation.ts
│   │   ├── todo-toggle-complete/model/useToggleComplete.ts
│   │   ├── todo-delete/model/useDeleteTodo.ts
│   │   ├── todo-filter/
│   │   │   ├── ui/TodoFilter.tsx     # 카테고리/상태 필터
│   │   │   └── model/useTodoFilterState.ts
│   │   ├── profile-edit/ui/ProfileForm.tsx
│   │   └── category-manage/          # Admin 전용: 등록/수정/삭제
│   │       ├── ui/CategoryForm.tsx
│   │       └── model/useCategoryMutation.ts
│   │
│   ├── entities/                     # 도메인 정의서 User/Category/Todo 최소 단위
│   │   ├── session/
│   │   │   └── model/authStore.ts    # Zustand: accessToken, currentUser, isLoggedIn
│   │   ├── todo/
│   │   │   ├── api/todo.api.ts       # fetch 함수(순수 서버 통신)
│   │   │   ├── model/useTodos.ts     # useQuery/useMutation 훅
│   │   │   ├── ui/TodoItem.tsx       # Todo 한 건 표시
│   │   │   └── types.ts              # Todo, TodoStatus 타입
│   │   ├── category/
│   │   │   ├── api/category.api.ts
│   │   │   ├── model/useCategories.ts
│   │   │   └── types.ts
│   │   └── user/
│   │       ├── api/user.api.ts       # 회원정보 수정, 회원 목록(Admin)
│   │       ├── model/useUsers.ts
│   │       └── types.ts              # User, Role 타입
│   │
│   └── shared/                       # 어떤 도메인에도 속하지 않는 범용 코드
│       ├── api/httpClient.ts         # fetch 래퍼(Authorization 헤더, 401 처리 공통화)
│       ├── ui/{Button,Input,Modal}.tsx
│       ├── lib/{date,validation}.ts  # startDate≤endDate 등 공용 유틸
│       └── config/env.ts
│
├── .env.example
├── package.json
└── tsconfig.json
```

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── routes/                 # HTTP 라우팅 + 입력 검증 + 미들웨어 연결만
│   │   ├── auth.routes.js      # 회원가입/로그인/재발급/로그아웃
│   │   ├── user.routes.js      # 회원정보 수정, 회원 목록(Admin)
│   │   ├── todo.routes.js      # Todo CRUD, 필터 조회
│   │   └── category.routes.js  # Category 조회/CRUD(Admin)
│   ├── services/                # 비즈니스 로직 (도메인 6장 규칙 구현 위치)
│   │   ├── auth.service.js      # bcrypt 해시, JWT 발급/검증
│   │   ├── user.service.js      # 본인 확인, 회원 목록
│   │   ├── todo.service.js      # 소유권 검증, 상태 파생 계산, 기본 카테고리 지정
│   │   └── category.service.js  # Admin 검증, 삭제 시 Todo 재할당 트랜잭션
│   ├── queries/                 # pg 직접 SQL (파라미터 바인딩만 사용)
│   │   ├── user.queries.js
│   │   ├── todo.queries.js
│   │   └── category.queries.js
│   ├── middlewares/
│   │   ├── auth.middleware.js   # JWT 검증 → 401
│   │   ├── admin.middleware.js  # Role=Admin 검증 → 403
│   │   ├── cors.js              # CORS_ORIGIN 기반 CORS 헤더 설정
│   │   ├── requestLogger.js     # 요청 단위 로그(메서드/경로/상태코드/응답시간)
│   │   └── errorHandler.js      # 중앙 에러 핸들러, 표준 에러 응답 포맷 통일
│   ├── db/
│   │   └── pool.js              # pg.Pool 단일 인스턴스
│   ├── migrations/              # 순번 매긴 순수 SQL 마이그레이션
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_categories.sql
│   │   ├── 003_create_todos.sql
│   │   └── seed.sql
│   ├── utils/
│   │   ├── jwt.js               # Access/Refresh 토큰 sign/verify
│   │   ├── todoStatus.js        # 도메인 5장 상태 파생 계산 함수(순수 함수, 단위테스트 대상)
│   │   ├── userDto.js           # User row(snake_case) → API 응답(camelCase) 변환
│   │   ├── categoryDto.js       # Category row → API 응답 변환
│   │   └── todoDto.js           # Todo row → API 응답 변환(status 파생 포함)
│   ├── app.js                   # Express 앱 조립(라우트/미들웨어 등록)
│   └── server.js                # 서버 기동, /health 엔드포인트
├── test/                        # Task ID 기준 파일명(node:test, node --test로 자동탐색)
│   ├── be1-scaffold.test.js
│   ├── be3-middlewares.test.js
│   ├── be4-auth.test.js
│   ├── be5-auth-middleware.test.js
│   ├── be6-user.test.js
│   ├── be7-category.test.js
│   ├── be8-todo.test.js
│   └── todoStatus.test.js
├── .env.example
└── package.json
```
