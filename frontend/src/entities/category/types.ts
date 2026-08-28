export interface Category {
  categoryId: number;
  name: string;
  isDefault: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}
