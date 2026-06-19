"use client";

import { useState } from "react";

export default function BulkUploadModal({ open, onClose, onUpload }) {
  const [file, setFile] = useState(null);

  const [stockOnly, setStockOnly] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-5">
        <h2 className="text-xl font-semibold">Bulk Upload Products</h2>

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => setStockOnly(e.target.checked)}
          />

          <span className="text-sm">Update stock only</span>
        </label>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            onClick={() => onUpload(file, stockOnly)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
