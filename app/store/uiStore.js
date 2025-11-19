"use client";
import { create } from "zustand";

export const useUIStore = create((set) => ({
  // Sidebar collapsed or not
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Active menu highlight
  activeMenu: "dashboard",
  setActiveMenu: (menu) => set({ activeMenu: menu }),

  // Global user info (example)
  user: null,
  setUser: (user) => set({ user }),
}));
