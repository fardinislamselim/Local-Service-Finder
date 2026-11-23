"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, MessageSquare, Trash2, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewsService } from "@/features/reviews/services/reviews.service";
import type { Booking, Review } from "@/types/api";

interface ReviewModalProps {
  booking: Booking | null;
  existingReview?: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "1: Poor experience",
  2: "2: Fair service",
  3: "3: Good & satisfactory",
  4: "4: Very good quality",
  5: "5: Exceptional craftsmanship!",
};

export function ReviewModal({
  booking,
  existingReview,
  open,
  onOpenChange,
}: ReviewModalProps) {
  const queryClient = useQueryClient();

  const [rating, setRating] = React.useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [reviewText, setReviewText] = React.useState<string>(existingReview?.review || "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Sync state if existing review updates
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.review || "");
    } else {
      setRating(5);
      setReviewText("");
    }
  }, [existingReview]);

  if (!booking) return null;

  const currentDisplayRating = hoverRating || rating;
  const isEditing = Boolean(existingReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && existingReview) {
        // Update review
        await reviewsService.update(existingReview.id, {
          rating,
          review: reviewText.trim() || undefined,
        });
        toast.success("Review updated successfully!");
      } else {
        // Create review:
        // Must send booking_id query param AND { booking, service, rating, review } in FormData
        const serviceId = typeof booking.service === "object" ? booking.service.id : booking.service;
        await reviewsService.create({
          bookingId: String(booking.id),
          serviceId: String(serviceId),
          rating,
          review: reviewText.trim() || undefined,
        });
        toast.success("Thank you! Review and 5-star rating submitted.");
      }

      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["service_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service_rating"] });
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.message || err?.detail || err?.error || "Could not submit review.";
      if (msg.includes("already exists")) {
        toast.info("You have already reviewed this booking.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    setIsDeleting(true);

    try {
      await reviewsService.delete(existingReview.id);
      toast.success("Review deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["service_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service_rating"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete review.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-stone-900 border-stone-200 shadow-xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-1">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
          <DialogTitle className="text-xl font-extrabold font-heading text-stone-900 dark:text-stone-100">
            {isEditing ? "Edit Your Review" : "Rate Your Experience"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            {booking.service_name || booking.service_title || "Verified Service"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-left">
          {/* 5-STAR INTERACTIVE RATING BAR */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <button
                  key={starIndex}
                  type="button"
                  onMouseEnter={() => setHoverRating(starIndex)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(starIndex)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      starIndex <= currentDisplayRating
                        ? "fill-amber-400 text-amber-500"
                        : "text-stone-300 fill-stone-100"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-stone-700 h-5">
              {RATING_LABELS[currentDisplayRating]}
            </div>
          </div>

          {/* WRITTEN REVIEW TEXTAREA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="review-text" className="text-xs font-bold text-stone-700">
                Written Review <span className="font-normal text-stone-400">(Optional)</span>
              </Label>
              <span className="text-[10px] text-stone-400 tabular-nums">
                {reviewText.length}/1000
              </span>
            </div>
            <Textarea
              id="review-text"
              rows={4}
              maxLength={1000}
              placeholder="How was the technician's punctuality, work quality, and behavior?..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="rounded-xl bg-stone-50 border-stone-200 text-xs"
            />
          </div>

          {/* ACTIONS */}
          <div className="pt-2 flex items-center justify-between gap-2.5">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting || isLoading}
                onClick={handleDelete}
                className="rounded-xl h-10 text-xs font-semibold gap-1.5"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || isDeleting}
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-10 text-xs font-medium"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isLoading || isDeleting}
                className="rounded-xl h-10 text-xs font-bold shadow-md gap-1.5"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isEditing ? "Update Review" : "Submit Rating"}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewModal;
