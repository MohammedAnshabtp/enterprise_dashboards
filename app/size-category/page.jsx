"use client";

import { useEffect, useState } from "react";
import BackButton from "../dashboard/components/BackButton";
import { useSizeCategoryStore } from "../store/sizeCategoryStore";
import { Plus } from "lucide-react";
import { ChevronLeft } from "lucide-react";

export default function SizeCategory() {
  const {
    categories,
    pagination = {},
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useSizeCategoryStore();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

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

  const handleEdit = (c) => {
    setEditId(c._id);
    setForm({
      name: c.name,
      description: c.description || "",
    });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border p-4 rounded-2xl">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* BACK BUTTON */}
          <button
            onClick={() => window.history.back()}
            className="h-12 w-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>

          {/* TITLE */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 text-xl">🏠</span>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Size Categories
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage product size categories
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* TOTAL */}
          <div className="hidden md:flex flex-col px-5 py-3 rounded-2xl bg-gray-50 border">
            <span className="text-xs text-gray-500">Total Categories</span>

            <span className="text-xl font-bold text-gray-800">
              {pagination?.totalItems || 0}
            </span>
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 font-medium shadow-lg shadow-indigo-200 transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl border shadow-md">
        {categories.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            No size categories found
          </p>
        ) : (
          <div className="divide-y">
            {categories.map((c) => (
              <div
                key={c._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50 hover:rounded-xl"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{c.name}</h3>
                  <p className="text-sm text-gray-500">
                    {c.description || "No description"}
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      deleteCategory(c._id);
                      fetchCategories();
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 flex justify-center items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold text-black">
              {editId ? "Edit Size" : "Add Size"}
            </h2>

            <input
              placeholder="Size Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-3 rounded text-black"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border p-3 rounded text-black"
            />

            <div className="flex justify-end gap-3 text-black">
              <button onClick={() => setOpen(false)}>Cancel</button>

              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
