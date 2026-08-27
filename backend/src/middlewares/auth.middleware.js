const { verifyAccessToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    console.warn('[auth] 인증 실패: Authorization 헤더 없음 또는 형식 오류');
    const err = new Error('인증이 필요합니다.');
    err.status = 401;
    return next(err);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (e) {
    console.warn('[auth] 인증 실패: 토큰 검증 실패');
    const err = new Error('인증 토큰이 유효하지 않습니다.');
    err.status = 401;
    return next(err);
  }

  req.user = { id: payload.userId, role: payload.role };
  next();
}

module.exports = authMiddleware;
