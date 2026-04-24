"use client";

import { useEffect, useState } from "react";
import { useSizeCategoryStore } from "../store/sizeCategoryStore";
import BackButton from "../dashboard/components/BackButton";

export default function SizeCategory() {
  const {
    categories,
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
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center justify-between">
            <BackButton />
            <h1 className="text-xl font-semibold text-black">
              Size Categories
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage product size categories
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Size
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl border shadow-sm">
        {categories.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            No size categories found
          </p>
        ) : (
          <div className="divide-y">
            {categories.map((c) => (
              <div
                key={c._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50"
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
            <h2 className="text-lg font-semibold">
              {editId ? "Edit Size" : "Add Size"}
            </h2>

            <input
              placeholder="Size Name"
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
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
