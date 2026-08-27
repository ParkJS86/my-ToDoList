function toUserDto(row) {
  return {
    userId: row.user_id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { toUserDto };
