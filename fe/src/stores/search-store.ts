import { create } from "zustand";
import type { ProductType } from "@/lib/types/product";

interface SearchStore {
  keyword: string;
  types: ProductType[];

  setKeyword: (kw: string) => void;
  setTypes: (types: ProductType[]) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  keyword: "",
  types: ["BOOK", "CD", "DVD", "NEWSPAPER"],

  setKeyword: (kw) => set({ keyword: kw }),
  setTypes: (types) => set({ types }),

  resetFilters: () =>
    set({
      keyword: "",
      types: ["BOOK", "CD", "DVD", "NEWSPAPER"]
    })
}));
