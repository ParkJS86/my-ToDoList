const express = require('express');
const todoService = require('../services/todo.service');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

function validateId(idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    const e = new Error('유효하지 않은 todo id입니다.');
    e.status = 400;
    throw e;
  }
  return id;
}

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, memo, startDate, endDate, categoryId } = req.body || {};
    if (!title || !startDate || !endDate) {
      const e = new Error('title, startDate, endDate는 필수입니다.');
      e.status = 400;
      throw e;
    }
    const todo = await todoService.create({ userId: req.user.id, categoryId, title, memo, startDate, endDate });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { categoryId, status } = req.query;
    const todos = await todoService.list(req.user.id, { categoryId, status });
    res.status(200).json(todos);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    const todo = await todoService.update(id, req.user.id, req.body || {});
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    await todoService.remove(id, req.user.id);
    res.status(200).json({ message: 'Todo가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
