// context/AuthContextDef.ts
import { createContext } from "react";
import type { ModulePermission, ScopeValue } from "../types/permissionTypes";

export type AuthState = {
  role: string | null;
  adminId: string | null;
  permissions: ModulePermission[] | null;
  loading: boolean;
  can: (module: string, action: keyof Omit<ModulePermission, "module">) => boolean;
  getScope: (module: string, action: keyof Omit<ModulePermission, "module">) => ScopeValue;
};

export const AuthContext = createContext<AuthState>({
  role: null,
  adminId: null,
  permissions: null,
  loading: true,
  can: () => false,
  getScope: () => "none",
});