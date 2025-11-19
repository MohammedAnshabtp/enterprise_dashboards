"use client";
export default function ReviewCard({ name, rating, text }) {
  return (
    <div className="p-4 bg-white border rounded">
      <div className="font-medium">{name}</div>
      <div className="text-yellow-600">{"★".repeat(rating)}</div>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
