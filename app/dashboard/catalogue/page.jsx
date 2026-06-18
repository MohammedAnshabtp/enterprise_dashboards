"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "../../lib/dayjs";
import {
  useCatalogue,
  useCreateCatalogue,
  useUpdateCatalogue,
  useDeleteCatalogue,
} from "../../hooks/useCatalogue";

const EMPTY_FORM = { name: "", description: "", file: null };

export default function CataloguePage() {
  const { data: catalogues = [], isLoading } = useCatalogue();
  const createCatalogue = useCreateCatalogue();
  const updateCatalogue = useUpdateCatalogue();
  const deleteCatalogue = useDeleteCatalogue();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editId && !form.file) {
      toast.error("PDF file is required");
      return;
    }

    const payload = { name: form.name, description: form.description, file: form.file };

    if (editId) {
      updateCatalogue.mutate(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            setForm(EMPTY_FORM);
            setEditId(null);
            setOpen(false);
          },
        }
      );
    } else {
      createCatalogue.mutate(payload, {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setOpen(false);
        },
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      const file = files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Only PDF files are allowed");
        return;
      }

      setForm((prev) => ({ ...prev, file }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      file: null,
      existingFile: item.file?.url || item.pdf?.url || item.url || "",
    });
    setOpen(true);
  };

  const filtered = catalogues.filter((c) =>
    c?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const isPending = createCatalogue.isPending || updateCatalogue.isPending;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Catalogue Management
          </h1>
          <p className="text-sm text-gray-500">
            Organize your product catalogues
          </p>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setForm(EMPTY_FORM);
            setOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-sm"
        >
          + Add Catalogue
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-3 rounded-xl border flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="Search catalogue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* LIST */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border p-16 text-center shadow-sm">
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-16 text-center shadow-sm">
          <p className="text-gray-500 text-sm">No catalogues found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl font-bold">
                    PDF
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {c.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {c.description || "No description available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">File Size</span>
                  <span className="font-medium text-gray-700">
                    {c.file?.size
                      ? `${(c.file.size / (1024 * 1024)).toFixed(2)} MB`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-700">
                    {dayjs(c.createdAt).format("DD MMM YYYY")}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <a
                  href={c.file?.url}
                  target="_blank"
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
                >
                  View PDF
                </a>
                <button
                  onClick={() => handleEdit(c)}
                  className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCatalogue.mutate(c._id)}
                  disabled={deleteCatalogue.isPending}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
          >
            <h2 className="text-lg font-semibold">
              {editId ? "Edit Catalogue" : "Add Catalogue"}
            </h2>

            <input
              name="name"
              placeholder="Catalogue Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-medium">
                Upload Catalogue (PDF)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition">
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  onChange={handleChange}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <p className="font-medium text-gray-700">Click to upload PDF</p>
                  <p className="text-xs text-gray-400">Max size: 5MB</p>
                </label>
              </div>

              {form.file && (
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-700 truncate">
                    {form.file.name}
                  </span>
                  <button
                    onClick={() => setForm((prev) => ({ ...prev, file: null }))}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:opacity-60"
              >
                {isPending ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
