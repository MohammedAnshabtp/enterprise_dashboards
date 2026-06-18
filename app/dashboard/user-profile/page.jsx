"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Camera, Trash2, Plus, Loader2, Shield, CheckCircle2,
  XCircle, MapPin, Phone, Mail, Link2, Building2, Home,
  CalendarDays, Pencil,
} from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { useAddressStore } from "../../store/addressStore";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import ButtonLoader from "../../components/ui/ButtonLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import dayjs from "../../lib/dayjs";

const capitalize = (val) =>
  val ? val.charAt(0).toUpperCase() + val.slice(1) : val;

const profileSchema = yup.object({
  name: yup.string().required("Name is required").transform(capitalize),
  mobileNumber: yup.string().nullable(),
  occupation: yup.string().nullable().transform(capitalize),
});

const addressSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  phone: yup.string().nullable(),
  email: yup.string().email("Enter a valid email").nullable(),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  pincode: yup.string().required("Pincode is required"),
  locationName: yup.string().nullable(),
  googleMapLink: yup.string().url("Enter a valid URL").nullable().transform(v => v || null),
  landmark: yup.string().nullable(),
  projectType: yup.string().oneOf(["home", "commercial"], "Please select a project type").required("Project type is required"),
});

const EMPTY_ADDRESS = {
  fullName: "", phone: "", email: "",
  city: "", state: "", pincode: "",
  locationName: "", googleMapLink: "",
  landmark: "", projectType: "",
};

