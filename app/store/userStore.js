import { create } from "zustand";
import {
  getProfile as getProfileService,
  deleteAvatarService,
  updateProfileService,
  uploadAvatarService,
} from "../services/authServices";

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  avatarLoading: false,

  getProfile: async () => {
    try {
      const res = await getProfileService();
      set({ user: res.data?.data });
    } catch (err) {
      throw err;
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });
    try {
      const filtered = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "")
      );
      const res = await updateProfileService(filtered);
      set((state) => ({ user: { ...state.user, ...res.data.data } }));
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (file) => {
    set({ avatarLoading: true });
    try {
      const res = await uploadAvatarService(file);
      const avatarUrl = res.data?.data?.avatar;
      set((state) => ({ user: { ...state.user, avatar: avatarUrl } }));
    } finally {
      set({ avatarLoading: false });
    }
  },

  deleteAvatar: async () => {
    set({ avatarLoading: true });
    try {
      await deleteAvatarService();
      set((state) => ({ user: { ...state.user, avatar: null } }));
    } finally {
      set({ avatarLoading: false });
    }
  },
}));
