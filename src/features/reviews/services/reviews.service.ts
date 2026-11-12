import { api } from "@/lib/api/client";
import type { Review, CreateReviewInput, UpdateReviewInput, AverageRatingResponse } from "@/types/api";

export const reviewsService = {
  async create(input: CreateReviewInput): Promise<Review> {
    const formData = new FormData();
    formData.append("rating", String(input.rating));
    formData.append("review", input.review);

    return api.post<Review>(
      `/review/review/?booking_id=${input.booking_id}&service_id=${input.service_id}`,
      formData
    );
  },

  async update(reviewId: number | string, input: UpdateReviewInput): Promise<Review> {
    const formData = new FormData();
    formData.append("rating", String(input.rating));
    formData.append("review", input.review);

    return api.patch<Review>(`/review/update_review/${reviewId}/`, formData);
  },

  async delete(reviewId: number | string): Promise<{ message?: string }> {
    return api.delete(`/review/delete_review/${reviewId}/`);
  },

  async getReviewsForService(serviceId: number | string): Promise<Review[] | { results?: Review[] }> {
    return api.get(`/review/get_review/${serviceId}/`, { requiresAuth: false });
  },

  async getAverageRating(serviceId: number | string): Promise<AverageRatingResponse> {
    return api.get<AverageRatingResponse>(`/review/get_average_review_rating/${serviceId}/`, { requiresAuth: false });
  },
};

