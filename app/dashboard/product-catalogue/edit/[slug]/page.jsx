/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  ArrowLeft, ImagePlus, X, Package, Upload, Check, Loader2,
} from "lucide-react";

import { useProduct, useUpdateProduct } from "../../../../hooks/useProducts";
import { useSizeCategories, useSpaceCategories, useTileUsageCategories } from "../../../../hooks/useCategories";
import { useProductStyle } from "../../../../hooks/useProductStyle";
import { Button }   from "../../../../components/ui/button";
import { Input }    from "../../../../components/ui/input";
import { Label }    from "../../../../components/ui/label";
import {
  Select, SelectTrigger, SelectContent, SelectItem,
} from "../../../../components/ui/select";
import ButtonLoader from "../../../../components/ui/ButtonLoader";

const emptyToNull = (val, orig) => (orig === "" || orig === undefined ? null : val);

const schema = yup.object({
  name:             yup.string().required("Product name is required"),
  price:            yup.number().typeError("Price must be a number").positive("Must be greater than 0").required("Price is required"),
  shortDescription: yup.string().nullable(),
  description:      yup.string().nullable(),
  brand:            yup.string().nullable(),
  finish:           yup.string().nullable(),
  vendor:           yup.string().nullable(),
  squareFeet:       yup.string().nullable(),
  pricePerSqft:     yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  salePrice:        yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  purchasePrice:    yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  discountPercent:  yup.number().typeError("Must be a number").min(0).max(100).nullable().transform(emptyToNull),
  gst:              yup.number().typeError("Must be a number").min(0).nullable().transform(emptyToNull),
  weight:           yup.number().typeError("Must be a number").positive().nullable().transform(emptyToNull),
  tileInBox:        yup.number().typeError("Must be a number").positive().integer().nullable().transform(emptyToNull),
  minOrderQuantity: yup.number().typeError("Must be a number").positive().integer().nullable().transform(emptyToNull),
  maxOrderQuantity: yup.number().typeError("Must be a number").positive().integer().nullable().transform(emptyToNull),
  hsnCode:          yup.string().nullable(),
  batchNo:          yup.string().nullable(),
  sku:              yup.string().nullable(),
  barcode:          yup.string().nullable(),
  thumbnailAlt:     yup.string().nullable(),
  isFreeDelivery:   yup.boolean().default(false),
  deliveryFee:      yup.number().typeError("Must be a number").min(0).nullable().transform(emptyToNull),
  isFeatured:       yup.boolean().default(false),
  status:           yup.string().oneOf(["active", "inactive"]).default("active"),
  dimensionsLength: yup.number().typeError("Must be a number").positive().nullable().transform(emptyToNull),
  dimensionsWidth:  yup.number().typeError("Must be a number").positive().nullable().transform(emptyToNull),
  sizeCategory:     yup.string().nullable(),
  spaceCategories:      yup.array().of(yup.string()).default([]),
  productStyles:        yup.array().of(yup.string()).default([]),
  tileUsageCategories:  yup.array().of(yup.string()).default([]),
});

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <h2 className="text-sm font-semibold text-[#0F172A]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FieldRow({ children }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer ${
        checked ? "bg-[#6366F1]" : "bg-[#CBD5E1]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function MultiSelect({ options, value = [], onChange, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };
  const selectedOptions = options.filter((o) => value.includes(o._id));
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[38px] px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-left flex flex-wrap gap-1.5 items-center hover:border-[#6366F1]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition-colors"
      >
        {selectedOptions.length === 0 ? (
          <span className="text-[#94A3B8]">{placeholder}</span>
        ) : (
          selectedOptions.map((o) => (
            <span key={o._id} className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#6366F1] text-xs px-2 py-0.5 rounded-full font-medium">
              {o.name}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(o._id); }} className="hover:text-[#4F46E5]">
                <X size={10} />
              </button>
            </span>
          ))
        )}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[#94A3B8]">No options available</p>
          ) : (
            options.map((o) => (
              <button key={o._id} type="button" onClick={() => toggle(o._id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[#F8FAFC] transition-colors">
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${value.includes(o._id) ? "bg-[#6366F1] border-[#6366F1]" : "border-[#CBD5E1]"}`}>
                  {value.includes(o._id) && <Check size={10} className="text-white" />}
                </span>
                {o.name}
              </button>
            ))
          )}
          <div className="sticky bottom-0 bg-white border-t border-[#F1F5F9] px-3 py-2">
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#6366F1] font-medium hover:underline">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

const toId = (val) => (val && typeof val === "object" ? val._id : val) ?? null;
const toIds = (arr) => (arr ?? []).map(toId).filter(Boolean);

export default function EditProductPage() {
  const { slug }  = useParams();
  const router    = useRouter();

  const { data: product, isLoading } = useProduct(slug);
  const updateProduct = useUpdateProduct();

  const thumbRef  = useRef(null);
  const imagesRef = useRef(null);
  const [thumbPreview, setThumbPreview]   = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { data: sizeResult }  = useSizeCategories({ limit: 100 });
  const { data: spaceResult } = useSpaceCategories({ limit: 100 });
  const { data: styleResult } = useProductStyle({ limit: 100 });
  const { data: usageResult } = useTileUsageCategories({ limit: 100 });

  const sizeCategories      = sizeResult?.data  ?? [];
  const spaceCategories     = spaceResult?.data ?? [];
  const productStyles       = styleResult?.data ?? [];
  const tileUsageCategories = usageResult?.data ?? [];

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "active",
      isFreeDelivery: false,
      isFeatured: false,
      spaceCategories: [],
      productStyles: [],
      tileUsageCategories: [],
    },
  });

  useEffect(() => {
    if (!product) return;
    setThumbPreview(product.thumbnail?.url ?? null);
    reset({
      name:             product.name ?? "",
      price:            product.price ?? "",
      shortDescription: product.shortDescription ?? "",
      description:      product.description ?? "",
      brand:            product.brand ?? "",
      finish:           product.finish ?? "",
      vendor:           product.vendor ?? "",
      squareFeet:       product.squareFeet ?? "",
      pricePerSqft:     product.pricePerSqft ?? "",
      salePrice:        product.salePrice ?? "",
      purchasePrice:    product.purchasePrice ?? "",
      discountPercent:  product.discountPercent ?? "",
      gst:              product.gst ?? "",
      weight:           product.weight ?? "",
      tileInBox:        product.tileInBox ?? "",
      minOrderQuantity: product.minOrderQuantity ?? "",
      maxOrderQuantity: product.maxOrderQuantity ?? "",
      hsnCode:          product.hsnCode ?? "",
      batchNo:          product.batchNo ?? "",
      sku:              product.sku ?? "",
      barcode:          product.barcode ?? "",
      thumbnailAlt:     product.thumbnail?.alt ?? "",
      isFreeDelivery:   product.isFreeDelivery ?? false,
      deliveryFee:      product.deliveryFee ?? "",
      isFeatured:       product.isFeatured ?? false,
      status:           product.status ?? "active",
      dimensionsLength: product.dimensions?.length ?? "",
      dimensionsWidth:  product.dimensions?.width ?? "",
      sizeCategory:     toId(product.sizeCategory) ?? "",
      spaceCategories:      toIds(product.spaceCategories),
      productStyles:        toIds(product.productStyles),
      tileUsageCategories:  toIds(product.tileUsageCategories),
    });
  }, [product, reset]);

  const isFreeDelivery = watch("isFreeDelivery");

  const onSubmit = async (data) => {
    const thumbFile  = thumbRef.current?.files?.[0];
    const imageFiles = Array.from(imagesRef.current?.files ?? []);
    await updateProduct.mutateAsync({
      id: product._id,
      data: {
        ...data,
        ...(thumbFile  && { thumbnail: thumbFile }),
        ...(imageFiles.length > 0 && { images: imageFiles }),
      },
    });
    router.push("/dashboard/product-catalogue");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#6366F1]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[#64748B]">Product not found.</p>
        <Button variant="ghost" onClick={() => router.push("/dashboard/product-catalogue")}>
          <ArrowLeft size={15} className="mr-1.5" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/product-catalogue")}
            className="w-8 h-8 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-[#64748B]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Edit Product</h1>
            <p className="text-xs text-[#94A3B8] truncate max-w-xs">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/product-catalogue")}>
            Cancel
          </Button>
          <Button type="submit" form="edit-product-form" disabled={isSubmitting || updateProduct.isPending} className="gap-1.5">
            {isSubmitting || updateProduct.isPending
              ? <ButtonLoader text="Saving…" />
              : <><Package size={14} /> Save Changes</>}
          </Button>
        </div>
      </div>

      <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Basic Information">
              <Field label="Product Name" required error={errors.name?.message}>
                <Input placeholder="e.g. MOBON DOLCE CALCATTA" {...register("name")} />
              </Field>
              <Field label="Short Description" error={errors.shortDescription?.message}>
                <Input placeholder="One-line summary shown in listings" {...register("shortDescription")} />
              </Field>
              <Field label="Description" error={errors.description?.message}>
                <textarea
                  placeholder="Full product description…"
                  rows={4}
                  {...register("description")}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Pricing">
              <FieldRow>
                <Field label="Price (₹)" required error={errors.price?.message}>
                  <Input type="number" step="0.01" placeholder="e.g. 750" {...register("price")} />
                </Field>
                <Field label="Sale Price (₹)" error={errors.salePrice?.message}>
                  <Input type="number" step="0.01" placeholder="e.g. 620" {...register("salePrice")} />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Discount (%)" error={errors.discountPercent?.message}>
                  <Input type="number" step="0.01" placeholder="e.g. 10" {...register("discountPercent")} />
                </Field>
                <Field label="GST (%)" error={errors.gst?.message}>
                  <Input type="number" step="0.01" placeholder="e.g. 18" {...register("gst")} />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Price per Sqft (₹)" error={errors.pricePerSqft?.message}>
                  <Input type="number" step="0.01" placeholder="e.g. 75" {...register("pricePerSqft")} />
                </Field>
                <Field label="Purchase Price (₹)" error={errors.purchasePrice?.message}>
                  <Input type="number" step="0.01" placeholder="e.g. 500" {...register("purchasePrice")} />
                </Field>
              </FieldRow>
            </SectionCard>

            <SectionCard title="Product Details">
              <FieldRow>
                <Field label="Brand" error={errors.brand?.message}>
                  <Input placeholder="e.g. SOMANY" {...register("brand")} />
                </Field>
                <Field label="Finish" error={errors.finish?.message}>
                  <Input placeholder="e.g. GLOSSY, MATT" {...register("finish")} />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Vendor" error={errors.vendor?.message}>
                  <Input placeholder="e.g. ABC Distributors" {...register("vendor")} />
                </Field>
                <Field label="Square Feet" error={errors.squareFeet?.message}>
                  <Input placeholder="e.g. 600×600" {...register("squareFeet")} />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Dimension — Length (mm)" error={errors.dimensionsLength?.message}>
                  <Input type="number" step="0.1" placeholder="e.g. 600" {...register("dimensionsLength")} />
                </Field>
                <Field label="Dimension — Width (mm)" error={errors.dimensionsWidth?.message}>
                  <Input type="number" step="0.1" placeholder="e.g. 600" {...register("dimensionsWidth")} />
                </Field>
              </FieldRow>
              <Field label="Weight (kg)" error={errors.weight?.message}>
                <Input type="number" step="0.01" placeholder="e.g. 2.5" {...register("weight")} className="max-w-xs" />
              </Field>
            </SectionCard>

            <SectionCard title="Identifiers & SKU">
              <FieldRow>
                <Field label="HSN Code" error={errors.hsnCode?.message}>
                  <Input placeholder="e.g. 69072100" {...register("hsnCode")} />
                </Field>
                <Field label="Batch No." error={errors.batchNo?.message}>
                  <Input placeholder="e.g. B2024001" {...register("batchNo")} />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="SKU" error={errors.sku?.message}>
                  <Input placeholder="e.g. TLE-600-GLS" {...register("sku")} />
                </Field>
                <Field label="Barcode" error={errors.barcode?.message}>
                  <Input placeholder="e.g. 8901234567890" {...register("barcode")} />
                </Field>
              </FieldRow>
            </SectionCard>

            <SectionCard title="Inventory">
              <FieldRow>
                <Field label="Tiles per Box" error={errors.tileInBox?.message}>
                  <Input type="number" placeholder="e.g. 4" {...register("tileInBox")} />
                </Field>
                <div />
              </FieldRow>
              <FieldRow>
                <Field label="Min. Order Quantity" error={errors.minOrderQuantity?.message}>
                  <Input type="number" placeholder="e.g. 1" {...register("minOrderQuantity")} />
                </Field>
                <Field label="Max. Order Quantity" error={errors.maxOrderQuantity?.message}>
                  <Input type="number" placeholder="e.g. 500" {...register("maxOrderQuantity")} />
                </Field>
              </FieldRow>
            </SectionCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <SectionCard title="Thumbnail Image">
              <input
                ref={thumbRef}
                id="thumb-input"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setThumbPreview(URL.createObjectURL(f)); }}
              />
              {thumbPreview ? (
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0]">
                    <img src={thumbPreview} alt="" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setThumbPreview(null); if (thumbRef.current) thumbRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X size={13} className="text-white" />
                    </button>
                  </div>
                  <label htmlFor="thumb-input" className="flex items-center justify-center gap-1.5 text-xs text-[#6366F1] cursor-pointer hover:underline">
                    <ImagePlus size={13} /> Change thumbnail
                  </label>
                </div>
              ) : (
                <label htmlFor="thumb-input" className="flex flex-col items-center justify-center gap-2 w-full h-36 border-2 border-dashed border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/30 transition-colors">
                  <ImagePlus size={22} className="text-[#94A3B8]" />
                  <span className="text-sm text-[#94A3B8]">Click to upload thumbnail</span>
                  <span className="text-xs text-[#CBD5E1]">PNG, JPG, WEBP</span>
                </label>
              )}
              <Field label="Thumbnail Alt Text" error={errors.thumbnailAlt?.message}>
                <Input placeholder="Describe the image for SEO" {...register("thumbnailAlt")} />
              </Field>
            </SectionCard>

            {product.images?.length > 0 && (
              <SectionCard title="Existing Gallery">
                <div className="grid grid-cols-3 gap-2">
                  {product.images.map((img, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-[#E2E8F0]">
                      <img src={img.url} alt="" className="w-full h-20 object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#94A3B8] mt-2">Upload new images below to add more</p>
              </SectionCard>
            )}

            <SectionCard title="Add Gallery Images">
              <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/30 transition-colors">
                <Upload size={18} className="text-[#94A3B8]" />
                <span className="text-sm text-[#94A3B8]">Upload new gallery images</span>
                <input ref={imagesRef} type="file" accept="image/*" multiple hidden
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-[#E2E8F0]">
                      <img src={src} alt="" className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreviews((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <X size={9} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Settings">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <span className="text-sm capitalize">{field.value || "active"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[#F1F5F9]">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">Featured</p>
                    <p className="text-xs text-[#94A3B8]">Show on featured section</p>
                  </div>
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[#F1F5F9]">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">Free Delivery</p>
                    <p className="text-xs text-[#94A3B8]">Waive delivery charges</p>
                  </div>
                  <Controller
                    name="isFreeDelivery"
                    control={control}
                    render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />}
                  />
                </div>
                {!isFreeDelivery && (
                  <Field label="Delivery Fee (₹)" error={errors.deliveryFee?.message}>
                    <Input type="number" step="0.01" placeholder="e.g. 150" {...register("deliveryFee")} />
                  </Field>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Categories">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Size Category</Label>
                  <Controller
                    name="sizeCategory"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <span className="text-sm">
                            {sizeCategories.find((c) => c._id === field.value)?.name ?? "Select size…"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {sizeCategories.map((c) => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Space Categories</Label>
                  <Controller
                    name="spaceCategories"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect options={spaceCategories} value={field.value} onChange={field.onChange} placeholder="Select spaces…" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Product Styles</Label>
                  <Controller
                    name="productStyles"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect options={Array.isArray(productStyles) ? productStyles : []} value={field.value} onChange={field.onChange} placeholder="Select styles…" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tile Usage</Label>
                  <Controller
                    name="tileUsageCategories"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect options={Array.isArray(tileUsageCategories) ? tileUsageCategories : []} value={field.value} onChange={field.onChange} placeholder="Select usage types…" />
                    )}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </form>
    </div>
  );
}
