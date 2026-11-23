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

  async create(data: { name: string; is_active?: boolean; image?: File | null }): Promise<Category> {
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("is_active", String(data.is_active ?? true));
      formData.append("image", data.image);
      return api.post<Category>("/categories/create_category/", formData);
    }
    return api.post<Category>("/categories/create_category/", {
      name: data.name.trim(),
      is_active: data.is_active ?? true,
    });
  },

  async update(
    categoryId: number | string,
    data: { name?: string; is_active?: boolean; image?: File | null }
  ): Promise<Category> {
    if (data.image instanceof File) {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name.trim());
      if (data.is_active !== undefined) formData.append("is_active", String(data.is_active));
      formData.append("image", data.image);
      return api.patch<Category>(`/categories/category_modify/${categoryId}/`, formData);
    }
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
