"use client";

import { useEffect, useState } from "react";
import { useUsageCategoryStore } from "../../store/useUsageCategoryStore";

export default function TileUsagePage() {
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useUsageCategoryStore();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!form.name) return alert("Name required");

    if (editId) {
      await updateCategory(editId, form);
    } else {
      await createCategory(form);
    }

    setForm({ name: "", description: "" });
    setEditId(null);
    setOpen(false);
    fetchCategories();
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Tile Usage Category</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Add Category
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-xl divide-y">
        {categories.map((c) => (
          <div key={c._id} className="p-4 flex justify-between">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500">{c.description}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditId(c._id);
                  setForm(c);
                  setOpen(true);
                }}
                className="text-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => deleteCategory(c._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h2>{editId ? "Edit" : "Add"} Category</h2>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-3 rounded"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border p-3 rounded"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setOpen(false)}>Cancel</button>
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
