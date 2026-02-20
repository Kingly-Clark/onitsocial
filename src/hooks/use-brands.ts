import { useEffect } from "react";
import { useBrandStore } from "@/store/brand-store";

export function useBrands() {
  const { brands, activeBrandId, setActiveBrand, setBrands, setAccounts } =
    useBrandStore();

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/brands");
        if (!response.ok) {
          console.error("Failed to fetch brands:", response.statusText);
          return;
        }

        const data = await response.json();
        setBrands(data.brands || []);
        setAccounts(data.accounts || []);

        // Auto-set first brand as active if none selected
        if (!activeBrandId && data.brands?.length > 0) {
          setActiveBrand(data.brands[0].id);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }

    fetchBrands();
  }, [activeBrandId, setActiveBrand, setBrands, setAccounts]);

  return { brands, activeBrandId };
}
