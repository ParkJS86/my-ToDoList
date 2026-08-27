// BE-7 Category API 검증 테스트. 실 로컬 PostgreSQL(my_todolist)에 연결해 통합 테스트로 진행한다.
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const pool = require('../src/db/pool');
const { signAccessToken } = require('../src/utils/jwt');

const testEmails = [];
const createdCategoryIds = [];

function uniqueEmail() {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  testEmails.push(email);
  return email;
}

test.after(async () => {
  if (createdCategoryIds.length > 0) {
    await pool.query('DELETE FROM todos WHERE category_id = ANY($1)', [createdCategoryIds]);
    await pool.query('DELETE FROM categories WHERE category_id = ANY($1)', [createdCategoryIds]);
  }
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
  return { adminToken: signAccessToken({ userId: rows[0].user_id, role: 'Admin' }), adminUserId: rows[0].user_id };
}

async function getDefaultCategoryId() {
  const { rows } = await pool.query('SELECT category_id FROM categories WHERE is_default = true');
  assert.ok(rows[0], 'seed 기본 카테고리가 있어야 함');
  return rows[0].category_id;
}

// ---------- GET /categories ----------

test('GET /categories: 미인증 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'GET', '/categories');
  assert.strictEqual(status, 401);
});

test('GET /categories: Member 토큰으로 호출하면 200, 배열이고 seed 기본 카테고리가 포함된다', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status, body } = await request(app, 'GET', '/categories', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(body));
  for (const item of body) {
    assert.ok('categoryId' in item);
    assert.ok('name' in item);
    assert.ok('isDefault' in item);
    assert.ok('createdBy' in item);
    assert.ok('createdAt' in item);
    assert.ok('updatedAt' in item);
  }
  const defaultCategory = body.find((c) => c.isDefault === true);
  assert.ok(defaultCategory, 'seed 기본 카테고리가 응답에 포함되어야 한다');
});

// ---------- POST /categories ----------

test('POST /categories: 미인증 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'POST', '/categories', {
    body: { name: '새카테고리' },
  });
  assert.strictEqual(status, 401);
});

test('POST /categories: Member 토큰으로 호출하면 403', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'POST', '/categories', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { name: '새카테고리' },
  });
  assert.strictEqual(status, 403);
});

test('POST /categories: Admin, name 누락이면 400', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();

  const { status } = await request(app, 'POST', '/categories', {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {},
  });
  assert.strictEqual(status, 400);
});

test('POST /categories: Admin, name 빈문자열이면 400', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();

  const { status } = await request(app, 'POST', '/categories', {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: '' },
  });
  assert.strictEqual(status, 400);
});

let sharedCategoryId;

test('POST /categories: Admin 정상 등록 시 201, createdBy===adminUserId, isDefault===false', async () => {
  const app = getApp();
  const { adminToken, adminUserId } = await getAdminToken();

  const { status, body } = await request(app, 'POST', '/categories', {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: `테스트카테고리-${Date.now()}` },
  });
  assert.strictEqual(status, 201);
  assert.strictEqual(body.createdBy, adminUserId);
  assert.strictEqual(body.isDefault, false);
  sharedCategoryId = body.categoryId;
  createdCategoryIds.push(body.categoryId);
});

// ---------- PATCH /categories/:id ----------

test('PATCH /categories/:id: Member 토큰으로 호출하면 403', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'PATCH', `/categories/${sharedCategoryId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { name: '수정시도' },
  });
  assert.strictEqual(status, 403);
});

test('PATCH /categories/:id: Admin, 존재하지 않는 id면 404', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();

  const { status } = await request(app, 'PATCH', '/categories/999999', {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: '수정시도' },
  });
  assert.strictEqual(status, 404);
});

test("PATCH /categories/:id: Admin, id가 숫자가 아니면('abc') 400", async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();

  const { status } = await request(app, 'PATCH', '/categories/abc', {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: '수정시도' },
  });
  assert.strictEqual(status, 400);
});

test('PATCH /categories/:id: Admin, name 누락이면 400', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();

  const { status } = await request(app, 'PATCH', `/categories/${sharedCategoryId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {},
  });
  assert.strictEqual(status, 400);
});

test('PATCH /categories/:id: Admin, 기본 카테고리 id 수정 시도 시 400', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();
  const defaultCategoryId = await getDefaultCategoryId();

  const { status } = await request(app, 'PATCH', `/categories/${defaultCategoryId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: '기본카테고리수정시도' },
  });
  assert.strictEqual(status, 400);
});

test('PATCH /categories/:id: Admin, 직접 등록한 카테고리 수정 시 200, name 반영', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();
  const newName = `수정된이름-${Date.now()}`;

  const { status, body } = await request(app, 'PATCH', `/categories/${sharedCategoryId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: newName },
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(body.name, newName);
});

// ---------- DELETE /categories/:id ----------

test('DELETE /categories/:id: Member 토큰으로 호출하면 403', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'DELETE', `/categories/${sharedCategoryId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 403);
});

test('DELETE /categories/:id: Admin, 존재하지 않는 id면 404', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();

  const { status } = await request(app, 'DELETE', '/categories/999999', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(status, 404);
});

test('DELETE /categories/:id: Admin, 기본 카테고리 id 삭제 시도 시 400', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();
  const defaultCategoryId = await getDefaultCategoryId();

  const { status } = await request(app, 'DELETE', `/categories/${defaultCategoryId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(status, 400);
});

test('DELETE /categories/:id: 참조 Todo 없는 카테고리 삭제 시 200, DB에서 삭제 확인', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();

  const createRes = await request(app, 'POST', '/categories', {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: `삭제대상-${Date.now()}` },
  });
  assert.strictEqual(createRes.status, 201);
  const categoryId = createRes.body.categoryId;
  createdCategoryIds.push(categoryId);

  const { status, body } = await request(app, 'DELETE', `/categories/${categoryId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(status, 200);
  assert.ok('message' in body);

  const { rows } = await pool.query('SELECT category_id FROM categories WHERE category_id = $1', [
    categoryId,
  ]);
  assert.strictEqual(rows.length, 0);
});

test('DELETE /categories/:id: 참조 Todo 있는 카테고리 삭제 시 200, todo의 category_id가 기본 카테고리로 재할당된다', async () => {
  const app = getApp();
  const { adminToken } = await getAdminToken();
  const { userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const createRes = await request(app, 'POST', '/categories', {
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name: `삭제대상-참조있음-${Date.now()}` },
  });
  assert.strictEqual(createRes.status, 201);
  const categoryId = createRes.body.categoryId;
  createdCategoryIds.push(categoryId);

  const today = new Date().toISOString().slice(0, 10);
  const insertResult = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, start_date, end_date)
     VALUES ($1, $2, $3, $4, $4)
     RETURNING todo_id`,
    [userId, categoryId, '참조 테스트 할일', today]
  );
  const todoId = insertResult.rows[0].todo_id;

  const { status, body } = await request(app, 'DELETE', `/categories/${categoryId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(status, 200);
  assert.ok('message' in body);

  const { rows: todoRows } = await pool.query('SELECT category_id FROM todos WHERE todo_id = $1', [
    todoId,
  ]);
  assert.strictEqual(todoRows[0].category_id, defaultCategoryId);

  const { rows: categoryRows } = await pool.query(
    'SELECT category_id FROM categories WHERE category_id = $1',
    [categoryId]
  );
  assert.strictEqual(categoryRows.length, 0);
});
