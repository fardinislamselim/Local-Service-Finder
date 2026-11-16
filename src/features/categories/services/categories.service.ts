import { api } from "@/lib/api/client";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/api";

interface CategoryWrapper {
  results?: Category[];
  categories?: Category[];
  category?: Category[];
  [key: string]: unknown;
}

function unwrapCategoriesList(res: unknown): Category[] {
  if (Array.isArray(res)) return res as Category[];
  if (res && typeof res === "object") {
    const wrapper = res as CategoryWrapper;
    if (Array.isArray(wrapper.results)) return wrapper.results;
    if (Array.isArray(wrapper.categories)) return wrapper.categories;
    if (Array.isArray(wrapper.category)) return wrapper.category;
  }
  return [];
}

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<unknown>("/categories/all_category/", { requiresAuth: false });
    return unwrapCategoriesList(res);
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

  async search(keyword: string): Promise<Category[]> {
    const res = await api.get<unknown>(
      `/categories/category_search/?search=${encodeURIComponent(keyword.trim())}`,
      { requiresAuth: false }
    );
    return unwrapCategoriesList(res);
  },
};
