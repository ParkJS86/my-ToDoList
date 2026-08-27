// 이 테스트는 backend/test/be1-scaffold.test.js와 함께 `npm test`로 실행되며, 기존 27개 테스트에 영향을 주지 않아야 한다
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const errorHandler = require('../src/middlewares/errorHandler');
const requestLogger = require('../src/middlewares/requestLogger');

function listenAndGet(app, urlPath) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const req = require('node:http').get(
        { host: '127.0.0.1', port, path: urlPath },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            server.close();
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

// 1. errorHandler 단위 테스트
function buildErrorApp(err) {
  const app = express();
  app.get('/boom', (req, res, next) => {
    next(err);
  });
  app.use(errorHandler);
  return app;
}

test('errorHandler: 기본 Error(status 없음)는 500과 기본 메시지를 반환한다', async () => {
  const app = buildErrorApp(new Error('아무 메시지'));
  const { status, body } = await listenAndGet(app, '/boom');
  assert.strictEqual(status, 500);
  const parsed = JSON.parse(body);
  assert.strictEqual(parsed.error.status, 500);
  assert.strictEqual(typeof parsed.error.message, 'string');
});

for (const code of [400, 401, 403, 404]) {
  test(`errorHandler: err.status = ${code}는 ${code}로 매핑된다`, async () => {
    const err = new Error(`status ${code} 에러`);
    err.status = code;
    const app = buildErrorApp(err);
    const { status, body } = await listenAndGet(app, '/boom');
    assert.strictEqual(status, code);
    const parsed = JSON.parse(body);
    assert.strictEqual(parsed.error.status, code);
    assert.strictEqual(parsed.error.message, err.message);
  });
}

test('errorHandler: 응답 body는 error.message, error.status 두 키만 가진다(stack 미노출)', async () => {
  const err = new Error('키 검증용 에러');
  err.status = 400;
  const app = buildErrorApp(err);
  const { body } = await listenAndGet(app, '/boom');
  const parsed = JSON.parse(body);
  assert.deepStrictEqual(Object.keys(parsed), ['error']);
  assert.deepStrictEqual(Object.keys(parsed.error).sort(), ['message', 'status']);
});

// 2, 3. 실제 app.js 통합 테스트
test('실제 app: 존재하지 않는 라우트는 404 catch-all로 처리된다', async () => {
  const app = require('../src/app');
  const { status, body } = await listenAndGet(app, '/__nonexistent_route__');
  assert.strictEqual(status, 404);
  const parsed = JSON.parse(body);
  assert.strictEqual(parsed.error.status, 404);
  assert.strictEqual(typeof parsed.error.message, 'string');
});

test('실제 app: GET /health는 정상 동작한다', async () => {
  const app = require('../src/app');
  const { status } = await listenAndGet(app, '/health');
  assert.ok(status === 200 || status === 503, 'health는 200 또는 503(DB 미연결)이어야 한다');
});

// 4. requestLogger - development 콘솔 로깅 테스트
test('requestLogger: development 환경에서는 console.log로 로그를 남긴다', async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  const originalLog = console.log;
  const logs = [];
  console.log = (line) => logs.push(line);
  try {
    const app = require('../src/app');
    await listenAndGet(app, '/health');
    // finish 이벤트는 비동기이므로 짧게 대기
    await new Promise((r) => setTimeout(r, 100));
    const matched = logs.some((line) =>
      /^\[.+\] GET \/health \d{3} \d+ms userId=\S+$/.test(line)
    );
    assert.ok(matched, `로그 라인 형식이 일치해야 한다. 캡처된 로그: ${JSON.stringify(logs)}`);
  } finally {
    console.log = originalLog;
    if (originalEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv;
  }
});

// 5. requestLogger - production 파일 로깅 테스트
test('requestLogger: production 환경에서는 파일에 로그를 남긴다', async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const app = express();
    app.use(requestLogger);
    app.get('/ping', (req, res) => res.status(200).json({ ok: true }));

    await listenAndGet(app, '/ping');

    const logDate = new Date().toISOString().slice(0, 10);
    const logFilePath = path.join(__dirname, '..', 'logs', `app_${logDate}.log`);

    let found = false;
    for (let i = 0; i < 20; i++) {
      if (fs.existsSync(logFilePath)) {
        const content = fs.readFileSync(logFilePath, 'utf8');
        if (content.includes('GET /ping')) {
          found = true;
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    assert.ok(found, `로그 파일(${logFilePath})에 GET /ping 로그가 있어야 한다`);
  } finally {
    if (originalEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv;
  }
});

// 6. requestLogger - userId 반영 테스트
test('requestLogger: req.user.id가 있으면 로그에 userId가 반영된다', async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  const originalLog = console.log;
  const logs = [];
  console.log = (line) => logs.push(line);
  try {
    const app = express();
    app.use((req, res, next) => {
      req.user = { id: 'test-user-1' };
      next();
    });
    app.use(requestLogger);
    app.get('/whoami', (req, res) => res.status(200).json({ ok: true }));

    await listenAndGet(app, '/whoami');
    await new Promise((r) => setTimeout(r, 100));

    const matched = logs.some((line) => line.includes('userId=test-user-1'));
    assert.ok(matched, `로그 라인에 userId=test-user-1이 포함되어야 한다. 캡처된 로그: ${JSON.stringify(logs)}`);
  } finally {
    console.log = originalLog;
    if (originalEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv;
  }
});
