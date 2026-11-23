import { api } from "@/lib/api";
import type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  PaginatedServicesResponse,
} from "@/types/api";

export interface SearchServiceFilterParams {
  page?: number;
  search?: string;
  upazila?: number | string;
  area?: string;
  category?: string;
  pricing_type?: "fixed" | "hourly" | "quotation";
}

interface ServiceResponseWrapper {
  service?: Service[] | Service;
  results?: Service[];
  count?: number;
  next?: string | null;
  previous?: string | null;
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
    const obj = res as Record<string, unknown>;
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
      return obj.data as Service;
    }
    if (obj.service && typeof obj.service === "object" && !Array.isArray(obj.service)) {
      return obj.service as Service;
    }
    if (obj.result && typeof obj.result === "object" && !Array.isArray(obj.result)) {
      return obj.result as Service;
    }
  }
  return res as Service;
}

export const servicesService = {
  /**
   * Main service discovery method supporting:
   * 1. Location search: GET /service/search_service/?upazila={id}&search={term}&area={optional}
   * 2. Category filter: GET /service/filter_service_by_category/{pk}/
   * 3. Pricing type filter: GET /service/filter_service_by_pricingType/?pricing_type={type}
   * 4. Default paginated feed: GET /service/all_service/?page={page}
   */
  async getPaginated(params?: SearchServiceFilterParams): Promise<PaginatedServicesResponse> {
    const page = params?.page || 1;
    const query = new URLSearchParams();
    query.append("page", String(page));

    // 1. Location-based search (upazila integer ID & search keyword)
    if (params?.upazila && params?.search?.trim()) {
      query.append("upazila", String(params.upazila));
      query.append("search", params.search.trim());
      if (params.area?.trim()) {
        query.append("area", params.area.trim());
      }

      const res = await api.get<any>(`/service/search_service/?${query.toString()}`, {
        requiresAuth: false,
      });

      const list = unwrapServicesList(res);
      return {
        count: typeof res?.count === "number" ? res.count : list.length,
        next: res?.next || null,
        previous: res?.previous || null,
        meta: {
          page,
          limit: 12,
          total: typeof res?.count === "number" ? res.count : list.length,
          total_pages: Math.max(1, Math.ceil((res?.count || list.length) / 12)),
          next: res?.next || null,
          previous: res?.previous || null,
        },
        results: list,
      };
    }

    // 2. Filter by Category
    if (params?.category) {
      const res = await api.get<any>(`/service/filter_service_by_category/${params.category}/`, {
        requiresAuth: false,
      });
      const list = unwrapServicesList(res);
      return {
        count: list.length,
        next: null,
        previous: null,
        meta: {
          page: 1,
          limit: list.length || 12,
          total: list.length,
          total_pages: 1,
          next: null,
          previous: null,
        },
        results: list,
      };
    }

    // 3. Filter by Pricing Type
    if (params?.pricing_type) {
      query.append("pricing_type", params.pricing_type);
      const res = await api.get<any>(
        `/service/filter_service_by_pricingType/?${query.toString()}`,
        { requiresAuth: false }
      );
      const list = unwrapServicesList(res);
      return {
        count: typeof res?.count === "number" ? res.count : list.length,
        next: res?.next || null,
        previous: res?.previous || null,
        meta: {
          page,
          limit: 12,
          total: typeof res?.count === "number" ? res.count : list.length,
          total_pages: Math.max(1, Math.ceil((res?.count || list.length) / 12)),
          next: res?.next || null,
          previous: res?.previous || null,
        },
        results: list,
      };
    }

    // 4. Default All Services Feed
    if (params?.search?.trim()) {
      query.append("search", params.search.trim());
    }

    try {
      const res = await api.get<any>(`/service/all_service/?${query.toString()}`, {
        requiresAuth: false,
      });

      // Handle exact backend meta structure
      if (res && res.meta && Array.isArray(res.results)) {
        return {
          count: res.meta.total,
          next: res.meta.next,
          previous: res.meta.previous,
          meta: res.meta,
          results: res.results,
        };
      }

      if (res && res.results && Array.isArray(res.results)) {
        return {
          count: res.count ?? res.results.length,
          next: res.next ?? null,
          previous: res.previous ?? null,
          meta: {
            page,
            limit: 12,
            total: res.count ?? res.results.length,
            total_pages: Math.max(1, Math.ceil((res.count || res.results.length) / 12)),
            next: res.next ?? null,
            previous: res.previous ?? null,
          },
          results: res.results,
        };
      }
      const list = unwrapServicesList(res);
      return {
        count: list.length,
        next: null,
        previous: null,
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
          count: 0,
          next: null,
          previous: null,
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
      const totalPages = firstPage.meta?.total_pages || 1;
      if (totalPages > 1 && totalPages <= 5) {
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

  async getById(serviceId: string | number): Promise<Service | undefined> {
    const cleanId = String(serviceId).trim();
    if (!cleanId) return undefined;

    // 1. Try dedicated public service details endpoint: GET /api/v1/service_details/{uuid}/
    try {
      const res = await api.get<unknown>(`/service_details/${cleanId}/`, {
        requiresAuth: false,
      });
      if (res && typeof res === "object") {
        const unwrapped = unwrapServiceSingle(res);
        if (unwrapped && unwrapped.id) {
          return unwrapped;
        }
      }
    } catch (err) {
      // Fallback if dedicated endpoint is not yet mounted on backend or returns 404
    }

    // 2. Try Provider Services list (if authenticated provider)
    try {
      const providerServices = await this.getProviderServices();
      const foundInProvider = providerServices.find((s) => String(s.id) === cleanId);
      if (foundInProvider) return foundInProvider;
    } catch {
      // ignore
    }

    // 3. Fallback to All Services cache/feed
    try {
      const all = await this.getAll();
      return all.find((s) => String(s.id) === cleanId);
    } catch {
      return undefined;
    }
  },

  async getProviderServices(): Promise<Service[]> {
    const res = await api.get<unknown>("/service/services/");
    return unwrapServicesList(res);
  },

  async create(input: CreateServiceInput): Promise<Service> {
    const formData = new FormData();
    formData.append("name", input.name.trim());
    formData.append("category", String(input.category));
    formData.append("pricing_type", input.pricing_type);

    if (input.pricing_type === "fixed" && input.base_price !== undefined && input.base_price !== "") {
      formData.append("base_price", String(input.base_price));
    }
    if (input.pricing_type === "hourly" && input.hour_base_price !== undefined && input.hour_base_price !== "") {
      formData.append("hour_base_price", String(input.hour_base_price));
    }
    if (input.shot_description?.trim()) {
      formData.append("shot_description", input.shot_description.trim());
    }
    if (input.description?.trim()) {
      formData.append("description", input.description.trim());
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

  async update(serviceId: string | number, input: UpdateServiceInput): Promise<Service> {
    const formData = new FormData();
    if (input.name?.trim()) formData.append("name", input.name.trim());
    if (input.description?.trim()) formData.append("description", input.description.trim());
    if (input.hour_base_price !== undefined && input.hour_base_price !== "") {
      formData.append("hour_base_price", String(input.hour_base_price));
    }
    if (input.image instanceof File) {
      formData.append("image", input.image);
    }

    const res = await api.patch<unknown>(`/service/service_modify/${serviceId}/`, formData);
    return unwrapServiceSingle(res);
  },

  async delete(serviceId: string | number): Promise<{ message?: string }> {
    return api.delete(`/service/service_modify/${serviceId}/`);
  },
};
