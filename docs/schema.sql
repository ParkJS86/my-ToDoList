-- my-ToDoList 스키마 DDL (PostgreSQL 17)
-- 근거: docs/7-erd.md, docs/1-domain-definition.md, docs/5-project-principle.md
-- ORM 미사용(Prisma 금지, PRD 4.1) — 순수 SQL로 관리.

CREATE TABLE users (
    user_id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(10)  NOT NULL DEFAULT 'Member'
                        CHECK (role IN ('Member', 'Admin')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by      INTEGER      REFERENCES users(user_id),  -- 본인만 수정 가능 → 항상 본인 user_id
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    category_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(50)  NOT NULL,
    is_default      BOOLEAN      NOT NULL DEFAULT false,
    created_by      INTEGER      REFERENCES users(user_id),  -- 등록자 기록용(소유 아님, 도메인 4장)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by      INTEGER      REFERENCES users(user_id),  -- 마지막으로 수정한 Admin
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 전역 '기본' Category는 1개만 존재 (도메인 6장 규칙5)
CREATE UNIQUE INDEX categories_single_default_idx
    ON categories (is_default)
    WHERE is_default = true;

CREATE TABLE todos (
    todo_id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id     INTEGER      NOT NULL REFERENCES categories(category_id),  -- ON DELETE 없음: 삭제 시 재할당은 서비스 계층 트랜잭션에서 처리(7-erd.md)
    title           VARCHAR(200) NOT NULL,
    memo            TEXT,
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    completed       BOOLEAN      NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by      INTEGER      REFERENCES users(user_id),  -- 소유자 본인만 수정 가능 → 항상 user_id와 동일
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (start_date <= end_date)  -- 도메인 6장 규칙6
);

-- 목록 필터링 성능용 기본 인덱스 (5-project-principle.md 5장)
CREATE INDEX todos_user_id_idx ON todos (user_id);
CREATE INDEX todos_category_id_idx ON todos (category_id);
