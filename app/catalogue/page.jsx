"use client";

import { useEffect, useState } from "react";
import { useCatalogueStore } from "../store/catalogueStore";
import { Search } from "lucide-react";

export default function CataloguePage() {
  const {
    catalogues = [],
    fetchCatalogues,
    createCatalogue,
    updateCatalogue,
    deleteCatalogue,
  } = useCatalogueStore();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    file: null,
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCatalogues();
  }, []);

  // ✅ SUBMIT FIXED
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Name required");
      return;
    }

    // 🔥 File required ONLY for create
    if (!editId && !form.file) {
      alert("PDF file is required");
      return;
    }

    try {
      if (editId) {
        await updateCatalogue(editId, form);
      } else {
        await createCatalogue(form);
      }

      // ✅ Reset form properly
      setForm({
        name: "",
        description: "",
        file: null,
      });

      setEditId(null);
      setOpen(false);
    } catch (err) {
      console.error("SUBMIT ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  // ✅ EDIT FIXED
  const handleEdit = (item) => {
    setEditId(item._id);

    setForm({
      name: item.name,
      description: item.description || "",
      file: null, // new file (if user uploads)
      existingFile: item.file || item.pdf || item.url, // 👈 adjust key
    });

    setOpen(true);
  };

  // ✅ SAFE FILTER
  const filtered = catalogues.filter((c) =>
    c?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ FILE HANDLING FIXED
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      const file = files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File must be less than 5MB");
        return;
      }

      setForm((prev) => ({ ...prev, file }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

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
            setForm({ name: "", description: "", file: null });
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
      <div className="bg-white rounded-xl border shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No catalogues found
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="flex justify-between items-center p-5 hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{c.name}</h3>
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
                    onClick={() => deleteCatalogue(c._id)}
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center"
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

            {/* FILE UPLOAD */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-medium">
                Upload Catalogue (PDF)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-400 transition">
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
                  <span className="text-sm text-gray-500">
                    Click to upload or drag PDF here
                  </span>
                  <span className="text-xs text-gray-400">
                    Only PDF files allowed
                  </span>
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

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
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
