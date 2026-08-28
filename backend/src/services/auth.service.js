const bcrypt = require('bcrypt');
const { findUserByEmail, createUser, findUserById } = require('../queries/user.queries');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { toUserDto } = require('../utils/userDto');

async function signup({ email, password, name }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const e = new Error('이미 가입된 이메일입니다.');
    e.status = 400;
    throw e;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const row = await createUser({ email, passwordHash, name });
  console.log('[auth] signup success', { userId: row.user_id, email: row.email });
  return toUserDto(row);
}

async function login({ email, password }) {
  const row = await findUserByEmail(email);
  const invalid = () => {
    const e = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    e.status = 401;
    return e;
  };
  if (!row) {
    console.warn('[auth] login failed', { email });
    throw invalid();
  }
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    console.warn('[auth] login failed', { email });
    throw invalid();
  }
  const payload = { userId: row.user_id, role: row.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  console.log('[auth] login success', { userId: row.user_id });
  return { accessToken, refreshToken, user: toUserDto(row) };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    const e = new Error('Refresh Token이 없습니다.');
    e.status = 401;
    throw e;
  }
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    const e = new Error('Refresh Token이 유효하지 않습니다.');
    e.status = 401;
    throw e;
  }
  const row = await findUserById(payload.userId);
  if (!row) {
    const e = new Error('Refresh Token이 유효하지 않습니다.');
    e.status = 401;
    throw e;
  }
  const accessToken = signAccessToken({ userId: row.user_id, role: row.role });
  return { accessToken, user: toUserDto(row) };
}

module.exports = { signup, login, refresh };
