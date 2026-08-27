// BE-8 Todo API 검증 테스트. 실 로컬 PostgreSQL(my_todolist)에 연결해 통합 테스트로 진행한다.
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const pool = require('../src/db/pool');

const testEmails = [];
const createdTodoIds = [];

function uniqueEmail() {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  testEmails.push(email);
  return email;
}

test.after(async () => {
  if (createdTodoIds.length > 0) {
    await pool.query('DELETE FROM todos WHERE todo_id = ANY($1)', [createdTodoIds]);
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

async function getDefaultCategoryId() {
  const { rows } = await pool.query('SELECT category_id FROM categories WHERE is_default = true');
  assert.ok(rows[0], 'seed 기본 카테고리가 있어야 함');
  return rows[0].category_id;
}

async function createCategory(name) {
  const { rows } = await pool.query(
    'INSERT INTO categories (name, is_default) VALUES ($1, false) RETURNING category_id',
    [name]
  );
  return rows[0].category_id;
}

function daysFromToday(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function insertTodo({ userId, categoryId, title, startDate, endDate, completed }) {
  const { rows } = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, start_date, end_date, completed)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING todo_id`,
    [userId, categoryId, title, startDate, endDate, completed]
  );
  const todoId = rows[0].todo_id;
  createdTodoIds.push(todoId);
  return todoId;
}

// ---------- POST /todos ----------

test('POST /todos: 미인증 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'POST', '/todos', {
    body: { title: '할일', startDate: daysFromToday(0), endDate: daysFromToday(1) },
  });
  assert.strictEqual(status, 401);
});

test('POST /todos: startDate > endDate면 400', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'POST', '/todos', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '할일', startDate: daysFromToday(1), endDate: daysFromToday(0) },
  });
  assert.strictEqual(status, 400);
});

test('POST /todos: 정상 등록 시 201, status 필드 포함', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status, body } = await request(app, 'POST', '/todos', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '할일', startDate: daysFromToday(0), endDate: daysFromToday(1) },
  });
  assert.strictEqual(status, 201);
  assert.ok('status' in body);
  createdTodoIds.push(body.todoId);
});

test('POST /todos: categoryId 미지정 시 응답 categoryId가 전역 기본 카테고리 id와 동일', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const { status, body } = await request(app, 'POST', '/todos', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '할일', startDate: daysFromToday(0), endDate: daysFromToday(1) },
  });
  assert.strictEqual(status, 201);
  assert.strictEqual(body.categoryId, defaultCategoryId);
  createdTodoIds.push(body.todoId);
});

test('POST /todos: 같은 사용자가 같은 기간으로 2건 연속 등록하면 둘 다 201', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);
  const startDate = daysFromToday(0);
  const endDate = daysFromToday(2);

  const res1 = await request(app, 'POST', '/todos', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '할일1', startDate, endDate },
  });
  const res2 = await request(app, 'POST', '/todos', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '할일2', startDate, endDate },
  });
  assert.strictEqual(res1.status, 201);
  assert.strictEqual(res2.status, 201);
  createdTodoIds.push(res1.body.todoId, res2.body.todoId);
});

// ---------- GET /todos ----------

test('GET /todos: 미인증 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'GET', '/todos');
  assert.strictEqual(status, 401);
});

test('GET /todos: categoryId 필터 시 해당 카테고리 것만 반환', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const categoryA = await createCategory(`카테고리A-${Date.now()}`);
  const categoryB = await createCategory(`카테고리B-${Date.now()}`);

  const todoA = await insertTodo({
    userId,
    categoryId: categoryA,
    title: '카테고리A 할일',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });
  await insertTodo({
    userId,
    categoryId: categoryB,
    title: '카테고리B 할일',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status, body } = await request(app, 'GET', `/todos?categoryId=${categoryA}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 200);
  assert.ok(body.every((t) => t.categoryId === categoryA));
  assert.ok(body.some((t) => t.todoId === todoA));
});

test('GET /todos: 타인 소유 Todo는 내 목록에 안 보인다', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);
  const other = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const otherTodoId = await insertTodo({
    userId: other.userId,
    categoryId: defaultCategoryId,
    title: '타인의 할일',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status, body } = await request(app, 'GET', '/todos', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 200);
  assert.ok(body.every((t) => t.todoId !== otherTodoId));
});

test('GET /todos?status=진행중: 경계값(startDate=오늘,endDate=오늘,completed=false)이 포함된다', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();
  const today = daysFromToday(0);

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '경계값-진행중1',
    startDate: today,
    endDate: today,
    completed: false,
  });

  const { status, body } = await request(
    app,
    'GET',
    `/todos?status=${encodeURIComponent('진행중')}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  assert.strictEqual(status, 200);
  assert.ok(body.some((t) => t.todoId === todoId));
  assert.ok(body.every((t) => t.status === '진행중'));
});

test('GET /todos?status=완료: endDate가 지나도 completed=true면 완료로 조회된다(경계값)', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '경계값-완료',
    startDate: daysFromToday(-2),
    endDate: daysFromToday(-1),
    completed: true,
  });

  const { status, body } = await request(
    app,
    'GET',
    `/todos?status=${encodeURIComponent('완료')}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  assert.strictEqual(status, 200);
  assert.ok(body.some((t) => t.todoId === todoId));
  assert.ok(body.every((t) => t.status === '완료'));
});

