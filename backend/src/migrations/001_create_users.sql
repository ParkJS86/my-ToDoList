-- 001_create_users.sql
-- 근거: docs/7-erd.md, docs/schema.sql

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
