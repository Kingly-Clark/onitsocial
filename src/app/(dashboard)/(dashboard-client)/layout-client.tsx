"use client";

import { useEffect } from "react";
import type { User, Brand, ConnectedAccount } from "@/types/database";
import { useUserStore } from "@/store/user-store";
import { useBrandStore } from "@/store/brand-store";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User;
  brands: Brand[];
  accounts: ConnectedAccount[];
}

export function DashboardLayoutClient({
  children,
  user,
  brands,
  accounts,
}: DashboardLayoutClientProps) {
  const setUser = useUserStore((state) => state.setUser);
  const { setBrands, setActiveBrand, setAccounts } = useBrandStore();

  useEffect(() => {
    // Initialize user store
    setUser(user);

    // Initialize brand store
    setBrands(brands);
    setAccounts(accounts);

    // Set first brand as active if available and none is selected
    if (brands.length > 0) {
      setActiveBrand(brands[0].id);
    }
  }, [user, brands, accounts, setUser, setBrands, setActiveBrand, setAccounts]);

  return <>{children}</>;
}
