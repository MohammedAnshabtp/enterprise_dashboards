"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";
import {
  useProductStyle,
  useCreateProductStyle,
  useUpdateProductStyle,
  useDeleteProductStyle,
} from "../../hooks/useProductStyle";

const EMPTY_FORM = { name: "", description: "" };

export default function ProductStylePage() {
  const { data: styles = [], isLoading } = useProductStyle();
  const createStyle = useCreateProductStyle();
  const updateStyle = useUpdateProductStyle();
  const deleteStyle = useDeleteProductStyle();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }

    if (editId) {
      updateStyle.mutate(
        { id: editId, data: form },
        {
          onSuccess: () => {
            setForm(EMPTY_FORM);
            setEditId(null);
            setOpen(false);
          },
        }
      );
    } else {
      createStyle.mutate(form, {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setOpen(false);
        },
      });
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ name: item.name, description: item.description || "" });
    setOpen(true);
  };

  const isPending = createStyle.isPending || updateStyle.isPending;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-xl font-semibold text-black">Product Styles</h1>
        </div>

        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditId(null);
            setOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Add Style
        </button>
      </div>

      <div className="bg-white rounded-xl border">
        {isLoading ? (
          <p className="p-6 text-center text-gray-500">Loading...</p>
        ) : styles.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No styles found</p>
        ) : (
          styles.map((s) => (
            <div key={s._id} className="p-4 flex justify-between border-b">
              <div>
                <h3 className="font-medium text-black">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>

              <div className="flex gap-3 text-sm text-indigo-600">
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button
                  onClick={() => deleteStyle.mutate(s._id)}
                  disabled={deleteStyle.isPending}
                  className="text-red-500 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
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
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {editId ? "Edit Style" : "Add New Style"}
              </h2>
              <p className="text-sm text-gray-500">
                Manage your product style details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Style Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter style name"
                  className="w-full mt-1 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Enter description"
                  className="w-full mt-1 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-60"
              >
                {isPending ? "Saving..." : editId ? "Update Style" : "Create Style"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
