"use client";

import { Button } from "@/components/ui/button";
import { Star, MessageCircle } from "lucide-react";

export default function RatingDistribution() {
  const ratings = [
    { stars: 5, count: 150, percentage: 71 },
    { stars: 4, count: 40, percentage: 19 },
    { stars: 3, count: 15, percentage: 7 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 2, percentage: 1 }
  ];

  const totalReviews = ratings.reduce((sum, r) => sum + r.count, 0);
  const averageRating = 4.3;

  return (
    <div className="space-y-8">
      {/* Rating Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">{averageRating}</span>
                <span className="text-muted-foreground text-2xl">/5</span>
              </div>
              <div className="mt-3 mb-3 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={
                      i < Math.floor(averageRating)
                        ? "fill-orange-400 text-orange-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Based on {totalReviews} verified reviews
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="default" className="bg-black text-white hover:bg-gray-800">
            Write a review
          </Button>
          <Button variant="outline">
            <MessageCircle size={16} className="mr-2" />
            Ask a question
          </Button>
        </div>
      </div>

      {/* Rating Distribution Bars */}
      <div className="space-y-3">
        {ratings.map((rating) => (
          <div key={rating.stars} className="flex items-center gap-4">
            <div className="flex w-12 items-center gap-2">
              <span className="text-sm font-medium">{rating.stars}</span>
              <Star size={14} className="fill-orange-400 text-orange-400" />
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-orange-400"
                style={{ width: `${rating.percentage}%` }}
              />
            </div>
            <span className="text-muted-foreground w-10 text-right text-sm">{rating.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
