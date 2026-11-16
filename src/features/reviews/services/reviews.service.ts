import { api } from "@/lib/api/client";
import type { Review, CreateReviewInput, UpdateReviewInput, AverageRatingResponse } from "@/types/api";

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
  async create(input: CreateReviewInput): Promise<Review> {
    const formData = new FormData();
    formData.append("rating", String(input.rating));
    formData.append("review", input.review.trim());

    return api.post<Review>(
      `/review/review/?booking_id=${input.booking_id}&service_id=${input.service_id}`,
      formData
    );
  },

  async update(reviewId: number | string, input: UpdateReviewInput): Promise<Review> {
    const formData = new FormData();
    formData.append("rating", String(input.rating));
    formData.append("review", input.review.trim());

    return api.patch<Review>(`/review/update_review/${reviewId}/`, formData);
  },

  async delete(reviewId: number | string): Promise<{ message?: string }> {
    return api.delete(`/review/delete_review/${reviewId}/`);
  },

  async getReviewsForService(serviceId: number | string): Promise<Review[]> {
    try {
      const res = await api.get<unknown>(`/review/get_review/${serviceId}/`);
      return unwrapReviewsList(res);
    } catch {
      // Backend requires IsAuthenticated for get_review; graceful fallback for guest visitors
      return [];
    }
  },

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
