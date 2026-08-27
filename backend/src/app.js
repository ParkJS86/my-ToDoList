const express = require('express');
const pool = require('./db/pool');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use('/auth', authRoutes);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use((req, res, next) => {
  const err = new Error('요청한 리소스를 찾을 수 없습니다.');
  err.status = 404;
  next(err);
});

app.use(errorHandler);

module.exports = app;
