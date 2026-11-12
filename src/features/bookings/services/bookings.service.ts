import { api } from "@/lib/api/client";
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
} from "@/types/api";

export const bookingsService = {
  async book(input: CreateBookingInput): Promise<Booking> {
    const formData = new FormData();
    formData.append("service", String(input.service));
    formData.append("booking_date", input.booking_date);
    formData.append("booking_time", input.booking_time);
    formData.append("final_payment_method", input.final_payment_method);
    if (input.note) formData.append("note", input.note);

    return api.post<Booking>("/booking/service_book/", formData);
  },

  async getMyBookings(): Promise<Booking[] | { results?: Booking[] }> {
    return api.get("/booking/my_bookings/");
  },

  async getProviderBookings(): Promise<Booking[] | { results?: Booking[] }> {
    return api.get("/booking/get_all_booking/");
  },

  async update(bookingId: number | string, input: UpdateBookingInput): Promise<Booking> {
    const formData = new FormData();
    if (input.booking_date) formData.append("booking_date", input.booking_date);
    if (input.booking_time) formData.append("booking_time", input.booking_time);
    if (input.note !== undefined) formData.append("note", input.note);

    return api.patch<Booking>(`/booking/booking_update/${bookingId}/`, formData);
  },

  async cancel(bookingId: number | string, input: CancelBookingInput): Promise<{ message?: string }> {
    const formData = new FormData();
    formData.append("cancellation_reason", input.cancellation_reason);

    return api.post(`/booking/cancel_booking/${bookingId}/`, formData);
  },
};

