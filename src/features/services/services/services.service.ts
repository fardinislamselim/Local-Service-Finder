import { api } from "@/lib/api/client";
import type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  SearchServiceParams,
  PaginatedServicesResponse,
} from "@/types/api";

interface ServiceResponseWrapper {
  service?: Service[] | Service;
  results?: Service[];
  meta?: PaginatedServicesResponse["meta"];
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
  async getPaginated(params?: SearchServiceParams): Promise<PaginatedServicesResponse> {
    const query = new URLSearchParams();
    const page = params?.page || 1;
    query.append("page", String(page));

    if (params?.search?.trim()) query.append("search", params.search.trim());
    if (params?.area?.trim()) query.append("area", params.area.trim());
    if (params?.upazila?.trim()) query.append("upazila", params.upazila.trim());

    const hasLocationSearch = Boolean(params?.upazila?.trim() && params?.search?.trim());
    const endpoint = hasLocationSearch
      ? `/service/search_service/?${query.toString()}`
      : `/service/all_service/?${query.toString()}`;

    try {
      const res = await api.get<any>(endpoint, { requiresAuth: false });
      if (res && res.results && res.meta) {
        return res as PaginatedServicesResponse;
      }
      const list = unwrapServicesList(res);
      return {
        meta: {
          page,
          limit: 12,
          total: list.length,
          total_pages: Math.max(1, Math.ceil(list.length / 12)),
          next: null,
          previous: null,
        },
        results: list,
      };
    } catch (err: any) {
      if (err?.statusCode === 404 || String(err?.message).includes("Invalid page")) {
        return {
          meta: {
            page,
            limit: 12,
            total: 0,
            total_pages: 1,
            next: null,
            previous: null,
          },
          results: [],
        };
      }
      throw err;
    }
  },

  async getAll(): Promise<Service[]> {
    try {
      const firstPage = await this.getPaginated({ page: 1 });
      let all = [...firstPage.results];
      const totalPages = firstPage.meta.total_pages || 1;
      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => this.getPaginated({ page: i + 2 }))
        );
        for (const p of remainingPages) {
          all = all.concat(p.results);
        }
      }
      return all;
    } catch {
      const res = await api.get<unknown>("/service/all_service/", { requiresAuth: false });
      return unwrapServicesList(res);
    }
  },

  async getProviderServices(): Promise<Service[]> {
    const res = await api.get<unknown>("/service/services/");
    return unwrapServicesList(res);
  },

  async getById(serviceId: number | string): Promise<Service | undefined> {
    try {
      const providerServices = await this.getProviderServices();
      const foundInProvider = providerServices.find((s) => String(s.id) === String(serviceId));
      if (foundInProvider) return foundInProvider;
    } catch {
      // Guest or customer may not have provider services access
    }
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
    if (input.category !== undefined) formData.append("category", String(input.category));
    if (input.description) formData.append("description", input.description.trim());
    if (input.pricing_type) formData.append("pricing_type", input.pricing_type);
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
