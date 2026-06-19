/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, SlidersHorizontal, ChevronLeft, ChevronRight,
  Star, Trash2, Pencil, LayoutGrid, List, X, Package,
} from "lucide-react";
import {
  useProducts, useDeleteProduct,
} from "../../hooks/useProducts";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select, SelectTrigger, SelectContent, SelectItem,
} from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader from "../../components/ui/ButtonLoader";
import EmptyState from "../../components/ui/EmptyState";
import { formatINR } from "../../lib/utils";

const LIMIT = 12;

const SORT_OPTIONS = [
  { label: "Newest",  value: "createdAt", order: "desc" },
  { label: "Oldest",  value: "createdAt", order: "asc"  },
  { label: "Price ↑", value: "price",     order: "asc"  },
  { label: "Price ↓", value: "price",     order: "desc" },
  { label: "Name A–Z",value: "name",      order: "asc"  },
  { label: "Name Z–A",value: "name",      order: "desc" },
  { label: "Featured",value: "isFeatured",order: "desc" },
];

export default function ProductsPage() {
  const router = useRouter();

  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [status, setStatus]           = useState("");
  const [isFeatured, setIsFeatured]   = useState("");
  const [sortKey, setSortKey]         = useState(0);
  const [viewMode, setViewMode]       = useState("grid");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const sort = SORT_OPTIONS[sortKey];
  const params = {
    page, limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(status          && { status }),
    ...(isFeatured      && { isFeatured }),
    sortBy: sort.value, sortOrder: sort.order,
  };

  const { data: result, isLoading, isFetching } = useProducts(params);
  const products   = result?.data       ?? [];
  const pagination = result?.pagination ?? {};

  const deleteProduct = useDeleteProduct();

  const openEdit = (p) => {
    router.push(`/dashboard/product-catalogue/edit/${p.slug}`);
  };

  const confirmDelete = () => {
    deleteProduct.mutate(deleteTarget._id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Products</h1>
          <p className="text-sm text-[#94A3B8]">
            {pagination.totalItems != null ? `${pagination.totalItems} products total` : "Manage your product catalog"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white shadow-sm text-[#6366F1]" : "text-[#94A3B8] hover:text-[#64748B]"}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${viewMode === "list" ? "bg-white shadow-sm text-[#6366F1]" : "text-[#94A3B8] hover:text-[#64748B]"}`}
            >
              <List size={14} />
            </button>
          </div>
          <Button onClick={() => router.push("/dashboard/product-catalogue/add")}>
            <Plus size={15} className="mr-1.5" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search by name or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status */}
          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <span className="text-sm">{status ? (status === "active" ? "Active" : "Inactive") : "All Status"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Featured */}
          <Select value={isFeatured || "all"} onValueChange={(v) => { setIsFeatured(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <span className="text-sm">{isFeatured === "true" ? "Featured" : isFeatured === "false" ? "Not Featured" : "All Products"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="true">Featured Only</SelectItem>
              <SelectItem value="false">Not Featured</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={String(sortKey)} onValueChange={(v) => { setSortKey(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SlidersHorizontal size={13} className="mr-1.5 text-[#94A3B8]" />
              <span className="text-sm">{SORT_OPTIONS[sortKey].label}</span>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o, i) => (
                <SelectItem key={i} value={String(i)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active filter chips */}
          {(search || status || isFeatured) && (
            <Button
              variant="ghost" size="sm"
              onClick={() => { setSearch(""); setStatus(""); setIsFeatured(""); setPage(1); }}
              className="text-[#94A3B8] hover:text-[#0F172A] text-xs"
            >
              <X size={12} className="mr-1" /> Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Products */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                  <div className="h-44 bg-[#F1F5F9]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-3/4" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
                    <div className="h-5 bg-[#F1F5F9] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex gap-4 animate-pulse">
                  <div className="w-14 h-14 bg-[#F1F5F9] rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/3" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-[#F1F5F9] rounded w-20" />
                </div>
              ))}
            </div>
          )
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No products found" />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <div
                key={p._id}
                onClick={() => router.push(`/dashboard/product-catalogue/${p.slug}`)}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#6366F1]/30 transition-all duration-200 overflow-hidden group flex flex-col cursor-pointer"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={p.thumbnail?.url || p.images?.[0]?.url || "/placeholder.png"}
                    alt={p.name}
                    className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {p.stock === 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                    {p.isFeatured && (
                      <span className="bg-amber-400 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={8} fill="white" /> Featured
                      </span>
                    )}
                  </div>
                  {p.status === "inactive" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">Inactive</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                      className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:bg-[#EEF2FF] transition-colors"
                    >
                      <Pencil size={12} className="text-[#6366F1]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-[#0F172A] text-sm line-clamp-1 mb-0.5">
                    {p.name}
                  </h3>
                  {p.brand && (
                    <p className="text-xs text-[#94A3B8] mb-2">{p.brand}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-3">
                    {p.dimensions?.length && p.dimensions?.width ? (
                      <span>{p.dimensions.length}×{p.dimensions.width} mm</span>
                    ) : <span />}
                    {p.finish && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                        {p.finish}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-auto">
                    <p className="text-lg font-bold text-[#6366F1]">{formatINR(p.price)}</p>
                    <div className="flex justify-between text-xs text-[#94A3B8] mt-1">
                      {p.tileInBox ? <span>Tiles/Box: {p.tileInBox}</span> : <span />}
                      <span className={p.stock === 0 ? "text-red-400" : "text-emerald-600"}>
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {products.map((p, i) => (
              <div
                key={p._id}
                onClick={() => router.push(`/dashboard/product-catalogue/${p.slug}`)}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group cursor-pointer ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}
              >
                <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-[#E2E8F0]">
                  <img
                    src={p.thumbnail?.url || p.images?.[0]?.url || "/placeholder.png"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  {p.status === "inactive" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[8px] font-medium">OFF</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-[#0F172A] truncate">{p.name}</h3>
                    {p.isFeatured && (
                      <span className="shrink-0 bg-amber-100 text-amber-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={8} fill="currentColor" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-[#94A3B8]">
                    {p.brand && <span>{p.brand}</span>}
                    {p.finish && <span className="capitalize">{p.finish}</span>}
                    {p.sku && <span>SKU: {p.sku}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-[#6366F1] text-sm">{formatINR(p.price)}</p>
                  <p className={`text-xs mt-0.5 ${p.stock === 0 ? "text-red-400" : "text-emerald-600"}`}>
                    Stock: {p.stock ?? 0}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#EEF2FF] transition-colors"
                  >
                    <Pencil size={13} className="text-[#6366F1]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-4 py-3">
          <p className="text-sm text-[#94A3B8]">
            {(() => {
              const from = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
              const to   = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
              return `Showing ${from}–${to} of ${pagination.totalItems} products · Page ${pagination.currentPage} of ${pagination.totalPages}`;
            })()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage || isFetching}
            >
              <ChevronLeft size={15} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.currentPage) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-[#94A3B8] text-sm">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pagination.currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(p)}
                    disabled={isFetching}
                    className="w-8 h-8 p-0"
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="ghost" size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || isFetching}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete <span className="font-medium text-[#0F172A]">{deleteTarget?.name}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:cursor-not-allowed"
              onClick={confirmDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? <ButtonLoader text="Deleting…" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
