/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, Package, Pencil, Trash2, Tag, Box,
  Ruler, Layers, Palette, MapPin, CheckCircle, XCircle,
  Truck, Percent, Hash, Barcode, Weight, Grid3x3,
} from "lucide-react";
import {
  useProduct, useDeleteProduct,
  useToggleProductStatus, useToggleProductFeature,
} from "../../../hooks/useProducts";
import dayjs from "../../../lib/dayjs";
import { formatINR } from "../../../lib/utils";
import { Button }  from "../../../components/ui/button";
import { Badge }   from "../../../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog";
import ButtonLoader from "../../../components/ui/ButtonLoader";
import EmptyState   from "../../../components/ui/EmptyState";

function InfoRow({ label, value, mono = false }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
      <span className="text-xs text-[#94A3B8] shrink-0">{label}</span>
      <span className={`text-sm text-[#0F172A] text-right ${mono ? "font-mono" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className={`px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5 ${accent || "bg-[#F8FAFC]"}`}>
        {Icon && <Icon size={15} className="text-[#6366F1] shrink-0" />}
        <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ChipList({ items }) {
  if (!items?.length) return <span className="text-sm text-[#94A3B8]">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={item._id || i}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#6366F1]"
        >
          {item.name}
        </span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug }  = useParams();
  const router    = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: product, isLoading } = useProduct(slug);
  const del           = useDeleteProduct();
  const toggleStatus  = useToggleProductStatus();
  const toggleFeature = useToggleProductFeature();

  const handleDelete = async () => {
    await del.mutateAsync(product._id);
    router.push("/dashboard/product-catalogue");
  };

  const handleToggleStatus = () => {
    const next = product.status === "active" ? "inactive" : "active";
    toggleStatus.mutate({ id: product._id, status: next });
  };

  const handleToggleFeature = () => {
    toggleFeature.mutate(product._id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] h-16 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] h-80 animate-pulse" />
            <div className="bg-white rounded-2xl border border-[#E2E8F0] h-40 animate-pulse" />
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] h-40 animate-pulse" />
            <div className="bg-white rounded-2xl border border-[#E2E8F0] h-48 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <EmptyState icon={Package} title="Product not found" />;
  }

  const allImages = [
    ...(product.thumbnail?.url ? [{ url: product.thumbnail.url, alt: product.thumbnail.alt }] : []),
    ...(product.images?.filter((i) => i.url) ?? []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.push("/dashboard/product-catalogue")}
              className="w-9 h-9 rounded-xl border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft size={16} className="text-[#64748B]" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#0F172A] truncate">{product.name}</h1>
                <Badge
                  className={
                    product.status === "active"
                      ? "bg-[#DCFCE7] text-[#16A34A] shrink-0"
                      : "bg-[#F1F5F9] text-[#64748B] shrink-0"
                  }
                >
                  {product.status}
                </Badge>
                {product.isFeatured && (
                  <Badge className="bg-[#FEF3C7] text-[#D97706] shrink-0">
                    <Star size={10} className="mr-1 fill-[#D97706]" /> Featured
                  </Badge>
                )}
              </div>
              {product.brand && (
                <p className="text-xs text-[#94A3B8] mt-0.5">{product.brand}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFeature}
              disabled={toggleFeature.isPending}
              className={product.isFeatured ? "text-[#D97706] hover:text-[#B45309]" : "text-[#94A3B8]"}
            >
              {toggleFeature.isPending ? (
                <ButtonLoader text="" />
              ) : (
                <Star size={15} className={product.isFeatured ? "fill-[#D97706]" : ""} />
              )}
              <span className="ml-1.5">{product.isFeatured ? "Unfeature" : "Feature"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleStatus}
              disabled={toggleStatus.isPending}
              className={product.status === "active" ? "text-[#EF4444] hover:text-red-700" : "text-[#16A34A] hover:text-green-700"}
            >
              {toggleStatus.isPending ? (
                <ButtonLoader text="" />
              ) : product.status === "active" ? (
                <XCircle size={15} />
              ) : (
                <CheckCircle size={15} />
              )}
              <span className="ml-1.5">
                {product.status === "active" ? "Deactivate" : "Activate"}
              </span>
            </Button>

            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/product-catalogue/edit/${product.slug}`)}
            >
              <Pencil size={13} className="mr-1.5" /> Edit
            </Button>

            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={13} className="mr-1.5" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Images */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {allImages.length > 0 ? (
              <>
                <div className="relative h-72 bg-[#F1F5F9] overflow-hidden">
                  <img
                    src={allImages[activeImg]?.url}
                    alt={allImages[activeImg]?.alt || product.name}
                    className="w-full h-full object-contain"
                  />
                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto border-t border-[#F1F5F9]">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-colors cursor-pointer ${
                          i === activeImg ? "border-[#6366F1]" : "border-[#E2E8F0] hover:border-[#6366F1]/50"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#94A3B8]">
                <Package size={40} className="opacity-30" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <SectionCard title="Basic Information" icon={Package}>
            <InfoRow label="Name" value={product.name} />
            <InfoRow label="Brand" value={product.brand} />
            <InfoRow label="Vendor" value={product.vendor} />
            <InfoRow label="Finish" value={product.finish} />
            <InfoRow label="Slug" value={product.slug} mono />
            {product.shortDescription && (
              <div className="py-2 border-b border-[#F1F5F9]">
                <p className="text-xs text-[#94A3B8] mb-1">Short Description</p>
                <p className="text-sm text-[#0F172A]">{product.shortDescription}</p>
              </div>
            )}
            {product.description && (
              <div className="py-2">
                <p className="text-xs text-[#94A3B8] mb-1">Description</p>
                <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}
          </SectionCard>

          {/* Metafields */}
          {product.metafields?.length > 0 && (
            <SectionCard title="Custom Fields" icon={Hash}>
              {product.metafields.map((mf, i) => (
                <InfoRow
                  key={i}
                  label={mf.definition?.name || "Field"}
                  value={mf.value !== null && mf.value !== undefined ? String(mf.value) : "—"}
                />
              ))}
            </SectionCard>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Pricing */}
          <SectionCard title="Pricing" icon={Tag}>
            <div className="mb-3 pb-3 border-b border-[#F1F5F9]">
              <p className="text-xs text-[#94A3B8]">Sale Price</p>
              <p className="text-2xl font-bold text-[#6366F1] mt-0.5">{formatINR(product.price)}</p>
              {product.salePrice && product.salePrice !== product.price && (
                <p className="text-xs text-[#94A3B8] line-through mt-0.5">{formatINR(product.salePrice)}</p>
              )}
            </div>
            <InfoRow
              label="Sale Price"
              value={product.salePrice ? formatINR(product.salePrice) : null}
            />
            <InfoRow
              label="Discount"
              value={product.discountPercent ? `${product.discountPercent}%` : null}
            />
            <InfoRow
              label="Price/sqft"
              value={product.pricePerSqft ? formatINR(product.pricePerSqft) : null}
            />
            <InfoRow
              label="Square Feet"
              value={product.squareFeet || null}
            />
            <InfoRow
              label="GST"
              value={product.gst != null ? `${product.gst}%` : null}
            />
            <InfoRow
              label="Delivery"
              value={
                product.isFreeDelivery
                  ? "Free"
                  : product.deliveryFee
                  ? formatINR(product.deliveryFee)
                  : null
              }
            />
          </SectionCard>

          {/* Inventory */}
          <SectionCard title="Inventory" icon={Box}>
            <InfoRow label="Stock" value={product.stock ?? 0} />
            <InfoRow label="Tiles/Box" value={product.tileInBox} />
            <InfoRow label="Min Order" value={product.minOrderQuantity} />
            <InfoRow label="Max Order" value={product.maxOrderQuantity} />
          </SectionCard>

          {/* Dimensions */}
          <SectionCard title="Dimensions & Weight" icon={Ruler}>
            <InfoRow
              label="Size"
              value={
                product.dimensions?.length && product.dimensions?.width
                  ? `${product.dimensions.length} × ${product.dimensions.width} mm`
                  : null
              }
            />
            <InfoRow
              label="Weight"
              value={product.weight ? `${product.weight} kg` : null}
            />
          </SectionCard>

          {/* Categories */}
          <SectionCard title="Categories" icon={Layers}>
            <div className="space-y-3">
              {product.sizeCategory && (
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Size</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
                    {product.sizeCategory.name}
                  </span>
                </div>
              )}
              {product.spaceCategories?.length > 0 && (
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1.5">Space</p>
                  <ChipList items={product.spaceCategories} />
                </div>
              )}
              {product.productStyles?.length > 0 && (
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1.5">Style</p>
                  <ChipList items={product.productStyles} />
                </div>
              )}
              {product.tileUsageCategories?.length > 0 && (
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1.5">Tile Usage</p>
                  <ChipList items={product.tileUsageCategories} />
                </div>
              )}
              {!product.sizeCategory &&
                !product.spaceCategories?.length &&
                !product.productStyles?.length &&
                !product.tileUsageCategories?.length && (
                  <p className="text-sm text-[#94A3B8]">No categories assigned</p>
                )}
            </div>
          </SectionCard>

          {/* Identifiers */}
          <SectionCard title="Identifiers" icon={Barcode}>
            <InfoRow label="SKU" value={product.sku} mono />
            <InfoRow label="Barcode" value={product.barcode} mono />
            <InfoRow label="HSN Code" value={product.hsnCode} mono />
            <InfoRow label="Batch No." value={product.batchNo} />
          </SectionCard>

          {/* Timestamps */}
          <SectionCard title="Timeline" icon={Grid3x3}>
            <InfoRow
              label="Created"
              value={dayjs(product.createdAt).format("DD MMM YYYY, hh:mm A")}
            />
            <InfoRow
              label="Updated"
              value={dayjs(product.updatedAt).format("DD MMM YYYY, hh:mm A")}
            />
          </SectionCard>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#0F172A]">{product.name}</span>? All images will be
            permanently removed and this cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:cursor-not-allowed"
              onClick={handleDelete}
              disabled={del.isPending}
            >
              {del.isPending ? <ButtonLoader text="Deleting…" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
