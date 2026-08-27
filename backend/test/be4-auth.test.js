// BE-4 인증 API 검증 테스트. 실 로컬 PostgreSQL(my_todolist)에 연결해 통합 테스트로 진행한다.
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const jsonwebtoken = require('jsonwebtoken');

const pool = require('../src/db/pool');
const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/utils/jwt');

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

function extractRefreshCookie(setCookieHeader) {
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const target = cookies.find((c) => c && c.startsWith('refreshToken='));
  if (!target) return null;
  return target.split(';')[0]; // "refreshToken=값"
}

// ---------- 1. jwt.js 단위 테스트 ----------

test('jwt: sign/verify 왕복 시 payload가 일치한다', () => {
  const payload = { userId: 'user-123', role: 'Member' };
  const accessToken = signAccessToken(payload);
  const decoded = verifyAccessToken(accessToken);
  assert.strictEqual(decoded.userId, payload.userId);
  assert.strictEqual(decoded.role, payload.role);

  const refreshToken = signRefreshToken(payload);
  const decodedRefresh = verifyRefreshToken(refreshToken);
  assert.strictEqual(decodedRefresh.userId, payload.userId);
  assert.strictEqual(decodedRefresh.role, payload.role);
});

test('jwt: 잘못된 secret으로 만든 토큰은 verify 시 에러가 throw된다', () => {
  const badToken = jsonwebtoken.sign({ userId: 'x', role: 'Member' }, 'wrong-secret');
  assert.throws(() => verifyAccessToken(badToken));
});

test('jwt: 만료된 토큰은 verify 시 에러가 throw된다', () => {
  const expiredToken = jsonwebtoken.sign(
    { userId: 'x', role: 'Member' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: -1 }
  );
  assert.throws(() => verifyAccessToken(expiredToken));
});

// ---------- 2~5. 회원가입 ----------

test('signup: 정상 회원가입 시 201, password_hash 미노출, role은 Member', async () => {
  const app = getApp();
  const email = uniqueEmail();
  const { status, body } = await request(app, 'POST', '/auth/signup', {
    body: { email, password: 'password1', name: '테스트유저' },
  });
  assert.strictEqual(status, 201);
  assert.ok(!Object.keys(body).includes('password_hash'));
  assert.strictEqual(body.role, 'Member');
  assert.strictEqual(body.email, email);
});

for (const invalidEmail of ['foo', 'foo@', '@bar.com']) {
  test(`signup: 이메일 형식 오류(${invalidEmail})는 400`, async () => {
    const app = getApp();
    const { status } = await request(app, 'POST', '/auth/signup', {
      body: { email: invalidEmail, password: 'password1', name: '테스트유저' },
    });
    assert.strictEqual(status, 400);
  });
}

test('signup: 비밀번호 7자는 400', async () => {
  const app = getApp();
  const email = uniqueEmail();
  const { status } = await request(app, 'POST', '/auth/signup', {
    body: { email, password: '1234567', name: '테스트유저' },
  });
  assert.strictEqual(status, 400);
});

test('signup: 중복 이메일은 두 번째 요청이 400이고 DB에 1건만 존재한다', async () => {
  const app = getApp();
  const email = uniqueEmail();
  const first = await request(app, 'POST', '/auth/signup', {
    body: { email, password: 'password1', name: '테스트유저' },
  });
  assert.strictEqual(first.status, 201);

  const second = await request(app, 'POST', '/auth/signup', {
    body: { email, password: 'password1', name: '테스트유저' },
  });
  assert.strictEqual(second.status, 400);

  const { rows } = await pool.query('SELECT COUNT(*) FROM users WHERE email = $1', [email]);
  assert.strictEqual(Number(rows[0].count), 1);
});

// ---------- 6~8. 로그인 ----------

test('login: 정상 로그인 시 200, accessToken/Set-Cookie(refreshToken, HttpOnly), 바디에 refreshToken 없음', async () => {
  const app = getApp();
  const email = uniqueEmail();
  await request(app, 'POST', '/auth/signup', {
    body: { email, password: 'password1', name: '테스트유저' },
  });

  const { status, body, headers } = await request(app, 'POST', '/auth/login', {
    body: { email, password: 'password1' },
  });
  assert.strictEqual(status, 200);
  assert.ok(typeof body.accessToken === 'string' && body.accessToken.length > 0);
  assert.ok(!Object.keys(body).includes('refreshToken'));

  const setCookie = headers['set-cookie'];
  assert.ok(setCookie, 'Set-Cookie 헤더가 있어야 한다');
  const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
  assert.match(cookieStr, /refreshToken=/);
  assert.match(cookieStr, /HttpOnly/i);
});

test('login: 존재하지 않는 이메일과 존재하는 이메일+틀린 비밀번호는 동일한 401 메시지를 반환한다', async () => {
  const app = getApp();
  const email = uniqueEmail();
  await request(app, 'POST', '/auth/signup', {
    body: { email, password: 'password1', name: '테스트유저' },
  });

  const noSuchEmail = await request(app, 'POST', '/auth/login', {
    body: { email: uniqueEmail(), password: 'password1' },
  });
  assert.strictEqual(noSuchEmail.status, 401);

  const wrongPassword = await request(app, 'POST', '/auth/login', {
    body: { email, password: 'wrong-password' },
  });
  assert.strictEqual(wrongPassword.status, 401);

  const noSuchMessage = noSuchEmail.body && noSuchEmail.body.message;
  const wrongPasswordMessage = wrongPassword.body && wrongPassword.body.message;
  assert.strictEqual(noSuchMessage, wrongPasswordMessage);
});

// ---------- 9~11. 재발급 ----------

test('refresh: 로그인 쿠키 재사용 시 200, accessToken 존재', async () => {
  const app = getApp();
  const email = uniqueEmail();
  await request(app, 'POST', '/auth/signup', {
    body: { email, password: 'password1', name: '테스트유저' },
  });
  const loginRes = await request(app, 'POST', '/auth/login', {
    body: { email, password: 'password1' },
  });
  const cookie = extractRefreshCookie(loginRes.headers['set-cookie']);
  assert.ok(cookie, '로그인 응답에 refreshToken 쿠키가 있어야 한다');

  const { status, body } = await request(app, 'POST', '/auth/refresh', {
    headers: { Cookie: cookie },
  });
  assert.strictEqual(status, 200);
  assert.ok(typeof body.accessToken === 'string' && body.accessToken.length > 0);
});

test('refresh: 쿠키 없이 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'POST', '/auth/refresh');
  assert.strictEqual(status, 401);
});

test('refresh: 유효하지 않은 쿠키값이면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'POST', '/auth/refresh', {
    headers: { Cookie: 'refreshToken=invalid-token-value' },
  });
  assert.strictEqual(status, 401);
});

// ---------- 12. 로그아웃 ----------

test('logout: 200, message 존재, Set-Cookie에 refreshToken 만료 정보 포함', async () => {
  const app = getApp();
  const { status, body, headers } = await request(app, 'POST', '/auth/logout');
  assert.strictEqual(status, 200);
  assert.ok(typeof body.message === 'string' && body.message.length > 0);

  const setCookie = headers['set-cookie'];
  assert.ok(setCookie, 'Set-Cookie 헤더가 있어야 한다');
  const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
  assert.match(cookieStr, /refreshToken=/);
  assert.ok(/Max-Age=0/i.test(cookieStr) || /Expires=/i.test(cookieStr));
});
