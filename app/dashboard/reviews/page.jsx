// app/reviews/page.jsx

"use client";

import { useEffect } from "react";
import { Star } from "lucide-react";
import { useReviewStore } from "../../store/reviewStore";

export default function ReviewsPage({ productId }) {
  const { reviews = [], fetchProductReviews } = useReviewStore();

  useEffect(() => {
    if (productId) {
      fetchProductReviews(productId);
    }
  }, [productId]);

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Customer Reviews
        </h2>

        <p className="text-sm text-gray-500">
          Real feedback from verified buyers
        </p>
      </div>

      {/* EMPTY */}
      {reviews.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
          No reviews yet
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border rounded-2xl p-5 shadow-sm"
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* AVATAR */}
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">
                    {review.user?.name?.charAt(0) || "U"}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {review.user?.name || "User"}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* RATING */}
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />

                  <span className="text-sm font-semibold text-yellow-700">
                    {review.rating}
                  </span>
                </div>
              </div>

              {/* COMMENT */}
              <div className="mt-4">
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
