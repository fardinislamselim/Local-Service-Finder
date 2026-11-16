import { api } from "@/lib/api/client";
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
} from "@/types/api";

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
  async book(input: CreateBookingInput): Promise<Booking> {
    const formData = new FormData();
    formData.append("service", String(input.service));
    formData.append("booking_date", input.booking_date);
    formData.append("booking_time", input.booking_time);
    // Backend DRF choicefield expects lowercase "online" | "cash"
    formData.append("final_payment_method", input.final_payment_method.toLowerCase());
    if (input.note) formData.append("note", input.note.trim());

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
    const formData = new FormData();
    if (input.booking_date) formData.append("booking_date", input.booking_date);
    if (input.booking_time) formData.append("booking_time", input.booking_time);
    if (input.note !== undefined) formData.append("note", input.note.trim());

    const res = await api.patch<unknown>(`/booking/booking_update/${bookingId}/`, formData);
    return unwrapBookingSingle(res);
  },

  async cancel(bookingId: number | string, input: CancelBookingInput): Promise<{ message?: string }> {
    const formData = new FormData();
    formData.append("cancellation_reason", input.cancellation_reason.trim());

    return api.post(`/booking/cancel_booking/${bookingId}/`, formData);
  },
};
