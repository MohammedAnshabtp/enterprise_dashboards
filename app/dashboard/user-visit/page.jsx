"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useUsers, useDeleteUser, useUpdateUserStatus } from "../../hooks/useUsers";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { TableRowSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import dayjs from "../../lib/dayjs";

const LIMIT = 10;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: LIMIT,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();

  function toggleSort(field) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  }

  function SortIcon({ field }) {
    if (sortBy !== field) return null;
    return sortOrder === "asc"
      ? <ChevronUp size={13} className="inline ml-0.5" />
      : <ChevronDown size={13} className="inline ml-0.5" />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Users</h1>
          <p className="text-sm text-[#94A3B8]">Manage registered user accounts</p>
        </div>
        {pagination.totalItems != null && (
          <Badge className="text-sm px-3 py-1">
            {pagination.totalItems} {pagination.totalItems === 1 ? "User" : "Users"}
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <Input
          placeholder="Search by name, email, mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className={`overflow-x-auto transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  Name <SortIcon field="name" />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("createdAt")}
                >
                  Joined <SortIcon field="createdAt" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: LIMIT }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={9} />
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <EmptyState icon={Users} title="No users found" />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium text-[#0F172A]">
                      {user.name || "—"}
                    </TableCell>
                    <TableCell className="text-[#475569]">{user.email}</TableCell>
                    <TableCell className="text-[#475569]">
                      {user.mobileNumber || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role ?? "customer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#475569] text-sm">
                      {user.occupation || "—"}
                    </TableCell>
                    <TableCell className="text-[#94A3B8] text-sm">
                      {user.createdAt ? dayjs(user.createdAt).format("DD MMM YYYY") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isEmailVerified
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }
                      >
                        {user.isEmailVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role === "admin" ? (
                        <span className="text-xs text-[#94A3B8]">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({ id: user._id, activeStatus: !user.isActive })
                            }
                            disabled={updateStatus.isPending}
                            className={
                              user.isActive
                                ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }
                          >
                            {user.isActive ? (
                              <><ToggleRight size={15} className="mr-1" />Deactivate</>
                            ) : (
                              <><ToggleLeft size={15} className="mr-1" />Activate</>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser.mutate(user._id)}
                            disabled={deleteUser.isPending}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
            <p className="text-sm text-[#94A3B8]">
              Page {pagination.currentPage} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.totalItems} users
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage || isFetching}
              >
                <ChevronLeft size={15} />
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.currentPage) <= 1
                )
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-[#94A3B8] text-sm">…</span>
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
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage || isFetching}
              >
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
