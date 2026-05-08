"use client";

export default function BulkDeleteBar({ selectedProducts, onDelete }) {
  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-4 z-50">
      <p>{selectedProducts.length} selected</p>

      <button
        onClick={onDelete}
        className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium"
      >
        Delete Selected
      </button>
    </div>
  );
}
