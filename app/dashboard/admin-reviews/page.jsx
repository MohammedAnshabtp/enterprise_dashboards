/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminReviews, useDeleteReview } from "../../hooks/useReviews";
import dayjs from "../../lib/dayjs";
import { Button } from "../../components/ui/button";
import { Input }  from "../../components/ui/input";
import { Badge }  from "../../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader from "../../components/ui/ButtonLoader";
import EmptyState   from "../../components/ui/EmptyState";

const LIMIT = 15;

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E2E8F0] fill-[#E2E8F0]"}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [page, setPage]        = useState(1);
  const [search, setSearch]    = useState("");
  const [debSearch, setDeb]    = useState("");
  const [deleteTarget, setDel] = useState(null);
  const debRef                 = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const params = { page, limit: LIMIT };
  const { data: result, isLoading, isFetching } = useAdminReviews(params);
  const reviews    = result?.data       ?? [];
  const pagination = result?.pagination ?? {};

  const filtered = debSearch
    ? reviews.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(debSearch.toLowerCase()) ||
          r.product?.name?.toLowerCase().includes(debSearch.toLowerCase()) ||
          r.comment?.toLowerCase().includes(debSearch.toLowerCase())
      )
    : reviews;

  const del = useDeleteReview();

  const confirmDelete = () => {
    del.mutate(deleteTarget._id);
    setDel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0">
              <Star size={18} className="text-[#D97706]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Reviews</h1>
              <p className="text-xs text-[#94A3B8]">
                {pagination.total != null
                  ? `${pagination.total} reviews total`
                  : "Moderate customer reviews"}
              </p>
            </div>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search reviews…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-56 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`flex gap-4 p-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#F1F5F9] rounded w-1/4" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Star} title="No reviews found" />
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1.5fr_2fr_auto_2fr_auto_auto] gap-4 px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">User</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Product</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Rating</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Comment</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Date</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Action</span>
            </div>

            {filtered.map((review, i) => (
              <div
                key={review._id}
                className={`flex flex-col md:grid md:grid-cols-[1.5fr_2fr_auto_2fr_auto_auto] md:items-center gap-3 md:gap-4 px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors group ${
                  i > 0 ? "border-t border-[#F1F5F9]" : ""
                }`}
              >
                {/* User */}
                <div className="min-w-0">
                  <p className="font-medium text-sm text-[#0F172A] truncate">
                    {review.user?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-[#94A3B8] truncate">{review.user?.email || ""}</p>
                </div>

                {/* Product */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {review.product?.thumbnail ? (
                    <img
                      src={review.product.thumbnail}
                      alt={review.product?.name}
                      className="w-9 h-9 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] shrink-0 flex items-center justify-center">
                      <Star size={14} className="text-[#94A3B8]" />
                    </div>
                  )}
                  <p className="text-sm text-[#0F172A] truncate">{review.product?.name || "—"}</p>
                </div>

                {/* Rating */}
                <StarRating rating={review.rating} />

                {/* Comment */}
                <p className="text-sm text-[#64748B] line-clamp-2">
                  {review.comment || <span className="text-[#94A3B8] italic">No comment</span>}
                </p>

                {/* Date */}
                <span className="text-xs text-[#94A3B8] shrink-0">
                  {dayjs(review.createdAt).format("DD MMM YYYY")}
                </span>

                {/* Action */}
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      review.isApproved
                        ? "bg-[#DCFCE7] text-[#16A34A] shrink-0"
                        : "bg-[#FEF2F2] text-[#EF4444] shrink-0"
                    }
                  >
                    {review.isApproved ? "Approved" : "Hidden"}
                  </Badge>
                  <button
                    onClick={() => setDel(review)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors md:opacity-0 md:group-hover:opacity-100"
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
              const from = (pagination.page - 1) * pagination.limit + 1;
              const to   = Math.min(pagination.page * pagination.limit, pagination.total);
              return `Showing ${from}–${to} of ${pagination.total}`;
            })()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={pagination.page <= 1 || isFetching}
            >
              <ChevronLeft size={15} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
              )
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
                    variant={p === pagination.page ? "default" : "ghost"}
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
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination.page >= pagination.totalPages || isFetching}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Delete review by{" "}
            <span className="font-medium text-[#0F172A]">{deleteTarget?.user?.name || "this user"}</span>{" "}
            for{" "}
            <span className="font-medium text-[#0F172A]">
              {deleteTarget?.product?.name || "this product"}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDel(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:cursor-not-allowed"
              onClick={confirmDelete}
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
