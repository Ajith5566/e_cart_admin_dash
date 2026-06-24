// context/AuthContext.tsx
import { useEffect, useState } from "react";
import type { ModulePermission } from "../types/permissionTypes";
import { checkAdminPermissionAuthApi } from "../services/allAPi";
import { AuthContext } from "./AuthContextDef";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ModulePermission[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await checkAdminPermissionAuthApi();
        setRole(res.data.role);
        setPermissions(res.data.permissions);
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const can = (module: string, action: keyof Omit<ModulePermission, "module">) => {
    if (role === "super_admin") return true;
    if (!permissions) return false;
    const modulePerm = permissions.find((p) => p.module === module);
    return !!modulePerm?.[action];
  };

  return (
    <AuthContext.Provider value={{ role, permissions, loading, can }}>
      {children}
    </AuthContext.Provider>
  );
}