import { api } from "@/lib/api";
import { buildFormData } from "@/lib/formData";
import type { Review, CreateReviewInput, UpdateReviewInput, AverageRatingResponse } from "@/types/api";

export interface CreateReviewPayload {
  bookingId: string;
  serviceId: string;
  rating: number;
  review?: string;
}

interface ReviewWrapper {
  reviews?: Review[];
  data?: Review[];
  results?: Review[];
  [key: string]: unknown;
}

function unwrapReviewsList(res: unknown): Review[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const wrapper = res as ReviewWrapper;
    if (Array.isArray(wrapper.reviews)) return wrapper.reviews;
    if (Array.isArray(wrapper.data)) return wrapper.data;
    if (Array.isArray(wrapper.results)) return wrapper.results;
  }
  return [];
}

export const reviewsService = {
  /**
   * Create Review (Customer — Completed Booking Only)
   * POST /api/v1/review/review/?booking_id={booking_uuid}
   * Auth: Bearer token (CUSTOMER only)
   * Content-Type: multipart/form-data (FormData)
   * Fields: rating (1..5), review (text), service (UUID), booking (UUID)
   */
  async create(input: CreateReviewPayload | CreateReviewInput): Promise<Review> {
    const bId = "bookingId" in input ? input.bookingId : String(input.booking_id);
    const sId = "serviceId" in input ? input.serviceId : String(input.service_id);
    const ratingVal = Number(input.rating);
    const reviewText = input.review?.trim() || "";

    const formData = buildFormData({
      booking: bId,
      service: sId,
      rating: ratingVal,
      review: reviewText,
    });

    return api.post<Review>(`/review/review/?booking_id=${bId}`, formData);
  },

  /**
   * Update Review (Customer)
   * PATCH /api/v1/review/update_review/{pk}/
   * Content-Type: multipart/form-data (FormData)
   */
  async update(reviewId: number | string, input: { rating?: number; review?: string }): Promise<Review> {
    const payload: Record<string, unknown> = {};
    if (input.rating !== undefined) payload.rating = Number(input.rating);
    if (input.review !== undefined) payload.review = input.review.trim();

    const formData = buildFormData(payload);
    return api.patch<Review>(`/review/update_review/${reviewId}/`, formData);
  },

  /**
   * Delete Review (Customer)
   * DELETE /api/v1/review/delete_review/{pk}/
   */
  async delete(reviewId: number | string): Promise<{ details?: string; message?: string }> {
    return api.delete(`/review/delete_review/${reviewId}/`);
  },

  /**
   * Get Reviews for a specific service (Customer role only)
   */
  async getReviewsForService(serviceId: number | string): Promise<Review[]> {
    try {
      const res = await api.get<unknown>(`/review/get_review/${serviceId}/`);
      return unwrapReviewsList(res);
    } catch {
      return [];
    }
  },

  /**
   * Public Average Rating
   */
  async getAverageRating(serviceId: number | string): Promise<AverageRatingResponse> {
    try {
      const res = await api.get<AverageRatingResponse>(
        `/review/get_average_review_rating/${serviceId}/`,
        { requiresAuth: false }
      );
      return res || { average_rating: null };
    } catch {
      return { average_rating: null };
    }
  },
};
