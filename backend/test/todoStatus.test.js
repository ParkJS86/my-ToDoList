// BE-8 todoStatus 순수 함수 단위 테스트. DB 불필요, 결정론적으로 동작한다.
const test = require('node:test');
const assert = require('node:assert');

const { deriveStatus } = require('../src/utils/todoStatus');

const today = new Date('2026-08-27');
const yesterday = '2026-08-26';
const tomorrow = '2026-08-28';
const todayStr = '2026-08-27';

test('completed=true면 endDate가 훨씬 과거여도 완료', () => {
  const status = deriveStatus(
    { completed: true, startDate: '2020-01-01', endDate: '2020-01-02' },
    today
  );
  assert.strictEqual(status, '완료');
});

test('endDate가 어제(과거)이고 completed=false면 지연', () => {
  const status = deriveStatus(
    { completed: false, startDate: '2026-08-01', endDate: yesterday },
    today
  );
  assert.strictEqual(status, '지연');
});

test('startDate가 내일(미래)이고 completed=false면 시작전', () => {
  const status = deriveStatus(
    { completed: false, startDate: tomorrow, endDate: '2026-09-01' },
    today
  );
  assert.strictEqual(status, '시작전');
});

test('startDate=오늘, endDate=오늘, completed=false면 진행중 (경계값)', () => {
  const status = deriveStatus(
    { completed: false, startDate: todayStr, endDate: todayStr },
    today
  );
  assert.strictEqual(status, '진행중');
});

test('startDate=오늘, endDate=미래, completed=false면 진행중', () => {
  const status = deriveStatus(
    { completed: false, startDate: todayStr, endDate: tomorrow },
    today
  );
  assert.strictEqual(status, '진행중');
});

test('endDate=오늘, completed=false면 진행중(지연 아님, 경계값)', () => {
  const status = deriveStatus(
    { completed: false, startDate: yesterday, endDate: todayStr },
    today
  );
  assert.strictEqual(status, '진행중');
});
