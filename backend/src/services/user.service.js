const bcrypt = require('bcrypt');
const { updateUser, findAllUsers } = require('../queries/user.queries');
const { toUserDto } = require('../utils/userDto');

async function updateMe(userId, { name, password }) {
  if (name === undefined && password === undefined) {
    const e = new Error('수정할 정보가 없습니다.');
    e.status = 400;
    throw e;
  }
  const passwordHash = password !== undefined ? await bcrypt.hash(password, 10) : undefined;
  const row = await updateUser(userId, { name, passwordHash });
  console.log('[user] 정보 수정', { userId });
  return toUserDto(row);
}

async function listAllUsers() {
  const rows = await findAllUsers();
  return rows.map(toUserDto);
}

module.exports = { updateMe, listAllUsers };
