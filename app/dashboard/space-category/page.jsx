/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useSpaceCategoryStore } from "../../store/spaceCategoryStore";

export default function SpaceCategory() {
  const {
    categories = [],
    pagination = {},
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useSpaceCategoryStore();

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    alt: "",
    image: null,
  });

  const [preview, setPreview] = useState("");

  // ================= FETCH =================

  useEffect(() => {
    fetchCategories({
      page,
      limit,
    });
  }, [page]);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // IMAGE
    if (name === "image") {
      const file = files?.[0];

      if (!file) return;

      setForm((prev) => ({
        ...prev,
        image: file,
      }));

      setPreview(URL.createObjectURL(file));

      return;
    }

    // NORMAL INPUT
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= RESET =================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      alt: "",
      image: null,
    });

    setPreview("");
    setEditId(null);
  };

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Category name required");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("alt", form.alt);

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      if (editId) {
        await updateCategory(editId, formData);

        alert("Category updated");
      } else {
        await createCategory(formData);

        alert("Category created");
      }

      await fetchCategories({
        page,
        limit,
      });

      resetForm();

      setOpen(false);
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  // ================= EDIT =================

  const handleEdit = (c) => {
    setEditId(c._id);

    setForm({
      name: c.name || "",
      description: c.description || "",
      alt: c.alt || "",
      image: null,
    });

    setPreview(c?.image?.url || c?.image || "");

    setOpen(true);
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this category?");

    if (!confirmDelete) return;

    try {
      await deleteCategory(id);

      await fetchCategories({
        page,
        limit,
      });

      alert("Category deleted");
    } catch (err) {
      console.log(err);

      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
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
                  Space Categories
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Manage room spaces and gallery categories
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
      </div>

      {/* ================= LIST ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden border animate-pulse"
            >
              <div className="h-56 bg-gray-200" />

              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/2" />

                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-16 text-center border">
            <h3 className="text-xl font-semibold text-gray-700">
              No Categories Found
            </h3>

            <p className="text-gray-500 mt-2">
              Create your first space category
            </p>
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition duration-300"
            >
              {/* IMAGE */}

              <div className="relative h-56 overflow-hidden">
                <img
                  src={c?.image?.url || c?.image || "/placeholder.png"}
                  alt={c?.image?.alt || c?.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-700"
                />

                {/* ACTIONS */}

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-indigo-600 hover:bg-white shadow"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(c._id)}
                    className="h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-red-500 hover:bg-white shadow"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {c.description || "No description"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= PAGINATION ================= */}

      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-6 flex-wrap">
          {/* PREVIOUS */}

          <button
            disabled={!pagination?.hasPrevPage}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 ${
              pagination?.hasPrevPage
                ? "bg-white hover:bg-gray-100 text-gray-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {/* PAGE NUMBERS */}

          <div className="flex items-center gap-2 flex-wrap">
            {Array.from(
              { length: pagination?.totalPages || 0 },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-10 w-10 rounded-xl font-medium transition ${
                  page === p
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white border hover:bg-gray-100 text-gray-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* NEXT */}

          <button
            disabled={!pagination?.hasNextPage}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 ${
              pagination?.hasNextPage
                ? "bg-white hover:bg-gray-100 text-gray-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ================= MODAL ================= */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* HEADER */}

            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {editId ? "Update Category" : "Create Category"}
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-black text-xl"
              >
                ×
              </button>
            </div>

            {/* BODY */}

            <div className="p-5 space-y-4">
              {/* NAME */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter description"
                  className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* ALT */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Image Alt Text
                </label>

                <input
                  name="alt"
                  value={form.alt}
                  onChange={handleChange}
                  placeholder="Alt text"
                  className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* IMAGE */}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Category Image
                </label>

                <label className="border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition">
                  <Upload size={22} className="text-indigo-600" />

                  <p className="mt-2 text-sm text-gray-500">
                    Click to upload image
                  </p>

                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>

                {/* PREVIEW */}

                {preview && (
                  <div className="mt-4 flex items-center gap-3 border rounded-xl p-3">
                    <img
                      src={preview}
                      alt="preview"
                      className="h-16 w-16 rounded-lg object-cover border"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Image Selected
                      </p>

                      <p className="text-xs text-gray-500">Ready for upload</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}

            <div className="px-5 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl"
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
