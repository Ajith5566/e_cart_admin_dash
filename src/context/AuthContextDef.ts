// context/AuthContextDef.ts
import { createContext } from "react";
import type { ModulePermission } from "../types/permissionTypes";

export type AuthState = {
  role: string | null;
  permissions: ModulePermission[] | null; // null = super_admin, unrestricted
  loading: boolean;
  can: (module: string, action: keyof Omit<ModulePermission, "module">) => boolean;
};

export const AuthContext = createContext<AuthState>({
  role: null,
  permissions: null,
  loading: true,
  can: () => false,
});