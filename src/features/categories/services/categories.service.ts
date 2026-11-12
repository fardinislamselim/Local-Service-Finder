import { api } from "@/lib/api/client";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/api";

export const categoriesService = {
  async getAll(): Promise<Category[] | { results?: Category[] }> {
    return api.get("/categories/all_category/", { requiresAuth: false });
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    return api.post<Category>("/categories/create_category/", data);
  },

  async update(categoryId: number | string, data: UpdateCategoryRequest): Promise<Category> {
    return api.patch<Category>(`/categories/category_modify/${categoryId}/`, data);
  },

  async delete(categoryId: number | string): Promise<{ message?: string }> {
    return api.delete(`/categories/category_modify/${categoryId}/`);
  },

  async search(keyword: string): Promise<Category[] | { results?: Category[] }> {
    return api.get(`/categories/category_search/?search=${encodeURIComponent(keyword)}`, { requiresAuth: false });
  },
};

