# my-ToDoList 아키텍처 다이어그램

## 버전 이력
| 버전 | 요약 내용 | 근거/출처 | 날짜 |
|---|---|---|---|
| 1.0 | 최초 작성: 전체 시스템 아키텍처, 요청 처리 흐름 다이어그램 | 2-prd.md, 5-project-principle.md | 2026-08-26 |
| 1.1 | 인증 요청 시퀀스 다이어그램 추가(로그인, Access Token 만료 시 재발급, 로그아웃) | 3-user-scenario.md 시나리오2·3·4 | 2026-08-26 |
| 1.2 | 다이어그램 내 DB 라벨을 "PostgreSQL"에서 "PostgreSQL 17"로 통일 | 기술스택 일관성 검토 결과 | 2026-08-26 |

## 문서 개요
1인 개발/2일 일정, 단일 Express 서버 + 단일 PostgreSQL 인스턴스(마이크로서비스 없음) 제약을 그대로 반영한 최소 구조의 아키텍처 다이어그램이다. 상세 레이어/네이밍은 `5-project-principle.md`를 따른다.

## 1. 전체 시스템 아키텍처
클라이언트-서버-DB 흐름과 JWT Access/Refresh Token의 저장 위치를 표시한다. Access Token은 클라이언트 메모리(Zustand)에, Refresh Token은 httpOnly 쿠키에 보관한다.

```mermaid
flowchart LR
    subgraph Client["브라우저 (React 19 + TS)"]
        UI["FSD 레이어\napp/pages/widgets/features/entities/shared"]
        Zustand["Zustand\n(Access Token, 로그인 사용자, UI 상태)"]
        TanQuery["TanStack Query\n(Todo/Category/User 서버 상태 캐시)"]
        Cookie["httpOnly Cookie\n(Refresh Token)"]
        UI --> Zustand
        UI --> TanQuery
    end

    Client -- "Authorization: Bearer AccessToken\n+ Cookie: RefreshToken" --> Server

    subgraph Server["단일 Express 서버 (Node.js)"]
        Express["Express App\nroutes → services → queries"]
        Pool["pg.Pool\n(커넥션 풀, max 20)"]
        Express --> Pool
    end

    Pool -- "SQL (파라미터 바인딩)" --> DB[("PostgreSQL 17\nusers / categories / todos")]

    Server -- "JSON 응답 + Set-Cookie(RefreshToken)" --> Client
```

## 2. 요청 처리 흐름 (미들웨어 포함)
인증이 필요한 API 요청 하나가 라우트→서비스→쿼리→DB를 거쳐 응답하는 흐름이다.

```mermaid
flowchart TD
    A["Client 요청"] --> B["express.json()"]
    B --> C["requestLogger\n(메서드/경로/상태코드/응답시간 로깅)"]
    C --> D["auth.middleware\n(JWT 검증, 실패 시 401)"]
    D --> E{"Admin 전용 라우트?"}
    E -- "예" --> F["admin.middleware\n(Role=Admin 검증, 실패 시 403)"]
    E -- "아니오" --> G["routes\n(입력 유효성 검증)"]
    F --> G
    G --> H["services\n(소유권 검증, 상태 파생 계산 등 비즈니스 로직)"]
    H --> I["queries\n(pg 파라미터 바인딩 SQL)"]
    I --> J[("PostgreSQL 17")]
    J --> I --> H --> G --> K["JSON 응답"]
    G -. "에러 throw/next(err)" .-> L["errorHandler\n(표준 에러 응답: {error:{message, status}})"]
    L --> K
```

## 3. 인증 요청 시퀀스 (로그인 → 재발급 → 로그아웃)
로그인 성공 시 토큰 발급, Access Token 만료 시 자동 재발급, 로그아웃 시 폐기 흐름이다(3-user-scenario.md 시나리오 2·3·4).

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Express 서버
    participant DB as PostgreSQL 17

    C->>S: POST /auth/login (id, password)
    S->>DB: 사용자 조회 + bcrypt 비교
    DB-->>S: 사용자 정보
    S-->>C: Access Token(응답 바디) + Set-Cookie: RefreshToken(httpOnly)

    Note over C: 이후 요청은 Authorization: Bearer AccessToken

    C->>S: GET /todos (만료된 Access Token)
    S-->>C: 401 Unauthorized
    C->>S: POST /auth/refresh (Cookie: RefreshToken)
    S->>S: Refresh Token 검증
    S-->>C: 새 Access Token
    C->>S: GET /todos (새 Access Token으로 재시도)
    S-->>C: 200 OK

    C->>S: POST /auth/logout
    S-->>C: Set-Cookie: RefreshToken 만료 처리
    Note over C: Access Token 클라이언트에서 폐기
```
