const express = require('express');
const userService = require('../services/user.service');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

router.patch('/me', authMiddleware, async (req, res, next) => {
  try {
    const { name, password } = req.body || {};
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      const e = new Error('이름 형식이 올바르지 않습니다.');
      e.status = 400;
      throw e;
    }
    if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
      const e = new Error('비밀번호는 8자 이상이어야 합니다.');
      e.status = 400;
      throw e;
    }
    const user = await userService.updateMe(req.user.id, { name, password });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    console.log('[user] 전체 목록 조회', { adminId: req.user.id });
    const users = await userService.listAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
