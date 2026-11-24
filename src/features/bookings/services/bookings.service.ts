import { api } from "@/lib/api";
import { buildFormData } from "@/lib/formData";
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
} from "@/types/api";

export interface BookingCreationPayload {
  service: string;
  booking_date: string;
  booking_time: string;
  final_payment_method: "cash" | "online" | string;
  duration?: string; // e.g. "02:00:00" for hourly
  division?: number;
  district?: number;
  upazila?: number;
  area?: string;
  note?: string;
}

interface BookingResponseWrapper {
  message?: string;
  data?: Booking[] | Booking;
  bookings?: Booking[];
  results?: Booking[];
  [key: string]: unknown;
}

function unwrapBookingsList(res: unknown): Booking[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const wrapper = res as BookingResponseWrapper;
    if (Array.isArray(wrapper.data)) return wrapper.data;
    if (Array.isArray(wrapper.bookings)) return wrapper.bookings;
    if (Array.isArray(wrapper.results)) return wrapper.results;
  }
  return [];
}

function unwrapBookingSingle(res: unknown): Booking {
  if (res && typeof res === "object") {
    const wrapper = res as BookingResponseWrapper;
    if (wrapper.data && typeof wrapper.data === "object" && !Array.isArray(wrapper.data)) {
      return wrapper.data as Booking;
    }
  }
  return res as Booking;
}

export const bookingsService = {
  /**
   * Create Booking API:
   * POST /api/v1/booking/service_book/
   * Auth: Bearer token (CUSTOMER role only)
   * Content-Type: multipart/form-data (FormData)
   */
  async book(input: BookingCreationPayload | CreateBookingInput): Promise<Booking> {
    const payload: Record<string, unknown> = {
      service: String(input.service),
      booking_date: input.booking_date,
      booking_time: input.booking_time,
      final_payment_method: input.final_payment_method.toLowerCase(),
    };

    if ("division" in input && input.division !== undefined && input.division !== null) {
      payload.division = Number(input.division);
    }

    if ("district" in input && input.district !== undefined && input.district !== null) {
      payload.district = Number(input.district);
    }

    if ("upazila" in input && input.upazila !== undefined && input.upazila !== null) {
      payload.upazila = Number(input.upazila);
    }

    if ("area" in input && input.area && input.area.trim()) {
      payload.area = input.area.trim();
    }

    if ("duration" in input && input.duration) {
      payload.duration = input.duration;
    }

    if (input.note && input.note.trim()) {
      payload.note = input.note.trim();
    }

    const formData = buildFormData(payload);
    const res = await api.post<unknown>("/booking/service_book/", formData);
    return unwrapBookingSingle(res);
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get<unknown>("/booking/my_bookings/");
    return unwrapBookingsList(res);
  },

  async getProviderBookings(): Promise<Booking[]> {
    const res = await api.get<unknown>("/booking/get_all_booking/");
    return unwrapBookingsList(res);
  },

  async update(bookingId: number | string, input: UpdateBookingInput): Promise<Booking> {
    const payload: Record<string, unknown> = {};
    if (input.booking_date) payload.booking_date = input.booking_date;
    if (input.booking_time) payload.booking_time = input.booking_time;
    if (input.note !== undefined) payload.note = input.note.trim();

    const formData = buildFormData(payload);
    const res = await api.patch<unknown>(`/booking/booking_update/${bookingId}/`, formData);
    return unwrapBookingSingle(res);
  },

  async cancel(bookingId: number | string, input: CancelBookingInput): Promise<{ message?: string }> {
    const formData = buildFormData({
      cancellation_reason: input.cancellation_reason.trim(),
    });

    return api.post(`/booking/cancel_booking/${bookingId}/`, formData);
  },
};
