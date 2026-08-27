function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'Admin') {
    console.warn('[admin] 인가 실패', { userId: req.user?.id, role: req.user?.role });
    const err = new Error('관리자 권한이 필요합니다.');
    err.status = 403;
    return next(err);
  }
  next();
}

module.exports = adminMiddleware;
