// BE-6 User API 검증 테스트. 실 로컬 PostgreSQL(my_todolist)에 연결해 통합 테스트로 진행한다.
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const pool = require('../src/db/pool');
const { signAccessToken } = require('../src/utils/jwt');

const testEmails = [];
function uniqueEmail() {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  testEmails.push(email);
  return email;
}

test.after(async () => {
  if (testEmails.length > 0) {
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [testEmails]);
  }
  await pool.end();
});

// 서버 헬퍼: app.listen(0) + http로 요청
function request(app, method, urlPath, { body, headers } = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const payload = body ? JSON.stringify(body) : undefined;
      const req = http.request(
        {
          host: '127.0.0.1',
          port,
          path: urlPath,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
            ...headers,
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            server.close();
            let parsedBody;
            try {
              parsedBody = raw ? JSON.parse(raw) : undefined;
            } catch {
              parsedBody = raw;
            }
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: parsedBody,
            });
          });
        }
      );
      req.on('error', (err) => {
        server.close();
        reject(err);
      });
      if (payload) req.write(payload);
      req.end();
    });
  });
}

function getApp() {
  delete require.cache[require.resolve('../src/app')];
  return require('../src/app');
}

async function signupAndLogin(app) {
  const email = uniqueEmail();
  const password = 'password1';
  await request(app, 'POST', '/auth/signup', {
    body: { email, password, name: '테스트유저' },
  });
  const loginRes = await request(app, 'POST', '/auth/login', {
    body: { email, password },
  });
  const { rows } = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
  return { email, password, accessToken: loginRes.body.accessToken, userId: rows[0].user_id };
}

async function getAdminToken() {
  const { rows } = await pool.query(
    "SELECT user_id FROM users WHERE email = 'admin@my-todolist.local'"
  );
  assert.ok(rows[0], 'seed 관리자 계정이 있어야 함');
  return signAccessToken({ userId: rows[0].user_id, role: 'Admin' });
}

// ---------- PATCH /users/me ----------

test('PATCH /users/me: name만 수정하면 200, DB에도 반영된다', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);

  const { status, body } = await request(app, 'PATCH', '/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { name: '변경된이름' },
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(body.name, '변경된이름');

  const { rows } = await pool.query(
    'SELECT name, updated_by, created_at, updated_at FROM users WHERE user_id = $1',
    [userId]
  );
  assert.strictEqual(rows[0].name, '변경된이름');
  assert.strictEqual(rows[0].updated_by, userId);
  assert.ok(new Date(rows[0].updated_at) > new Date(rows[0].created_at));
});

test('PATCH /users/me: password만 수정하면 200, 새 비밀번호로 로그인 가능하다', async () => {
  const app = getApp();
  const { email, accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'PATCH', '/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { password: 'new-password1' },
  });
  assert.strictEqual(status, 200);

  const loginRes = await request(app, 'POST', '/auth/login', {
    body: { email, password: 'new-password1' },
  });
  assert.strictEqual(loginRes.status, 200);
});

test('PATCH /users/me: name+password 동시 수정 시 둘 다 반영된다', async () => {
  const app = getApp();
  const { email, accessToken } = await signupAndLogin(app);

  const { status, body } = await request(app, 'PATCH', '/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { name: '동시수정', password: 'new-password2' },
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(body.name, '동시수정');

  const loginRes = await request(app, 'POST', '/auth/login', {
    body: { email, password: 'new-password2' },
  });
  assert.strictEqual(loginRes.status, 200);
});

test('PATCH /users/me: name/password 둘 다 없으면 400', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'PATCH', '/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {},
  });
  assert.strictEqual(status, 400);
});

test('PATCH /users/me: Authorization 헤더 없이 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'PATCH', '/users/me', {
    body: { name: '아무이름' },
  });
  assert.strictEqual(status, 401);
});

test('PATCH /users/me: 응답 바디에 password/password_hash 키가 없다', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { body } = await request(app, 'PATCH', '/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { name: '민감정보제외' },
  });
  assert.ok(!Object.keys(body).includes('password'));
  assert.ok(!Object.keys(body).includes('password_hash'));
});

// ---------- GET /users ----------

test('GET /users: Member 토큰으로 호출하면 403', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'GET', '/users', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 403);
});

test('GET /users: Admin 토큰으로 호출하면 200, 배열이고 seed 관리자가 포함된다', async () => {
  const app = getApp();
  const adminToken = await getAdminToken();

  const { status, body } = await request(app, 'GET', '/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(body));
  for (const item of body) {
    assert.ok('userId' in item);
    assert.ok('email' in item);
    assert.ok('name' in item);
    assert.ok('role' in item);
    assert.ok('createdAt' in item);
  }
  const seedAdmin = body.find((u) => u.email === 'admin@my-todolist.local');
  assert.ok(seedAdmin, 'seed 관리자 계정이 응답에 포함되어야 한다');
});

test('GET /users: 미인증 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'GET', '/users');
  assert.strictEqual(status, 401);
});
