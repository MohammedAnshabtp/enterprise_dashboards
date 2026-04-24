"use client";

import { useEffect, useState } from "react";
import { useProductStyleStore } from "../store/productStyleStore";
import BackButton from "../dashboard/components/BackButton";

export default function ProductStylePage() {
  const { styles, fetchStyles, createStyle, updateStyle, deleteStyle } =
    useProductStyleStore();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchStyles();
  }, []);

  const handleSubmit = async () => {
    if (!form.name) return alert("Name required");

    if (editId) {
      await updateStyle(editId, form);
    } else {
      await createStyle(form);
    }

    setForm({ name: "", description: "" });
    setEditId(null);
    setOpen(false);
    fetchStyles();
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      name: item.name,
      description: item.description || "",
    });
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-xl font-semibold text-black">Product Styles</h1>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Add Style
        </button>
      </div>

      <div className="bg-white rounded-xl border">
        {styles.map((s) => (
          <div key={s._id} className="p-4 flex justify-between border-b">
            <div>
              <h3 className="font-medium text-black">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.description}</p>
            </div>

            <div className="flex gap-3 text-sm text-indigo-600">
              <button onClick={() => handleEdit(s)}>Edit</button>
              <button
                onClick={() => {
                  deleteStyle(s._id);
                  fetchStyles();
                }}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-fadeIn"
          >
            {/* TITLE */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {editId ? "Edit Style" : "Add New Style"}
              </h2>
              <p className="text-sm text-gray-500">
                Manage your product style details
              </p>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              {/* NAME */}
              <div>
                <label className="text-sm text-gray-600">Style Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter style name"
                  className="w-full mt-1 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm text-gray-600">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Enter description"
                  className="w-full mt-1 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                {editId ? "Update Style" : "Create Style"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
