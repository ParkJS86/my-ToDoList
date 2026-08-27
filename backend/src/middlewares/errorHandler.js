function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || '서버 오류가 발생했습니다.';

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: { message, status } });
}

module.exports = errorHandler;
