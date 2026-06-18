/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Camera, Trash2, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { useAddressStore } from "../../store/addressStore";
import BackButton from "../components/BackButton";

export default function ProfilePage() {
  const { user, getProfile, updateProfile, uploadAvatar, deleteAvatar } =
    useUserStore();

  const {
    addresses,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  } = useAddressStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    occupation: "",
  });

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    locationName: "",
    landmark: "",
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    getProfile();
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        occupation: user.occupation || "",
      });
    }
  }, [user]);
  console.log("USER:", user);

  // ---------------- PROFILE ----------------
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
    alert("Profile Updated ✅");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await uploadAvatar(file);
    await getProfile(); // 🔥 triggers avatar change → updates state above
  };

  // ---------------- ADDRESS ----------------
  const handleAddressSubmit = async () => {
    if (!addressForm.fullName) return alert("Name required");

    if (editId) {
      await updateAddress(editId, addressForm);
    } else {
      await createAddress(addressForm);
    }

    setAddressForm({
      fullName: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      pincode: "",
      locationName: "",
      landmark: "",
    });

    setEditId(null);
    setOpen(false);
    fetchAddresses();
  };

  const handleEdit = (a) => {
    setEditId(a._id);
    setAddressForm(a);
    setOpen(true);
  };

  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user?.avatar) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvatarUrl(`${user.avatar}?t=${new Date().getTime()}`); // ✅ safe here
    } else {
      setAvatarUrl(
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
      );
    }
  }, [user?.avatar]);

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 🔥 PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center justify-between">
              <BackButton />
              <h1 className="text-xl font-semibold text-black">
                Profile Settings
              </h1>
            </div>
          </div>

          {/* Avatar + Info */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={avatarUrl}
                className="w-24 h-24 rounded-full object-cover border"
              />

              <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFile}
                />
              </label>
            </div>

            <div>
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>

              {user?.avatar && (
                <button
                  onClick={deleteAvatar}
                  className="text-red-500 text-sm mt-2 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Form Grid */}
          <form
            onSubmit={handleProfileSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-3 rounded-lg text-gray-600"
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border p-3 rounded-lg text-gray-600"
            />

            <input
              placeholder="Occupation"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="border p-3 rounded-lg col-span-2 text-gray-600"
            />

            <button className="col-span-2 bg-indigo-600 text-white py-3 rounded-lg">
              Save Changes
            </button>
          </form>
        </div>

        {/* 🔥 ADDRESS CARD */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Addresses</h2>

            <button
              onClick={() => setOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map((a) => (
              <div
                key={a._id}
                className="border rounded-lg p-4 flex justify-between"
              >
                <div className="flex gap-3">
                  <MapPin className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-600">{a.fullName}</p>
                    <p className="text-sm text-gray-500 text-gray-600">
                      {a.city}, {a.state} - {a.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-sm ">
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAddress(a._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-semibold text-lg text-black">
              {editId ? "Edit Address" : "Add Address"}
            </h2>

            <input
              placeholder="Full Name"
              value={addressForm.fullName}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  fullName: e.target.value,
                })
              }
              className="w-full border p-3 rounded text-gray-600"
            />

            <input
              placeholder="City"
              value={addressForm.city}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  city: e.target.value,
                })
              }
              className="w-full border p-3 rounded text-gray-600"
            />

            <input
              placeholder="State"
              value={addressForm.state}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  state: e.target.value,
                })
              }
              className="w-full border p-3 rounded text-gray-600"
            />

            <input
              placeholder="Pincode"
              value={addressForm.pincode}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  pincode: e.target.value,
                })
              }
              className="w-full border p-3 rounded text-gray-600"
            />

            <button
              onClick={handleAddressSubmit}
              className="w-full bg-indigo-600 text-white py-3 rounded"
            >
              Save Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
