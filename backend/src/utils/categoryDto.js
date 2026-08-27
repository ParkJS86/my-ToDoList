function toCategoryDto(row) {
  return {
    categoryId: row.category_id,
    name: row.name,
    isDefault: row.is_default,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { toCategoryDto };
