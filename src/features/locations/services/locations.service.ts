import { api } from "@/lib/api/client";
import type {
  Division,
  District,
  Upazila,
  CreateDivisionInput,
  CreateDistrictInput,
  CreateUpazilaInput,
} from "@/types/api";

export const locationsService = {
  // Divisions
  async getDivisions(): Promise<Division[] | { results?: Division[] }> {
    return api.get("/location/divisions/division_list/", { requiresAuth: false });
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
  async getDistricts(): Promise<District[] | { results?: District[] }> {
    return api.get("/location/districts/district_list/", { requiresAuth: false });
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
  async getUpazilas(): Promise<Upazila[] | { results?: Upazila[] }> {
    return api.get("/location/upazilas/upazila_list/", { requiresAuth: false });
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

