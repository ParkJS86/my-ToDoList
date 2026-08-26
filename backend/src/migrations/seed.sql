-- seed.sql
-- 최초 관리자 계정 1건 + 전역 '기본' Category 1건
-- 근거: docs/8-plan.md DB-3, docs/1-domain-definition.md 6장 규칙5
-- 재실행해도 중복 삽입되지 않도록 ON CONFLICT DO NOTHING 사용.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@my-todolist.local',
    crypt('Admin1234!', gen_salt('bf')),
    '관리자',
    'Admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name, is_default)
VALUES ('기본', true)
ON CONFLICT (is_default) WHERE is_default = true DO NOTHING;
