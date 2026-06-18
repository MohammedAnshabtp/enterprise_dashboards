// app/admin-reviews/page.jsx

"use client";

import { Star, Trash2 } from "lucide-react";
import { useAdminReviews, useDeleteReview } from "../../hooks/useReviews";
import dayjs from "../../lib/dayjs";

export default function AdminReviewsPage() {
  const { data: reviews = [], isLoading } = useAdminReviews();
  const deleteReview = useDeleteReview();

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Reviews</h1>
          <p className="text-sm text-gray-500">
            Manage customer reviews and ratings
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No reviews found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    User
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Product
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Review
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Rating
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((review) => (
                  <tr
                    key={review._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {review.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.user?.email || ""}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            review.product?.thumbnail?.url || "/placeholder.png"
                          }
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {review.product?.name || "Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.product?.brand || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 max-w-sm">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {review.comment}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-gray-500">
                      {dayjs(review.createdAt).format("DD MMM YYYY")}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteReview.mutate(review._id)}
                        disabled={deleteReview.isPending}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
