import { create } from "zustand";
import {
  deleteAvatarService,
  updateProfileService,
  uploadAvatarService,
} from "../services/authServices";

export const useUserStore = create((set) => ({
  user: null,
  loading: false,

  // ✅ FETCH PROFILE
  getProfile: async () => {
    try {
      const res = await getProfileService();

      set({
        user: res.data?.data, // ⚠️ IMPORTANT PATH
      });
    } catch (err) {
      console.log("PROFILE ERROR:", err.response?.data);
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });

    try {
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "")
      );

      const res = await updateProfileService(filteredData);

      set((state) => ({
        user: {
          ...state.user,
          ...res.data.data, // ✅ FIXED
        },
      }));
    } catch (err) {
      console.log("ERROR:", err.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await uploadAvatarService(file);

    // ✅ FIX: correct path
    const avatarUrl = res.data?.data?.avatar;

    // ✅ UPDATE STATE
    set((state) => ({
      user: {
        ...state.user,
        avatar: avatarUrl,
      },
    }));
  },

  deleteAvatar: async () => {
    try {
      await deleteAvatarService();

      set((state) => ({
        user: {
          ...state.user,
          avatar: null,
        },
      }));
    } catch (err) {
      console.error("Delete avatar error", err);
    }
  },
}));
