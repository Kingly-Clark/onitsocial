import { create } from "zustand";
import type { Brand, ConnectedAccount } from "@/types/database";

interface BrandState {
  brands: Brand[];
  activeBrandId: string | null;
  accounts: ConnectedAccount[];
  setBrands: (brands: Brand[]) => void;
  setActiveBrand: (id: string | null) => void;
  setAccounts: (accounts: ConnectedAccount[]) => void;
  getActiveBrand: () => Brand | undefined;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  activeBrandId: null,
  accounts: [],
  setBrands: (brands) => set({ brands }),
  setActiveBrand: (id) => set({ activeBrandId: id }),
  setAccounts: (accounts) => set({ accounts }),
  getActiveBrand: () => {
    const { brands, activeBrandId } = get();
    return brands.find((b) => b.id === activeBrandId);
  },
}));
