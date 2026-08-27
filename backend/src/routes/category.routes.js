const express = require('express');
const categoryService = require('../services/category.service');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

function validateId(idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    const e = new Error('유효하지 않은 카테고리 id입니다.');
    e.status = 400;
    throw e;
  }
  return id;
}

function validateName(name) {
  if (typeof name !== 'string' || !name.trim()) {
    const e = new Error('카테고리 이름은 필수입니다.');
    e.status = 400;
    throw e;
  }
}

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body || {};
    validateName(name);
    const category = await categoryService.create({ name, adminId: req.user.id });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    const { name } = req.body || {};
    validateName(name);
    const category = await categoryService.update(id, { name, adminId: req.user.id });
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    await categoryService.remove(id, req.user.id);
    res.status(200).json({ message: '카테고리가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
