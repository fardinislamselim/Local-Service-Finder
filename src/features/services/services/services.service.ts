import { api } from "@/lib/api/client";
import type { Service, CreateServiceInput, UpdateServiceInput, SearchServiceParams } from "@/types/api";

export const servicesService = {
  async getAll(): Promise<Service[] | { results?: Service[] }> {
    return api.get("/service/all_service/", { requiresAuth: false });
  },

  async getProviderServices(): Promise<Service[] | { results?: Service[] }> {
    return api.get("/service/services/");
  },

  async create(input: CreateServiceInput): Promise<Service> {
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("category", String(input.category));
    formData.append("description", input.description);
    formData.append("pricing_type", input.pricing_type);

    if (input.base_price !== undefined) {
      formData.append("base_price", String(input.base_price));
    }
    if (input.hour_base_price !== undefined) {
      formData.append("hour_base_price", String(input.hour_base_price));
    }
    if (input.is_active !== undefined) {
      formData.append("is_active", String(input.is_active));
    }
    if (input.image instanceof File) {
      formData.append("image", input.image);
    }

    return api.post<Service>("/service/services/", formData);
  },

  async update(serviceId: number | string, input: UpdateServiceInput): Promise<Service> {
    const formData = new FormData();
    if (input.name) formData.append("name", input.name);
    if (input.description) formData.append("description", input.description);
    if (input.hour_base_price !== undefined) formData.append("hour_base_price", String(input.hour_base_price));
    if (input.base_price !== undefined) formData.append("base_price", String(input.base_price));
    if (input.is_active !== undefined) formData.append("is_active", String(input.is_active));
    if (input.image instanceof File) formData.append("image", input.image);

    return api.patch<Service>(`/service/service_modify/${serviceId}/`, formData);
  },

  async delete(serviceId: number | string): Promise<{ message?: string }> {
    return api.delete(`/service/service_modify/${serviceId}/`);
  },

  async search(params: SearchServiceParams): Promise<Service[] | { results?: Service[] }> {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.area) query.append("area", params.area);
    if (params.upazila) query.append("upazila", params.upazila);

    return api.get(`/service/search_service/?${query.toString()}`, { requiresAuth: false });
  },
};

