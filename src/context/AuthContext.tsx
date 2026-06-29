// context/AuthContext.tsx
import { useEffect, useState } from "react";
import type { ModulePermission, ScopeValue } from "../types/permissionTypes";
import { checkAdminPermissionAuthApi } from "../services/allAPi";
import { AuthContext } from "./AuthContextDef";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ModulePermission[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await checkAdminPermissionAuthApi();
        setRole(res.data.role);
        setAdminId(res.data.adminId);
        setPermissions(res.data.permissions);
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getScope = (module: string, action: keyof Omit<ModulePermission, "module">): ScopeValue => {
    if (role === "super_admin") return "all";
    if (!permissions) return "none";
    const modulePerm = permissions.find((p) => p.module === module);
    return (modulePerm?.[action] as ScopeValue) || "none";
  };

  const can = (module: string, action: keyof Omit<ModulePermission, "module">) =>
    getScope(module, action) !== "none";

  return (
    <AuthContext.Provider value={{ role, adminId, permissions, loading, can, getScope }}>
      {children}
    </AuthContext.Provider>
  );
}