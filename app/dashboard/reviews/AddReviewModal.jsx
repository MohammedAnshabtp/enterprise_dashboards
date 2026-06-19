// components/reviews/AddReviewModal.jsx

"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { useReviewStore } from "../../store/reviewStore";

export default function AddReviewModal({
  open,
  setOpen,
  productId,
  onSuccess,
}) {
  const { createReview } = useReviewStore();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    rating: 5,
    comment: "",
  });

  const handleSubmit = async () => {
    if (!form.comment.trim()) {
      alert("Comment required");
      return;
    }

    try {
      setLoading(true);

      await createReview(productId, {
        rating: form.rating,
        comment: form.comment,
      });

      alert("Review added successfully");

      setForm({
        rating: 5,
        comment: "",
      });

      setOpen(false);
    } catch (err) {
      console.log(err.response?.data);

      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add Review</h2>

            <p className="text-sm text-gray-500">
              Share your experience with this product
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* RATING */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating
            </label>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      rating: star,
                    }))
                  }
                  className="transition hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      star <= form.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* COMMENT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Review Comment
            </label>

            <textarea
              rows={5}
              placeholder="Write your review here..."
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 rounded-xl border text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
