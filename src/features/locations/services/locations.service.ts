import { api } from "@/lib/api/client";
import type {
  Division,
  District,
  Upazila,
  CreateDivisionInput,
  CreateDistrictInput,
  CreateUpazilaInput,
} from "@/types/api";

interface LocationWrapper {
  division?: Division[];
  district?: District[];
  upazila?: Upazila[];
  results?: unknown[];
  [key: string]: unknown;
}

function unwrapList<T>(res: unknown, key: string): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const wrapper = res as LocationWrapper;
    if (Array.isArray(wrapper[key])) return wrapper[key] as T[];
    if (Array.isArray(wrapper.results)) return wrapper.results as T[];
  }
  return [];
}

export const locationsService = {
  // Divisions
  async getDivisions(): Promise<Division[]> {
    const res = await api.get<unknown>("/location/divisions/division_list/", { requiresAuth: false });
    return unwrapList<Division>(res, "division");
  },

  async createDivision(data: CreateDivisionInput): Promise<Division> {
    return api.post<Division>("/location/divisions/create_division/", data);
  },

  async updateDivision(id: number | string, data: CreateDivisionInput): Promise<Division> {
    return api.patch<Division>(`/location/divisions/update_division/${id}/`, data);
  },

  async deleteDivision(id: number | string): Promise<{ message?: string }> {
    return api.delete(`/location/divisions/delete_division/${id}/`);
  },

  // Districts
  async getDistricts(): Promise<District[]> {
    const res = await api.get<unknown>("/location/districts/district_list/", { requiresAuth: false });
    return unwrapList<District>(res, "district");
  },

  async createDistrict(data: CreateDistrictInput): Promise<District> {
    return api.post<District>("/location/districts/create_district/", data);
  },

  async updateDistrict(id: number | string, data: Partial<CreateDistrictInput>): Promise<District> {
    return api.patch<District>(`/location/districts/update_district/${id}/`, data);
  },

  async deleteDistrict(id: number | string): Promise<{ message?: string }> {
    return api.delete(`/location/districts/delete_district/${id}/`);
  },

  // Upazilas
  async getUpazilas(): Promise<Upazila[]> {
    const res = await api.get<unknown>("/location/upazilas/upazila_list/", { requiresAuth: false });
    return unwrapList<Upazila>(res, "upazila");
  },

  async createUpazila(data: CreateUpazilaInput): Promise<Upazila> {
    return api.post<Upazila>("/location/upazilas/create_upazila/", data);
  },

  async updateUpazila(id: number | string, data: Partial<CreateUpazilaInput>): Promise<Upazila> {
    return api.patch<Upazila>(`/location/upazilas/update_upazila/${id}/`, data);
  },

  async deleteUpazila(id: number | string): Promise<{ message?: string }> {
    return api.delete(`/location/upazilas/delete_upazila/${id}/`);
  },
};
