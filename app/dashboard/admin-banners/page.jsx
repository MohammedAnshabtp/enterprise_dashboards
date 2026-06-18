"use client";

import { useState } from "react";
import { useAdminBanners, useCreateBanner, useDeleteBanner } from "../../hooks/useBanners";

const EMPTY_FORM = { title: "", imageAlt: "", link: "", isActive: true, displayOrder: 0, image: null };

export default function AdminBannersPage() {
  const { data: banners = [], isLoading } = useAdminBanners();
  const createBanner = useCreateBanner();
  const deleteBanner = useDeleteBanner();

  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    createBanner.mutate(form, {
      onSuccess: () => setForm(EMPTY_FORM),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Banners</h1>

      {/* FORM */}
      <div className="bg-white p-5 rounded-xl border space-y-4">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
        />

        <button
          onClick={handleSubmit}
          disabled={createBanner.isPending}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:opacity-60"
        >
          {createBanner.isPending ? "Creating..." : "Create Banner"}
        </button>
      </div>

      {/* LIST */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white border rounded-xl overflow-hidden"
            >
              <img
                src={banner.image?.url}
                alt=""
                className="h-48 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold">{banner.title}</h3>
                <p className="text-sm text-gray-500">{banner.description}</p>

                <button
                  onClick={() => deleteBanner.mutate(banner._id)}
                  disabled={deleteBanner.isPending}
                  className="mt-3 text-red-500 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
