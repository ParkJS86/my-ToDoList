-- 002_create_categories.sql
-- 근거: docs/7-erd.md, docs/schema.sql

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
