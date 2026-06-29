// pages/RolePermissions.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getPermissionModulesApi, getPermissionsByRoleApi, updatePermissionsByRoleApi } from "../services/allAPi";
import type { ModulePermission, ScopeValue } from "../types/permissionTypes";
import { OWNERSHIP_MODULES } from "../types/permissionTypes";
const ACTIONS: (keyof Omit<ModulePermission, "module">)[] = ["view", "create", "update", "status", "delete"];

const BLANK_PERMISSION = (module: string): ModulePermission => ({
  module,
  view: "none",
  create: "none",
  update: "none",
  status: "none",
  delete: "none",
});

export default function RolePermissions() {
  const [activeRole, setActiveRole] = useState<"admin" | "staff">("admin");
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [modulesRes, permRes] = await Promise.all([
          getPermissionModulesApi(),
          getPermissionsByRoleApi(activeRole),
        ]);
        const modules: string[] = modulesRes.data.modules;
        const saved: ModulePermission[] = permRes.data.permission.permissions;

        // ensure every current module shows up, even if added after the doc was seeded
        const merged = modules.map((m) => {
          const found = saved.find((p) => p.module === m);
          return found || BLANK_PERMISSION(m);
        });

        setPermissions(merged);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeRole]);

  const updateCell = (
    module: string,
    action: keyof Omit<ModulePermission, "module">,
    value: string
  ) => {
    setPermissions((prev) =>
      prev.map((p) => (p.module === module ? { ...p, [action]: value } : p))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePermissionsByRoleApi(activeRole, permissions);
      toast.success(`${activeRole === "admin" ? "Admin" : "Staff"} permissions updated`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container p-md-3">
      <h4 className="fw-bold text-dark mb-3">Role Permissions</h4>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeRole === "admin" ? "active" : ""}`}
            onClick={() => setActiveRole("admin")}
          >
            Admin
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeRole === "staff" ? "active" : ""}`}
            onClick={() => setActiveRole("staff")}
          >
            Staff
          </button>
        </li>
      </ul>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Module Permission</th>
                  {ACTIONS.map((action) => (
                    <th key={action} className="text-capitalize text-center">{action}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => {
                  const supportsOwn = OWNERSHIP_MODULES.includes(perm.module);

                  return (
                    <tr key={perm.module}>
                      <td className="text-capitalize">{perm.module}</td>
                      {ACTIONS.map((action) => {
                        const isCreate = action === "create";
                        const showOwnOption = supportsOwn && !isCreate;

                        return (
                          <td key={action} className="text-center">
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: "90px" }}
                              value={perm[action] as ScopeValue}
                              onChange={(e) => updateCell(perm.module, action, e.target.value)}
                            >
                              <option value="all">All</option>
                              {showOwnOption && <option value="own">Own</option>}
                              <option value="none">✕ None</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary mt-3" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : `Save ${activeRole === "admin" ? "Admin" : "Staff"} Permissions`}
          </button>
        </>
      )}
    </div>
  );
}