-- 003_create_todos.sql
-- 근거: docs/7-erd.md, docs/schema.sql

CREATE TABLE todos (
    todo_id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id     INTEGER      NOT NULL REFERENCES categories(category_id),  -- ON DELETE 없음: 삭제 시 재할당은 서비스 계층 트랜잭션에서 처리
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
