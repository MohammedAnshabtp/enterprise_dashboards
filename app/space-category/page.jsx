"use client";

import { useEffect, useState } from "react";
import { useSpaceCategoryStore } from "../store/spaceCategoryStore";
import BackButton from "../dashboard/components/BackButton";

export default function SpaceCategory() {
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useSpaceCategoryStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!name) return alert("Name required");

    if (editId) {
      await updateCategory(editId, { name });
    } else {
      await createCategory({ name });
    }

    setName("");
    setEditId(null);
    setOpen(false);
    fetchCategories();
  };

  const handleEdit = (c) => {
    setEditId(c.id || c._id);
    setName(c.name);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-xl font-semibold text-black">Space Categories</h1>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Category
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow-sm border">
        {categories.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No categories found</p>
        ) : (
          <div className="divide-y">
            {categories.map((c, index) => (
              <div
                key={c.id || c._id || index}
                className="flex justify-between items-center p-4 hover:bg-gray-50"
              >
                <span className="font-medium text-black">{c.name}</span>

                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-indigo-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      deleteCategory(c.id || c._id);
                      fetchCategories();
                    }}
                    className="text-red-500"
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
              {editId ? "Edit Category" : "Add Category"}
            </h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category Name"
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
