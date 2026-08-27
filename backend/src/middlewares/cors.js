// CORS_ORIGIN 환경변수(콤마 구분 허용 origin 목록)를 기준으로 CORS 헤더를 설정한다.
// Refresh Token이 httpOnly 쿠키로 오가야 하므로 Allow-Credentials를 켜고,
// 그 경우 와일드카드(*)를 쓸 수 없어 요청 Origin이 허용 목록에 있을 때만 그 값을 그대로 반영한다.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function cors(req, res, next) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}

module.exports = cors;
