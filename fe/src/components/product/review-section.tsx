"use client";

import { ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../image-with-fallback";

interface Review {
  id: number;
  author: string;
  rating: number;
  verified: boolean;
  date: string;
  text: string;
  helpful: number;
  notHelpful: number;
  avatar: string;
}

interface ReviewSectionProps {
  reviews: Review[];
}

export default function ReviewSection({ reviews }: ReviewSectionProps) {
  const [helpfulReviews, setHelpfulReviews] = useState<
    Record<number, "helpful" | "notHelpful" | null>
  >({});

  const toggleHelpful = (reviewId: number, type: "helpful" | "notHelpful") => {
    setHelpfulReviews((prev) => ({
      ...prev,
      [reviewId]: prev[reviewId] === type ? null : type
    }));
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex gap-4">
            {/* Avatar */}
            <ImageWithFallback
              src={review.avatar || "/placeholder.svg?height=48&width=48"}
              alt={review.author}
              width={48}
              height={48}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />

            {/* Review Content */}
            <div className="min-w-0 flex-1">
              {/* Header: Author, Verification, Date */}
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground font-semibold">{review.author}</h3>
                  {review.verified && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle size={14} className="fill-green-600" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
                <span className="text-muted-foreground flex-shrink-0 text-xs">{review.date}</span>
              </div>

              {/* Rating Stars */}
              <div className="mb-3 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 w-4 rounded-full ${
                      i < Math.floor(review.rating) ? "bg-orange-400" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-foreground mb-4 text-sm leading-relaxed">{review.text}</p>

              {/* Helpful/Not Helpful Actions */}
              <div className="flex gap-6 text-xs">
                <button
                  onClick={() => toggleHelpful(review.id, "helpful")}
                  className={`flex items-center gap-1 transition-colors ${
                    helpfulReviews[review.id] === "helpful"
                      ? "font-medium text-orange-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span>{review.helpful}</span>
                </button>
                <button
                  onClick={() => toggleHelpful(review.id, "notHelpful")}
                  className={`flex items-center gap-1 transition-colors ${
                    helpfulReviews[review.id] === "notHelpful"
                      ? "font-medium text-red-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsDown size={16} />
                  <span>{review.notHelpful}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
