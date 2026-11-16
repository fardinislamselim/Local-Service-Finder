import { api } from "@/lib/api/client";
import type { Service, CreateServiceInput, UpdateServiceInput, SearchServiceParams } from "@/types/api";

interface ServiceResponseWrapper {
  service?: Service[] | Service;
  results?: Service[];
  [key: string]: unknown;
}

function unwrapServicesList(res: unknown): Service[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const wrapper = res as ServiceResponseWrapper;
    if (Array.isArray(wrapper.service)) return wrapper.service;
    if (Array.isArray(wrapper.results)) return wrapper.results;
  }
  return [];
}

function unwrapServiceSingle(res: unknown): Service {
  if (res && typeof res === "object") {
    const wrapper = res as ServiceResponseWrapper;
    if (wrapper.service && typeof wrapper.service === "object" && !Array.isArray(wrapper.service)) {
      return wrapper.service as Service;
    }
  }
  return res as Service;
}

export const servicesService = {
  async getAll(): Promise<Service[]> {
    const res = await api.get<unknown>("/service/all_service/", { requiresAuth: false });
    return unwrapServicesList(res);
  },

  async getProviderServices(): Promise<Service[]> {
    const res = await api.get<unknown>("/service/services/");
    return unwrapServicesList(res);
  },

  async getById(serviceId: number | string): Promise<Service | undefined> {
    const all = await this.getAll();
    return all.find((s) => String(s.id) === String(serviceId));
  },

  async create(input: CreateServiceInput): Promise<Service> {
    const formData = new FormData();
    formData.append("name", input.name.trim());
    formData.append("category", String(input.category));
    formData.append("description", input.description.trim());
    formData.append("pricing_type", input.pricing_type);

    if (input.base_price !== undefined && input.base_price !== "") {
      formData.append("base_price", String(input.base_price));
    }
    if (input.hour_base_price !== undefined && input.hour_base_price !== "") {
      formData.append("hour_base_price", String(input.hour_base_price));
    }
    if (input.is_active !== undefined) {
      formData.append("is_active", String(input.is_active));
    }
    if (input.image instanceof File) {
      formData.append("image", input.image);
    }

    const res = await api.post<unknown>("/service/services/", formData);
    return unwrapServiceSingle(res);
  },

  async update(serviceId: number | string, input: UpdateServiceInput): Promise<Service> {
    const formData = new FormData();
    if (input.name) formData.append("name", input.name.trim());
    if (input.description) formData.append("description", input.description.trim());
    if (input.hour_base_price !== undefined && input.hour_base_price !== "") {
      formData.append("hour_base_price", String(input.hour_base_price));
    }
    if (input.base_price !== undefined && input.base_price !== "") {
      formData.append("base_price", String(input.base_price));
    }
    if (input.is_active !== undefined) {
      formData.append("is_active", String(input.is_active));
    }
    if (input.image instanceof File) {
      formData.append("image", input.image);
    }

    const res = await api.patch<unknown>(`/service/service_modify/${serviceId}/`, formData);
    return unwrapServiceSingle(res);
  },

  async delete(serviceId: number | string): Promise<{ message?: string }> {
    return api.delete(`/service/service_modify/${serviceId}/`);
  },

  async search(params: SearchServiceParams): Promise<Service[]> {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search.trim());
    if (params.area) query.append("area", params.area.trim());
    if (params.upazila) query.append("upazila", params.upazila.trim());

    const res = await api.get<unknown>(`/service/search_service/?${query.toString()}`, { requiresAuth: false });
    return unwrapServicesList(res);
  },
};
