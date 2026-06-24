// pages/RolePermissions.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import type { ModulePermission } from "../types/permissionTypes";
import { getPermissionModulesApi, getPermissionsByRoleApi, updatePermissionsByRoleApi } from "../services/allAPi";


const ACTIONS: (keyof Omit<ModulePermission, "module">)[] = ["view", "create", "update", "status", "delete"];

export default function RolePermissions() {
  const [activeRole, setActiveRole] = useState<"admin" | "staff">("admin");
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

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
          return found || { module: m, view: false, create: false, update: false, status: false, delete: false };
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

  const toggleCheckbox = (module: string, action: keyof Omit<ModulePermission, "module">) => {
    setPermissions((prev) =>
      prev.map((p) => (p.module === module ? { ...p, [action]: !p[action] } : p))
    );
  };

  const handleSave = async () => {
    try {
      await updatePermissionsByRoleApi(activeRole, permissions);
      toast.success(`${activeRole === "admin" ? "Admin" : "Staff"} permissions updated`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save permissions");
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
                {permissions.map((perm) => (
                  <tr key={perm.module}>
                    <td className="text-capitalize">{perm.module}</td>
                    {ACTIONS.map((action) => (
                      <td key={action} className="text-center">
                        <input
                          type="checkbox"
                          checked={perm[action]}
                          onChange={() => toggleCheckbox(perm.module, action)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary mt-3" onClick={handleSave}>
            Save {activeRole === "admin" ? "Admin" : "Staff"} Permissions
          </button>
        </>
      )}
    </div>
  );
}