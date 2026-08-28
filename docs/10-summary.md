# my-ToDoList 프로젝트 진행 히스토리

## 문서 개요
- 목적: 프로젝트 시작(2026-08-25)부터 현재까지 진행된 모든 작업을 시간순으로 정리해 히스토리 추적 자료로 활용한다.
- 근거: `docs/8-plan.md` 버전 이력, git 커밋 로그, 세션 내 실제 작업 내용.
- 표 컬럼 설명
  - **구분**: 환경설정 / 소스코드 / 테스트 / 문서 / 배포 중 해당 작업의 성격
  - **영역**: DB / Backend / Frontend / Docs / Infra(배포·인프라) 중 적용 대상

---

## 히스토리 표

| 번호 | 날짜 | 영역 | 구분 | 작업내용 |
|---|---|---|---|---|
| 1 | 2026-08-25 | Docs | 환경설정 | 리포지토리 초기 커밋 |
| 2 | 2026-08-26 | Docs | 문서 | 도메인 정의서(`1-domain-definition.md`), PRD(`2-prd.md`), 사용자/관리자 시나리오(`3-user-scenario.md`, `3-admin-scenario.md`) 작성 |
| 3 | 2026-08-26 | Docs | 문서 | 와이어프레임(`4-wireframe.md`), 프로젝트 구조 설계 원칙(`5-project-principle.md`), 아키텍처(`6-arch.md`), ERD(`7-erd.md`), 실행계획(`8-plan.md`), DB 스키마 DDL(`schema.sql`), API 명세(`swagger.json`) 작성 |
| 4 | 2026-08-26 | Docs | 문서 | 최상위 `CLAUDE.MD` 작성(프로젝트 지침, 참조 문서 인덱스) |
| 5 | 2026-08-26 | DB | 문서 | `8-plan.md` 완료조건 표시 규칙 추가(🟢/🔴), DB-1 완료 표시 |
| 6 | 2026-08-26 | DB | 환경설정 | DB-2: `my_todolist` DB 생성, 마이그레이션 3개 파일 적용, `backend/.env` 접속 문자열 갱신 |
| 7 | 2026-08-26 | DB | 소스코드 | DB-3: `backend/src/migrations/seed.sql` 작성(pgcrypto bcrypt 해시, ON CONFLICT DO NOTHING), Admin 계정 1건·기본 Category 1건 생성 |
| 8 | 2026-08-26 | Backend | 환경설정 | BE-1: `package.json`/디렉토리 뼈대/`.env.example` 생성, npm install |
| 9 | 2026-08-26 | Backend | 테스트 | BE-1: 검증 테스트 27건 작성 및 전체 통과(node --test) |
| 10 | 2026-08-27 | Backend | 소스코드 | BE-2: `db/pool.js`(pg.Pool), `GET /health`(SELECT 1) 구현 |
| 11 | 2026-08-27 | Backend | 소스코드 | BE-3 로그 방식 변경: 개발환경 콘솔 / 운영환경 파일(logs/app_YYYY-MM-DD.log) 분기 |
| 12 | 2026-08-27 | Backend | 소스코드 | BE-3: `middlewares/requestLogger.js`, `middlewares/errorHandler.js` 구현, 미들웨어 등록 순서 확정 |
| 13 | 2026-08-27 | Backend | 테스트 | BE-3: 검증 테스트 11건 추가(누적 38건 통과) |
| 14 | 2026-08-27 | Backend | 소스코드 | BE-4: `utils/jwt.js`, `queries/user.queries.js`, `services/auth.service.js`, `routes/auth.routes.js` 구현(signup/login/refresh/logout, 쿠키 파싱 직접구현) |
| 15 | 2026-08-27 | Backend | 테스트 | BE-4: 검증 테스트 추가(누적 53건 통과) |
| 16 | 2026-08-27 | Backend | 소스코드 | BE-5: `middlewares/auth.middleware.js`(Bearer 토큰 검증), `middlewares/admin.middleware.js`(Admin 검증) 구현 |
| 17 | 2026-08-27 | Backend | 테스트 | BE-5: 검증 테스트 추가(누적 62건 통과) |
| 18 | 2026-08-27 | Backend | 소스코드 | BE-6: `user.queries.js` updateUser/findAllUsers 추가, `utils/userDto.js` 공용화, User API(`PATCH /users/me`, `GET /users`) 구현 |
| 19 | 2026-08-27 | Backend | 테스트 | BE-6: 검증 테스트 추가(누적 71건 통과) |
| 20 | 2026-08-27 | Backend | 소스코드 | BE-7: Category API(`GET/POST/PATCH/DELETE /categories`) 구현, 삭제 시 트랜잭션으로 기본 Category 재할당 |
| 21 | 2026-08-27 | Backend | 테스트 | BE-7: 검증 테스트 추가(누적 89건 통과) |
| 22 | 2026-08-27 | Backend | 소스코드 | BE-8: Todo API(`POST/GET/PATCH/DELETE /todos`) 구현, 상태 파생 로직(`utils/todoStatus.js`) |
| 23 | 2026-08-27 | Backend | 소스코드 | BE-8 버그수정: `toYMD` 타임존 버그(KST 환경 DATE 하루 당겨짐, 3개 파일 중복 정의) 발견 및 로컬 타임존 기준으로 수정 |
| 24 | 2026-08-27 | Backend | 테스트 | BE-8: 검증 테스트 추가(누적 117건 통과) |
| 25 | 2026-08-27 | Backend | 테스트 | BE-9: 기존 테스트가 완료조건 5건을 모두 커버함을 확인, 신규 코드 없이 117건 재검증 |
| 26 | 2026-08-27 | Frontend | 환경설정 | FE-1: Vite React19+TS 프로젝트 생성, zustand/@tanstack/react-query/react-router-dom 설치, FSD 6개 디렉토리 스켈레톤, `.env.example` 작성 |
| 27 | 2026-08-27 | Frontend | 테스트 | FE-1: 스캐폴딩 검증 테스트 17건 통과, `npm run dev` 기동 확인 |
| 28 | 2026-08-27 | Frontend | 소스코드 | FE-2: `shared/config/env.ts`, `shared/lib/{logger,date}.ts`, `shared/api/httpClient.ts`, `shared/ui/{Button,Input,Modal}.tsx`, `app/styles/tokens.css`(다크 테마) 구현 |
| 29 | 2026-08-27 | Frontend | 소스코드 | FE-2 버그수정: tokens.css가 body에 미적용되던 문제(import 순서/전역 배경 미지정) 수정 |
| 30 | 2026-08-27 | Frontend | 테스트 | FE-2: 검증 테스트 29건 통과 |
| 31 | 2026-08-27 | Frontend | 소스코드 | FE-3: `entities/session/model/authStore.ts`(Zustand), `ProtectedRoute.tsx`, `router.tsx`, 로그인/Todo목록 placeholder 구현 |
| 32 | 2026-08-27 | Frontend | 테스트 | FE-3: 4건은 `import.meta.env` 제약으로 node:test skip, Playwright로 대체 검증 |
| 33 | 2026-08-27 | Frontend | 소스코드 | FE-4: `app/providers/queryClient.ts`, `entities/{user,category,todo}` types/api/model 구현 |
| 34 | 2026-08-27 | Frontend | 테스트 | FE-4: `buildTodoQuery` 순수함수 분리로 node:test 5건 통과 + Playwright 실증 |
| 35 | 2026-08-27 | Frontend | 소스코드 | FE-5: `features/auth`(회원가입/로그인/로그아웃/토큰재발급) 구현, httpClient에 401 자동 재발급+재시도 인터셉터 추가 |
| 36 | 2026-08-27 | Frontend | 테스트 | FE-5: node:test 6건 + Playwright route interception으로 401→refresh→재시도 검증 |
| 37 | 2026-08-27 | Frontend | 소스코드 | FE-6: `shared/ui/AuthLayout.tsx`(반응형 공용 카드 레이아웃) 구현, 로그인/회원가입 페이지 적용 |
| 38 | 2026-08-27 | Frontend | 소스코드 | FE-7: `widgets/nav-bar`(역할별 메뉴, 햄버거 토글, 로그아웃) 구현 |
| 39 | 2026-08-27 | Frontend | 테스트 | FE-7: node:test 5건 + Playwright로 Member/Admin 메뉴 차이·모바일 토글 실증 |
| 40 | 2026-08-27 | Frontend | 소스코드 | FE-8: `features/todo-filter`, `widgets/todo-board`(카테고리/상태 필터, 표·카드 반응형) 구현 |
| 41 | 2026-08-27 | Frontend | 소스코드 | FE-9: `features/todo-create-edit/ui/TodoForm.tsx`(등록/편집 공용), `shared/ui/Textarea.tsx` 신규, Todo 등록/편집 라우트 구현 |
| 42 | 2026-08-27 | Frontend | 소스코드 | FE-10: Todo 삭제(`useDeleteTodo`)·완료토글 기능 연결, 삭제 확인은 `window.confirm` 사용 |
| 43 | 2026-08-27 | Frontend | 소스코드 | FE-11: `features/profile-edit`(회원정보 수정) 구현, `/profile` 라우트 추가 |
| 44 | 2026-08-27 | Frontend | 소스코드 | FE-12: `app/AdminRoute.tsx`, `features/category-manage`(카테고리 등록/수정/삭제) 구현, `/admin/categories` 라우트 추가 |
| 45 | 2026-08-27 | Frontend | 소스코드 | FE-13: `pages/admin-user-list`(회원 목록 조회) 구현, `/admin/users` 라우트 추가 |
| 46 | 2026-08-27 | Frontend | 테스트 | FE-14: 8개 화면×2뷰포트 Playwright 반응형/예외흐름 통합 점검(이메일형식오류/중복이메일/로그인실패/401리다이렉트/유효성오류/필터빈목록/권한차단) |
| 47 | 2026-08-27 | Frontend | 소스코드 | FE-14 버그수정: httpClient의 401 자동 refresh 로직이 `/auth/refresh` 자체 401에도 재귀 재시도해 데드락에 빠지던 버그 수정(로그인 실패 시 버튼 영구 disabled) |
| 48 | 2026-08-27 | Frontend | 소스코드 | 사용자 피드백 수정①: `index.css`의 Vite 스캐폴드 잔재(`#root` 고정폭/테두리/가운데정렬) 제거로 데스크톱 전체폭 미활용·반응형 미적용 버그 수정, 부수효과(로그인 버튼 정렬 깨짐)는 `AuthLayout.css`로 복구 |
| 49 | 2026-08-27 | Frontend | 소스코드 | 사용자 피드백 수정②③: 메모 입력창 세로중앙정렬(`Textarea`+`.textarea` 클래스), Todo 등록/편집 폼의 등록·저장/취소 버튼 순서 변경 |
| 50 | 2026-08-27 | Frontend | 소스코드 | 사용자 피드백 수정④: Todo 목록(표/카드)에 메모 열 추가 |
| 51 | 2026-08-27 | Backend | 소스코드 | 사용자 피드백 수정⑤: `POST /auth/refresh` 응답에 `user` 필드 추가(`auth.service.js`/`auth.routes.js`/`swagger.json`) |
| 52 | 2026-08-27 | Frontend | 소스코드 | 사용자 피드백 수정⑤: `authStore`에 `isBootstrapping`/`bootstrapSession()` 추가, `ProtectedRoute`/`IndexRedirect`에서 부팅 중 리다이렉트 보류 → 새로고침 시 세션 자동 복원 |
| 53 | 2026-08-27 | Docs | 문서 | `4-wireframe.md`(메모 열, 버튼 순서), `3-user-scenario.md`(시나리오3 새로고침 세션복원) 동기화, `8-plan.md` 버전이력 정리(v1.14~1.28) |
| 54 | 2026-08-28 | Frontend | 소스코드 | 상단 NavBar에 다크모드/라이트모드 토글 버튼 추가(`shared/lib/theme.ts`, `tokens.css` 라이트 테마 오버라이드) |
| 55 | 2026-08-28 | Backend | 환경설정 | `backend/.env`, `.env.example`에 `NODE_ENV=development` 명시 추가(운영/개발 환경 구분 누락 보완) |
| 56 | 2026-08-28 | DB | 테스트 | postgresql-mcp로 운영 DB 스키마와 `docs/schema.sql` 비교 검증 — 불일치 없음 확인 |
| 57 | 2026-08-28 | Infra | 배포 | main 브랜치 대신 `feat/fe-theme-toggle-env-fix` 브랜치 생성 후 frontend 전체(FE-1~14)·백엔드 수정분 커밋/푸시, PR 경유 없이 main에 fast-forward 머지 |
| 58 | 2026-08-28 | Infra | 배포 | Vercel 백엔드 배포 시 404 NOT_FOUND 오류 진단 — `app.listen()` 방식은 서버리스에서 동작 불가 |
| 59 | 2026-08-28 | Backend | 소스코드 | `backend/api/index.js`(Express app export), `backend/vercel.json`(전체 경로 rewrite) 추가로 Vercel 서버리스 배포 가능하게 수정 |
| 60 | 2026-08-28 | Backend | 테스트 | 배포된 백엔드(`*-backend.vercel.app`) 대상 API 레벨 E2E 테스트(회원/관리자 시나리오 36건) 실시 — 운영 DB에 seed 미적용으로 카테고리·Admin 계정 없어 Todo 등록 500/Admin 로그인 401 등 실패 확인 |
| 61 | 2026-08-28 | DB | 환경설정 | 운영 DB(Supabase)에 `seed.sql` 실행(관리자 계정, 기본 카테고리 생성) |
| 62 | 2026-08-28 | Backend | 테스트 | seed 적용 후 동일 E2E 스크립트 재실행 — 36건 전체 통과 확인 |
| 63 | 2026-08-28 | Infra | 배포 | Vercel 프론트엔드 배포 시 "No entrypoint found" 오류 진단 — Framework Preset이 정적 사이트(Vite)가 아닌 Node.js로 잘못 인식된 문제로 확인·안내 |
| 64 | 2026-08-28 | Infra | 배포 | 프론트엔드/백엔드 각각 Vercel 별도 프로젝트로 배포 완료 확인(`*-frontend.vercel.app`, `*-backend.vercel.app`) |
| 65 | 2026-08-28 | Frontend | 테스트 | 배포된 프론트엔드 대상 Playwright 브라우저 E2E 테스트 진행 중 `/signup` 등 하위경로 직접접근·새로고침 시 404 발견 |
| 66 | 2026-08-28 | Frontend | 소스코드 | `frontend/vercel.json` 추가(SPA fallback: 전체 경로 → `index.html` rewrite)로 404 수정 |
| 67 | 2026-08-28 | Frontend | 테스트 | 재배포 후 새로고침 세션유지(시나리오3) 재테스트 — 여전히 `/login`으로 튕기는 회귀 발견 |
| 68 | 2026-08-28 | Backend | 소스코드 | 원인 규명: 프론트/백엔드가 서로 다른 vercel.app 서브도메인이라 cross-site 취급되어 `SameSite` 미지정 쿠키(기본값 Lax)가 fetch 요청에 실리지 않던 문제 → 로그인/로그아웃 쿠키에 `sameSite:'none'`(secure:true 동반) 추가로 수정 |
| 69 | 2026-08-28 | Frontend | 테스트 | 배포 프론트엔드 대상 브라우저 E2E 재실시 — 회원 시나리오 1~10, 관리자 시나리오 1~3 전체 정상 확인 |
| 70 | 2026-08-28 | Infra | 환경설정 | `.gitignore`에 `.playwright-mcp/`(테스트 산출물) 추가 |
| 71 | 2026-08-28 | Infra | 배포 | Vercel 배포 상태 최종 재확인(백엔드 health 200, 프론트 SPA 라우팅 200, 쿠키 SameSite=None 적용) |

---

## 요약
- **DB**: 스키마/마이그레이션/시드 데이터 구성, 운영 DB 시드 반영, 스키마 정합성 검증
- **Backend**: 인증(JWT Access/Refresh)·User·Category·Todo API 전체 구현(BE-1~9), 배포 후 발견된 쿠키 SameSite/서버리스 진입점 문제 수정
- **Frontend**: FSD 구조 기반 회원가입/로그인/Todo CRUD/필터/관리자 화면 전체 구현(FE-1~14), 다크·라이트 테마 토글, 배포 후 발견된 SPA 라우팅 문제 수정
- **Docs**: 도메인정의서~실행계획까지 전체 설계 문서 작성, 구현 결과에 맞춘 지속적 정합성 갱신
- **Infra**: Vercel(백엔드 서버리스 + 프론트엔드 정적 사이트) 배포 구성 및 배포 후 발견된 이슈 3건(서버리스 진입점, SPA 라우팅, 크로스사이트 쿠키) 해결
