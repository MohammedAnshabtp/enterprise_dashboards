export default function CustomerReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customer Reviews</h1>

      <div className="space-y-4">
        {[1, 2, 3].map((r) => (
          <div key={r} className="bg-white border p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Customer {r}</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s}>⭐</span>
                ))}
              </div>
            </div>

            <p className="text-gray-600 mt-2">
              Very good product. I am satisfied with the quality.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
