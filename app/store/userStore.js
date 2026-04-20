import { create } from "zustand";
import {
  deleteAvatarService,
  updateProfileService,
  uploadAvatarService,
} from "../services/authServices";

export const useUserStore = create((set) => ({
  user: null,
  loading: false,

  updateProfile: async (data) => {
    set({ loading: true });

    try {
      // 🔥 remove empty values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "")
      );

      const res = await updateProfileService(filteredData);

      set({
        user: res.data.user,
      });
    } catch (err) {
      console.log("ERROR:", err.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (file) => {
    try {
      const res = await uploadAvatarService(file);

      set((state) => ({
        user: {
          ...state.user,
          avatar: res.data.avatar,
        },
      }));
    } catch (err) {
      console.error("Upload avatar error", err);
    }
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
