const fs = require('fs');
const path = require('path');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const method = req.method;
    const reqPath = req.originalUrl;
    const status = res.statusCode;
    const userId = req.user?.id ?? '-';
    const line = `[${new Date().toISOString()}] ${method} ${reqPath} ${status} ${durationMs}ms userId=${userId}`;

    if (process.env.NODE_ENV === 'production') {
      const logDir = path.join(__dirname, '..', '..', 'logs');
      const fileName = `app_${new Date().toISOString().slice(0, 10)}.log`;
      const filePath = path.join(logDir, fileName);
      fs.mkdirSync(logDir, { recursive: true });
      fs.appendFile(filePath, line + '\n', (err) => {
        if (err) console.error('로그 파일 쓰기 실패:', err.message);
      });
    } else {
      console.log(line);
    }
  });

  next();
}

module.exports = requestLogger;