test('GET /todos?status=진행중: startDate=과거,endDate=오늘,completed=false는 지연이 아니라 진행중(경계값)', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '경계값-진행중2',
    startDate: daysFromToday(-1),
    endDate: daysFromToday(0),
    completed: false,
  });

  const { status, body } = await request(
    app,
    'GET',
    `/todos?status=${encodeURIComponent('진행중')}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  assert.strictEqual(status, 200);
  assert.ok(body.some((t) => t.todoId === todoId));

  const { status: delayedStatus, body: delayedBody } = await request(
    app,
    'GET',
    `/todos?status=${encodeURIComponent('지연')}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  assert.strictEqual(delayedStatus, 200);
  assert.ok(delayedBody.every((t) => t.todoId !== todoId));
});

// ---------- PATCH /todos/:id ----------

test('PATCH /todos/:id: 미인증 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'PATCH', '/todos/1', {
    body: { title: '수정' },
  });
  assert.strictEqual(status, 401);
});

test('PATCH /todos/:id: 존재하지 않는 id면 404', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'PATCH', '/todos/999999', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '수정' },
  });
  assert.strictEqual(status, 404);
});

test('PATCH /todos/:id: 타인 소유 todo 수정 시도 시 403', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);
  const other = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const otherTodoId = await insertTodo({
    userId: other.userId,
    categoryId: defaultCategoryId,
    title: '타인의 할일',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status } = await request(app, 'PATCH', `/todos/${otherTodoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '수정시도' },
  });
  assert.strictEqual(status, 403);
});

test('PATCH /todos/:id: startDate만 보내서 기존 endDate보다 뒤로 만들면 400', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '기간수정대상1',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status } = await request(app, 'PATCH', `/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { startDate: daysFromToday(2) },
  });
  assert.strictEqual(status, 400);
});

test('PATCH /todos/:id: endDate만 보내서 기존 startDate보다 앞으로 만들면 400', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '기간수정대상2',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status } = await request(app, 'PATCH', `/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { endDate: daysFromToday(-1) },
  });
  assert.strictEqual(status, 400);
});

test('PATCH /todos/:id: 소유자 정상 수정(title) 시 200', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '원래제목',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status, body } = await request(app, 'PATCH', `/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { title: '수정된제목' },
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(body.title, '수정된제목');
});

test('PATCH /todos/:id: completed:true로 수정하면 status가 완료, 다시 false로 수정하면 날짜 기준으로 재계산된다', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '완료토글대상',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const completedRes = await request(app, 'PATCH', `/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { completed: true },
  });
  assert.strictEqual(completedRes.status, 200);
  assert.strictEqual(completedRes.body.status, '완료');

  const reopenedRes = await request(app, 'PATCH', `/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { completed: false },
  });
  assert.strictEqual(reopenedRes.status, 200);
  assert.strictEqual(reopenedRes.body.status, '진행중');
});

// ---------- DELETE /todos/:id ----------

test('DELETE /todos/:id: 미인증 호출하면 401', async () => {
  const app = getApp();
  const { status } = await request(app, 'DELETE', '/todos/1');
  assert.strictEqual(status, 401);
});

test('DELETE /todos/:id: 존재하지 않는 id면 404', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);

  const { status } = await request(app, 'DELETE', '/todos/999999', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 404);
});

test('DELETE /todos/:id: 타인 소유 todo 삭제 시도 시 403', async () => {
  const app = getApp();
  const { accessToken } = await signupAndLogin(app);
  const other = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const otherTodoId = await insertTodo({
    userId: other.userId,
    categoryId: defaultCategoryId,
    title: '타인의 할일',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status } = await request(app, 'DELETE', `/todos/${otherTodoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 403);
});

test('DELETE /todos/:id: 소유자 삭제 성공 시 200, DB에서 실제 삭제 확인', async () => {
  const app = getApp();
  const { accessToken, userId } = await signupAndLogin(app);
  const defaultCategoryId = await getDefaultCategoryId();

  const todoId = await insertTodo({
    userId,
    categoryId: defaultCategoryId,
    title: '삭제대상',
    startDate: daysFromToday(0),
    endDate: daysFromToday(1),
    completed: false,
  });

  const { status, body } = await request(app, 'DELETE', `/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.strictEqual(status, 200);
  assert.ok('message' in body);

  const { rows } = await pool.query('SELECT todo_id FROM todos WHERE todo_id = $1', [todoId]);
  assert.strictEqual(rows.length, 0);
});
