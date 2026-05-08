// app/admin/products/page.jsx

"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Trash2,
  Star,
  Upload,
  Boxes,
} from "lucide-react";
import { useProductStore } from "../store/productStore";
import { useProductBulkStore } from "../store/productBulkStore";
import { useCategoryStore } from "../store/categoryStore";
import BulkDeleteBar from "./BulkDeleteBar";

export default function AdminProductsPage() {
  // NORMAL PRODUCTS
  const {
    products = [],
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  // BULK OPERATIONS
  const {
    bulkUploadProducts,
    bulkDeleteProducts,
    bulkCategoryUpdate,
    fetchBulkUploadHistory,
  } = useProductBulkStore();

  const {
    sizeCategories,
    spaceCategories,
    tileUsageCategories,
    fetchSizeCategories,
    fetchSpaceCategories,
    fetchTileUsageCategories,
  } = useCategoryStore();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCategoryData, setBulkCategoryData] = useState({
    sizeCategory: "",
    spaceCategories: [],
    tileUsageCategories: [],
  });
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    squareFeet: "",
    pricePerSqft: "",
    thumbnailAlt: "",
    thumbnail: null,
    images: [],
  });

  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchProducts(query);

    fetchSizeCategories();
    fetchSpaceCategories();
    fetchTileUsageCategories();
  }, [query]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // THUMBNAIL
    if (name === "thumbnail") {
      setForm((prev) => ({
        ...prev,
        thumbnail: files[0],
      }));

      return;
    }

    // MULTIPLE IMAGES
    if (name === "images") {
      setForm((prev) => ({
        ...prev,
        images: Array.from(files),
      }));

      return;
    }

    // NORMAL INPUTS
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Name and price required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        price: Number(form.price),
        squareFeet: Number(form.squareFeet),
        pricePerSqft: Number(form.pricePerSqft),
        thumbnailAlt: form.thumbnailAlt,
        thumbnail: form.thumbnail,
        images: form.images,
      };

      if (editId) {
        await updateProduct(editId, payload);
      } else {
        await createProduct(payload);
      }

      await fetchProducts(query);

      setOpen(false);
      setEditId(null);

      setForm({
        name: "",
        brand: "",
        description: "",
        price: "",
        stock: "",
        finish: "",
        length: "",
        width: "",
        tileInBox: "",
        image: null,
      });

      setPreview("");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const handleEdit = (p) => {
    setEditId(p._id);

    setForm({
      name: p.name || "",
      brand: p.brand || "",
      description: p.description || "",
      price: p.price || "",
      stock: p.stock || "",
      finish: p.finish || "",
      tileInBox: p.tileInBox || "",
      length: p.dimensions?.length || "",
      width: p.dimensions?.width || "",
      image: null,
    });

    setPreview(p?.thumbnail?.url || p?.images?.[0]?.url || "");

    setOpen(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this product?");

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);

      fetchProducts(query);
    } catch (err) {
      alert("Delete failed");
    }
  };

  // BULK DELETE
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Select products first");
      return;
    }

    const confirmDelete = confirm(
      `Delete ${selectedProducts.length} selected products?`
    );

    if (!confirmDelete) return;

    try {
      await bulkDeleteProducts(selectedProducts);

      alert("Bulk delete started");

      setSelectedProducts([]);

      fetchProducts(query);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Bulk delete failed");
    }
  };
  const filtered = products.filter((p) =>
    p?.name?.toLowerCase().includes(query.search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Product Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage products, inventory and pricing
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={async () => {
              if (selectedProducts.length === 0) {
                alert("Select products first");
                return;
              }

              try {
                await bulkCategoryUpdate({
                  productIds: selectedProducts,
                  sizeCategory: bulkCategoryData.sizeCategory,
                  spaceCategories: bulkCategoryData.spaceCategories,
                  tileUsageCategories: bulkCategoryData.tileUsageCategories,
                  mode: "add",
                });

                alert("Bulk categories updated");

                fetchProducts(query);
              } catch (error) {
                console.log(error);

                alert(
                  error.response?.data?.message || "Bulk category update failed"
                );
              }
            }}
            className="bg-white border px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Boxes size={18} />
            Bulk Category
          </button>

          <div className="flex gap-3">
            <label className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer">
              Bulk Upload
              <input
                type="file"
                accept=".xlsx"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  try {
                    await bulkUploadProducts(file);

                    alert("Bulk upload started");

                    fetchProducts(query);
                  } catch (err) {
                    console.log(err);

                    alert(err.response?.data?.message || "Upload failed");
                  }
                }}
              />
            </label>

            <button
              onClick={() => setOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />

        <input
          placeholder="Search products..."
          value={query.search}
          onChange={(e) =>
            setQuery({
              ...query,
              search: e.target.value,
            })
          }
          className="w-full outline-none"
        />
      </div>
      <div className="bg-white p-5 rounded-2xl border shadow-sm grid md:grid-cols-3 gap-4">
        {/* SIZE CATEGORY */}
        <select
          value={bulkCategoryData.sizeCategory}
          onChange={(e) =>
            setBulkCategoryData((prev) => ({
              ...prev,
              sizeCategory: e.target.value,
            }))
          }
          className="border p-3 rounded-xl"
        >
          <option value="">Select Size Category</option>

          {sizeCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* SPACE CATEGORY */}
        <select
          onChange={(e) =>
            setBulkCategoryData((prev) => ({
              ...prev,
              spaceCategories: [e.target.value],
            }))
          }
          className="border p-3 rounded-xl"
        >
          <option value="">Select Space Category</option>

          {spaceCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* TILE USAGE CATEGORY */}
        <select
          onChange={(e) =>
            setBulkCategoryData((prev) => ({
              ...prev,
              tileUsageCategories: [e.target.value],
            }))
          }
          className="border p-3 rounded-xl"
        >
          <option value="">Select Tile Usage</option>

          {tileUsageCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="p-5">Product</th>
                <th className="p-5">Brand</th>
                <th className="p-5">Size</th>
                <th className="p-5">Finish</th>
                <th className="p-5">Price</th>
                <th className="p-5">Stock</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {/* PRODUCT */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(p._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts((prev) => [...prev, p._id]);
                            } else {
                              setSelectedProducts((prev) =>
                                prev.filter((id) => id !== p._id)
                              );
                            }
                          }}
                        />
                        <img
                          src={
                            p?.thumbnail?.url ||
                            p?.images?.[0]?.url ||
                            "/placeholder.png"
                          }
                          className="h-16 w-16 rounded-xl object-cover border"
                          alt={p.name}
                        />

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {p.name}
                          </h3>

                          <p className="text-xs text-gray-500 line-clamp-1">
                            {p.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* BRAND */}
                    <td className="p-5 text-gray-700">{p.brand || "-"}</td>

                    {/* SIZE */}
                    <td className="p-5 text-gray-700">
                      {p.dimensions?.length} × {p.dimensions?.width}
                    </td>

                    {/* FINISH */}
                    <td className="p-5">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {p.finish || "-"}
                      </span>
                    </td>

                    {/* PRICE */}
                    <td className="p-5 font-semibold text-green-600">
                      ₹{p.price}
                    </td>

                    {/* STOCK */}
                    <td className="p-5">
                      {p.stock > 0 ? (
                        <span className="text-green-600 font-medium">
                          {p.stock}
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">Out</span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="p-5">
                      {p.isFeatured ? (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={14} className="fill-yellow-400" />
                          Featured
                        </div>
                      ) : (
                        <span className="text-gray-400">Normal</span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
          >
            {/* HEADER */}
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editId ? "Update Product" : "Create Product"}
              </h2>
            </div>

            {/* BODY */}
            <div className="p-6 grid md:grid-cols-2 gap-5">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="border p-3 rounded-xl"
              />

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Brand"
                className="border p-3 rounded-xl"
              />

              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                className="border p-3 rounded-xl"
              />

              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="border p-3 rounded-xl"
              />

              <input
                name="finish"
                value={form.finish}
                onChange={handleChange}
                placeholder="Finish"
                className="border p-3 rounded-xl"
              />

              <input
                name="tileInBox"
                value={form.tileInBox}
                onChange={handleChange}
                placeholder="Tiles in Box"
                className="border p-3 rounded-xl"
              />

              <input
                name="length"
                value={form.length}
                onChange={handleChange}
                placeholder="Length"
                className="border p-3 rounded-xl"
              />

              <input
                name="width"
                value={form.width}
                onChange={handleChange}
                placeholder="Width"
                className="border p-3 rounded-xl"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="border p-3 rounded-xl md:col-span-2"
                rows={4}
              />

              {/* IMAGE */}
              <div className="md:col-span-2">
                <label className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition">
                  <Upload size={28} />

                  <p className="mt-3 text-sm text-gray-600">
                    Upload Product Image
                  </p>

                  <input
                    type="file"
                    name="thumbnail"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">
                    Product Images
                  </label>

                  <input
                    type="file"
                    name="images"
                    multiple
                    onChange={handleChange}
                    className="mt-2 block w-full border rounded-xl p-3"
                  />
                </div>

                {preview && (
                  <img
                    src={preview}
                    className="h-48 w-full object-cover rounded-2xl mt-4 border"
                    alt="preview"
                  />
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-xl border"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl"
              >
                {loading ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
            <BulkDeleteBar
              selectedProducts={selectedProducts}
              onDelete={handleBulkDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
