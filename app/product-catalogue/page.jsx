/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useProductStore } from "../store/productStore";
import { CircleChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductCatalogPage() {
  const { products, fetchProducts, createProduct, updateProduct } =
    useProductStore();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    limit: 8,
    search: "",
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    body: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);

  // FETCH PRODUCTS
  useEffect(() => {
    fetchProducts(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!form.name || !form.description) {
      alert("Name & Description required");
      return;
    }

    if (editId) {
      await updateProduct(editId, form);
    } else {
      await createProduct(form);
    }

    setLoading(false);
    setOpen(false);
    setEditId(null);
    setPreview(null);

    setForm({
      name: "",
      description: "",
      body: "",
      image: null,
    });

    fetchProducts(query);
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      body: p.body || "",
      image: null,
    });
    setPreview(p.image);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 px-6 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition text-black"
          >
            <CircleChevronLeft size={26} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            Product Catalog
          </h1>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            Manage your products and inventory
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white text-black p-4 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="Search products..."
          value={query.search}
          onChange={(e) =>
            setQuery({ ...query, search: e.target.value, page: 1 })
          }
          className="w-full border p-3 rounded-lg"
        />
      </div>

      {/* GRID */}
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <img
                src={p.image || "/placeholder.png"}
                className="h-40 w-full object-cover"
                alt=""
              />

              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-800 line-clamp-1">
                  {p.name}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {p.description}
                </p>

                <button
                  onClick={() => handleEdit(p)}
                  className="text-indigo-600 text-sm font-medium hover:underline"
                >
                  Edit →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-3">
        <button
          disabled={query.page === 1}
          onClick={() => setQuery({ ...query, page: query.page - 1 })}
          className="px-4 py-2 border rounded disabled:opacity-50 bg-indigo-600"
        >
          Prev
        </button>

        <span className="px-4 py-2 text-black">Page {query.page}</span>

        <button
          onClick={() => setQuery({ ...query, page: query.page + 1 })}
          className="bg-indigo-600 px-4 py-2 border rounded"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-black ">
              {editId ? "Edit Product" : "Add Product"}
            </h2>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="w-full border p-3 rounded text-black"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border p-3 rounded text-black"
            />

            {editId && (
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                placeholder="Body"
                className="w-full border p-3 rounded text-black"
              />
            )}

            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="text-black"
            />

            {/* IMAGE PREVIEW */}
            {preview && (
              <img src={preview} className="h-32 w-full object-cover rounded" />
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="text-black">
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
