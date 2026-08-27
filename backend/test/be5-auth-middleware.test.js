// BE-5 인증/인가 미들웨어 검증 테스트
// auth.middleware.js / admin.middleware.js는 다른 담당자가 작성 중이므로 여기서는 건드리지 않는다.
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const express = require('express');
const jsonwebtoken = require('jsonwebtoken');

const errorHandler = require('../src/middlewares/errorHandler');
const authMiddleware = require('../src/middlewares/auth.middleware');
const adminMiddleware = require('../src/middlewares/admin.middleware');
const { signAccessToken } = require('../src/utils/jwt');

function request(app, urlPath, { headers } = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const req = http.get(
        { host: '127.0.0.1', port, path: urlPath, headers },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            server.close();
            let body;
            try {
              body = raw ? JSON.parse(raw) : undefined;
            } catch {
              body = raw;
            }
            resolve({ status: res.statusCode, body });
          });
        }
      );
      req.on('error', (err) => {
        server.close();
        reject(err);
      });
    });
  });
}

function buildApp() {
  const app = express();
  app.get('/protected', authMiddleware, (req, res) => res.json({ user: req.user }));
  app.get('/admin-only', authMiddleware, adminMiddleware, (req, res) => res.json({ ok: true }));
  app.get('/admin-only-direct', adminMiddleware, (req, res) => res.json({ ok: true }));
  app.use((req, res, next) => {
    const e = new Error('Not Found');
    e.status = 404;
    next(e);
  });
  app.use(errorHandler);
  return app;
}

test('authMiddleware: Authorization 헤더 없이 요청하면 401', async () => {
  const app = buildApp();
  const { status } = await request(app, '/protected');
  assert.strictEqual(status, 401);
});

test('authMiddleware: Bearer 접두사 없는 Authorization 헤더는 401', async () => {
  const app = buildApp();
  const { status } = await request(app, '/protected', {
    headers: { Authorization: 'sometoken' },
  });
  assert.strictEqual(status, 401);
});

test('authMiddleware: Bearer 뒤 토큰이 빈 문자열이면 401', async () => {
  const app = buildApp();
  const { status } = await request(app, '/protected', {
    headers: { Authorization: 'Bearer ' },
  });
  assert.strictEqual(status, 401);
});

test('authMiddleware: 위조된 토큰은 401', async () => {
  const app = buildApp();
  const token = signAccessToken({ userId: 1, role: 'Member' });
  const tampered = token.slice(0, -2) + 'xx';
  const { status } = await request(app, '/protected', {
    headers: { Authorization: `Bearer ${tampered}` },
  });
  assert.strictEqual(status, 401);
});

test('authMiddleware: 만료된 토큰은 401', async () => {
  const app = buildApp();
  const expiredToken = jsonwebtoken.sign(
    { userId: 1, role: 'Member' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '-10s' }
  );
  const { status } = await request(app, '/protected', {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  assert.strictEqual(status, 401);
});

test('authMiddleware: 정상 Member 토큰이면 200과 req.user가 세팅된다', async () => {
  const app = buildApp();
  const token = signAccessToken({ userId: 1, role: 'Member' });
  const { status, body } = await request(app, '/protected', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(body.user.id, 1);
  assert.strictEqual(body.user.role, 'Member');
});

test('adminMiddleware: Member 토큰으로 admin 전용 라우트 호출 시 403', async () => {
  const app = buildApp();
  const token = signAccessToken({ userId: 1, role: 'Member' });
  const { status } = await request(app, '/admin-only', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(status, 403);
});

test('adminMiddleware: Admin 토큰으로 admin 전용 라우트 호출 시 200', async () => {
  const app = buildApp();
  const token = signAccessToken({ userId: 2, role: 'Admin' });
  const { status, body } = await request(app, '/admin-only', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(status, 200);
  assert.deepStrictEqual(body, { ok: true });
});

test('adminMiddleware: req.user 없이 단독으로 사용되면 403', async () => {
  const app = buildApp();
  const { status } = await request(app, '/admin-only-direct');
  assert.strictEqual(status, 403);
});