export default function ProfilePage() {
  const { user, loading, avatarLoading, getProfile, updateProfile, uploadAvatar, deleteAvatar } =
    useUserStore();
  const { addresses, fetchAddresses, createAddress, updateAddress, deleteAddress } =
    useAddressStore();

  const [addressOpen, setAddressOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: "", mobileNumber: "", occupation: "" },
  });

  const addressForm = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: EMPTY_ADDRESS,
  });

  useEffect(() => {
    getProfile().catch(() => toast.error("Failed to load profile"));
    fetchAddresses().catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name ?? "",
        mobileNumber: user.mobileNumber ?? "",
        occupation: user.occupation ?? "",
      });
    }
  }, [user]);

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to upload avatar");
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      toast.success("Avatar removed");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to remove avatar");
    }
  };

  const openAdd = () => {
    setEditId(null);
    addressForm.reset(EMPTY_ADDRESS);
    setAddressOpen(true);
  };

  const openEdit = (a) => {
    setEditId(a._id);
    addressForm.reset({
      fullName: a.fullName ?? "",
      phone: a.phone ?? "",
      email: a.email ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      pincode: a.pincode ?? "",
      locationName: a.locationName ?? "",
      googleMapLink: a.googleMapLink ?? "",
      landmark: a.landmark ?? "",
      projectType: a.projectType ?? "",
    });
    setAddressOpen(true);
  };

  const onAddressSubmit = async (data) => {
    try {
      if (editId) {
        await updateAddress(editId, data);
        toast.success("Address updated");
      } else {
        await createAddress(data);
        toast.success("Address added");
      }
      await fetchAddresses();
      setAddressOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to save address");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAddress(deleteTarget);
      toast.success("Address deleted");
      await fetchAddresses();
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to delete address");
    } finally {
      setDeleteLoading(false);
    }
  };

  const avatarSrc = user?.avatar ?? "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

  const { errors: pErr, isSubmitting: pSubmitting, isDirty: pDirty } = profileForm.formState;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">

          {/* Banner */}
          <div className="h-24 bg-linear-to-r from-[#6366F1] to-[#818CF8] relative" />

          {/* Avatar + meta */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-[#E2E8F0]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-full h-full object-cover object-center"
                  />
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                      <Loader2 size={18} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full flex items-center justify-center cursor-pointer shadow transition-colors">
                  <Camera size={12} />
                  <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </label>
              </div>

              {/* Remove photo */}
              {user?.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAvatar}
                  disabled={avatarLoading}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs"
                >
                  <Trash2 size={12} className="mr-1" /> Remove photo
                </Button>
              )}
            </div>

            {/* Name + badges */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#0F172A]">{user?.name}</h2>
                {user?.role === "admin" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-linear-to-r from-[#6366F1] to-[#818CF8] text-white shadow-sm">
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>

              <p className="text-sm text-[#64748B] flex items-center gap-1.5">
                <Mail size={13} className="text-[#94A3B8]" />
                {user?.email}
              </p>

              {user?.mobileNumber && (
                <p className="text-sm text-[#64748B] flex items-center gap-1.5">
                  <Phone size={13} className="text-[#94A3B8]" />
                  {user.mobileNumber}
                </p>
              )}

              {user?.occupation && (
                <p className="text-sm text-[#64748B] flex items-center gap-1.5">
                  <Building2 size={13} className="text-[#94A3B8]" />
                  {user.occupation}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  user?.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                  {user?.isActive
                    ? <><CheckCircle2 size={10} /> Active</>
                    : <><XCircle size={10} /> Inactive</>
                  }
                </span>

                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  user?.isEmailVerified
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}>
                  {user?.isEmailVerified
                    ? <><CheckCircle2 size={10} /> Email verified</>
                    : <><XCircle size={10} /> Email unverified</>
                  }
                </span>

                {user?.createdAt && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                    <CalendarDays size={10} />
                    Member since {dayjs(user.createdAt).format("DD MMM YYYY")}
                  </span>
                )}

              </div>
            </div>

            {/* Edit form */}
            <div className="border-t border-[#F1F5F9] pt-5">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-4 flex items-center gap-1.5">
                <Pencil size={13} className="text-[#6366F1]" /> Edit Profile
              </h3>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. John Doe"
                      {...profileForm.register("name")}
                    />
                    {pErr.name && (
                      <p className="text-xs text-[#EF4444]">{pErr.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      placeholder="e.g. 9876543210"
                      {...profileForm.register("mobileNumber")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    placeholder="e.g. Architect, Interior Designer"
                    {...profileForm.register("occupation")}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!pDirty || loading || pSubmitting}
                  className="w-full disabled:cursor-not-allowed"
                >
                  {loading || pSubmitting ? <ButtonLoader text="Saving…" /> : "Save Changes"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* ── ADDRESSES CARD ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Addresses</h2>
              <p className="text-xs text-[#94A3B8]">{addresses.length} saved</p>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus size={14} className="mr-1.5" /> Add Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-10 text-[#94A3B8]">
              <MapPin size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No addresses saved yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((a) => (
                <div
                  key={a._id}
                  className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#6366F1]/30 hover:bg-[#6366F1]/2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5">
                        {a.projectType === "commercial"
                          ? <Building2 size={16} className="text-[#6366F1]" />
                          : <Home size={16} className="text-[#6366F1]" />
                        }
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#0F172A] text-sm">{a.fullName}</p>
                          {a.locationName && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                              {a.locationName}
                            </Badge>
                          )}
                          {a.isDefault && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Default
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                          <MapPin size={10} className="text-[#94A3B8] shrink-0" />
                          {[a.city, a.state, a.pincode].filter(Boolean).join(", ")}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {a.phone && (
                            <span className="text-xs text-[#64748B] flex items-center gap-1">
                              <Phone size={10} className="text-[#94A3B8]" /> {a.phone}
                            </span>
                          )}
                          {a.email && (
                            <span className="text-xs text-[#64748B] flex items-center gap-1">
                              <Mail size={10} className="text-[#94A3B8]" /> {a.email}
                            </span>
                          )}
                          {a.landmark && (
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                              <MapPin size={10} /> Near: {a.landmark}
                            </span>
                          )}
                          {a.googleMapLink && (
                            <a
                              href={a.googleMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#6366F1] flex items-center gap-1 hover:underline"
                            >
                              <Link2 size={10} /> View on map
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => openEdit(a)}
                        className="text-[#6366F1] hover:bg-[#EEF2FF] h-8 px-2 text-xs"
                      >
                        <Pencil size={12} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => setDeleteTarget(a._id)}
                        className="text-red-500 hover:bg-red-50 h-8 px-2 text-xs"
                      >
                        <Trash2 size={12} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ADDRESS DIALOG ── */}
      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={addressForm.handleSubmit(onAddressSubmit)}
            className="space-y-4 mt-2"
          >
            {(() => {
              const { errors: aErr, isSubmitting: aSubmitting } = addressForm.formState;
              return (
                <>
                  <div className="space-y-1.5">
                    <Label>Full Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g. John Doe" {...addressForm.register("fullName")} />
                    {aErr.fullName && <p className="text-xs text-[#EF4444]">{aErr.fullName.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input placeholder="e.g. 9876543210" {...addressForm.register("phone")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" placeholder="e.g. john@email.com" {...addressForm.register("email")} />
                      {aErr.email && <p className="text-xs text-[#EF4444]">{aErr.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>City <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. Kochi" {...addressForm.register("city")} />
                      {aErr.city && <p className="text-xs text-[#EF4444]">{aErr.city.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>State <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. Kerala" {...addressForm.register("state")} />
                      {aErr.state && <p className="text-xs text-[#EF4444]">{aErr.state.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Pincode <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. 682001" {...addressForm.register("pincode")} />
                      {aErr.pincode && <p className="text-xs text-[#EF4444]">{aErr.pincode.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Project Type <span className="text-red-500">*</span></Label>
                      <Select
                        value={addressForm.watch("projectType")}
                        onValueChange={(v) => addressForm.setValue("projectType", v, { shouldValidate: true })}
                      >
                        <SelectTrigger>
                          <span className={addressForm.watch("projectType") ? "capitalize" : "text-[#94A3B8]"}>
                            {addressForm.watch("projectType") || "Select type"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                      {aErr.projectType && <p className="text-xs text-[#EF4444]">{aErr.projectType.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Location Name</Label>
                      <Input placeholder="e.g. Home, Office, Site" {...addressForm.register("locationName")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Landmark</Label>
                      <Input placeholder="e.g. Near City Mall" {...addressForm.register("landmark")} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Google Maps Link</Label>
                    <Input placeholder="https://maps.google.com/..." {...addressForm.register("googleMapLink")} />
                    {aErr.googleMapLink && <p className="text-xs text-[#EF4444]">{aErr.googleMapLink.message}</p>}
                  </div>

                  <Button type="submit" disabled={aSubmitting} className="w-full mt-1">
                    {aSubmitting
                      ? <ButtonLoader text="Saving…" />
                      : editId ? "Update Address" : "Add Address"}
                  </Button>
                </>
              );
            })()}
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRMATION ── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? <ButtonLoader text="Deleting…" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
