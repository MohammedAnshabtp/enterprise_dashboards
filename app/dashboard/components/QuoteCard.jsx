"use client";
export default function QuoteCard({ id, customer, amount, status }) {
  return (
    <div className="p-4 border bg-white rounded">
      <div className="font-medium">
        {id} - {customer}
      </div>
      <div className="text-sm">₹{amount}</div>
      <div className="text-xs text-gray-500">{status}</div>
    </div>
  );
}
