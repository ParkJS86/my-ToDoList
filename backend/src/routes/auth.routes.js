const express = require('express');
const authService = require('../services/auth.service');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7일

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, decodeURIComponent(rest.join('='))];
    })
  );
}

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !EMAIL_REGEX.test(email)) {
      const e = new Error('이메일 형식이 올바르지 않습니다.');
      e.status = 400;
      throw e;
    }
    if (!password || password.length < 8) {
      const e = new Error('비밀번호는 8자 이상이어야 합니다.');
      e.status = 400;
      throw e;
    }
    if (!name) {
      const e = new Error('이름은 필수입니다.');
      e.status = 400;
      throw e;
    }
    const user = await authService.signup({ email, password, name });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !EMAIL_REGEX.test(email) || !password) {
      const e = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      e.status = 400;
      throw e;
    }
    const { accessToken, refreshToken, user } = await authService.login({ email, password });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
    res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = parseCookies(req);
    const { accessToken, user } = await authService.refresh(refreshToken);
    res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { path: '/' });
  res.status(200).json({ message: '로그아웃되었습니다.' });
});

module.exports = router;
