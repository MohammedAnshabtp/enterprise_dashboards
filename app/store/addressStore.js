import { create } from "zustand";
import {
  getAddressService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  getAddressByIdService,
  setDefaultAddressService,
} from "../services/addressService";

export const useAddressStore = create((set) => ({
  addresses: [],
  loading: false,

  fetchAddresses: async () => {
    const res = await getAddressService();
    set({ addresses: res.data?.data || [] });
  },

  createAddress: async (data) => {
    await createAddressService(data);
  },

  updateAddress: async (id, data) => {
    await updateAddressService(id, data);
  },

  deleteAddress: async (id) => {
    await deleteAddressService(id);
  },

  getAddressById: async (id) => {
    const res = await getAddressByIdService(id);
    return res.data?.data ?? null;
  },

  setDefaultAddress: async (id) => {
    await setDefaultAddressService(id);
    set((state) => ({
      addresses: state.addresses.map((a) => ({
        ...a,
        isDefault: a._id === id,
      })),
    }));
  },
}));
