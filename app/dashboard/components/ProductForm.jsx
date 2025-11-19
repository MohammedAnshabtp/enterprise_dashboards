"use client";
import { useState } from "react";

export default function ProductForm({ onSave }) {
  const [form, setForm] = useState({ sku: "", name: "", price: "" });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-3 p-4 bg-white border rounded"
    >
      <input
        placeholder="SKU"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, sku: e.target.value })}
      />
      <input
        placeholder="Name"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Price"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        type="submit"
      >
        Save
      </button>
    </form>
  );
}
