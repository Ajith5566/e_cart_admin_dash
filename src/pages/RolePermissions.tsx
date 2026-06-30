// pages/RolePermissions.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe, faUserCheck, faBan, faCircleInfo, faFloppyDisk,
  faUserTie, faUsers,
} from "@fortawesome/free-solid-svg-icons";

import { getPermissionModulesApi, getPermissionsByRoleApi, updatePermissionsByRoleApi } from "../services/allAPi";
import type { ModulePermission, ScopeValue } from "../types/permissionTypes";
import { OWNERSHIP_MODULES } from "../types/permissionTypes";
import "./RolePermissions.css";

const ACTIONS: (keyof Omit<ModulePermission, "module">)[] = ["view", "create", "update", "status", "delete"];

const SCOPE_META: Record<ScopeValue, { label: string; icon: typeof faGlobe; className: string }> = {
  all:  { label: "All",  icon: faGlobe,     className: "rp2-scope-all" },
  own:  { label: "Own",  icon: faUserCheck, className: "rp2-scope-own" },
  none: { label: "None", icon: faBan,       className: "rp2-scope-none" },
};

const ROLE_META = {
  admin: { label: "Admin", icon: faUserTie },
  staff: { label: "Staff", icon: faUsers },
} as const;

const BLANK_PERMISSION = (module: string): ModulePermission => ({
  module,
  view: "none",
  create: "none",
  update: "none",
  status: "none",
  delete: "none",
});

// guarantees a valid ScopeValue even if the saved data has a stray/legacy value
const safeScope = (value: unknown): ScopeValue =>
  value === "all" || value === "own" || value === "none" ? value : "none";

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

  const summary = useMemo(() => {
    let allCount = 0, ownCount = 0, noneCount = 0;
    permissions.forEach((p) => {
      ACTIONS.forEach((a) => {
        const v = safeScope(p[a]);
        if (v === "all") allCount++;
        else if (v === "own") ownCount++;
        else noneCount++;
      });
    });
    return { allCount, ownCount, noneCount };
  }, [permissions]);

  return (
    <div className="rp2-wrapper">
      <div className="mb-1">
        <h4 className="fw-bold text-dark mb-1">Role Permissions</h4>
        <p className="text-muted mb-0">
          Decide what each role can see and do across every part of the system.
        </p>
      </div>

      {/* ROLE SWITCHER */}
      <div className="rp2-role-switch">
        <button
          type="button"
          className={`rp2-role-pill ${activeRole === "admin" ? "rp2-role-pill-active" : ""}`}
          onClick={() => setActiveRole("admin")}
        >
          <FontAwesomeIcon icon={ROLE_META.admin.icon} />
          Admin
        </button>
        <button
          type="button"
          className={`rp2-role-pill ${activeRole === "staff" ? "rp2-role-pill-active" : ""}`}
          onClick={() => setActiveRole("staff")}
        >
          <FontAwesomeIcon icon={ROLE_META.staff.icon} />
          Staff
        </button>
      </div>

      {/* LEGEND */}
      <div className="rp2-legend">
        <div className="rp2-legend-item">
          <span className={`rp2-scope-badge ${SCOPE_META.all.className}`}>
            <FontAwesomeIcon icon={SCOPE_META.all.icon} />
            All
          </span>
          <span className="rp2-legend-text">
            Can act on <strong>every record</strong>, created by anyone.
          </span>
        </div>
        <div className="rp2-legend-item">
          <span className={`rp2-scope-badge ${SCOPE_META.own.className}`}>
            <FontAwesomeIcon icon={SCOPE_META.own.icon} />
            Own
          </span>
          <span className="rp2-legend-text">
            Can only act on records <strong>they personally created</strong>.
          </span>
        </div>
        <div className="rp2-legend-item">
          <span className={`rp2-scope-badge ${SCOPE_META.none.className}`}>
            <FontAwesomeIcon icon={SCOPE_META.none.icon} />
            None
          </span>
          <span className="rp2-legend-text">
            <strong>No access</strong> to this action.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rp2-loading">Loading {activeRole === "admin" ? "Admin" : "Staff"} permissions…</div>
      ) : (
        <>
          {/* SUMMARY STRIP */}
          <div className="rp2-summary">
            <span><FontAwesomeIcon icon={SCOPE_META.all.icon} className="rp2-summary-icon rp2-text-all" /> {summary.allCount} set to All</span>
            <span><FontAwesomeIcon icon={SCOPE_META.own.icon} className="rp2-summary-icon rp2-text-own" /> {summary.ownCount} set to Own</span>
            <span><FontAwesomeIcon icon={SCOPE_META.none.icon} className="rp2-summary-icon rp2-text-none" /> {summary.noneCount} set to None</span>
          </div>

          <div className="rp2-table-wrap">
            <table className="rp2-table">
              <thead>
                <tr>
                  <th className="rp2-th-module">Module</th>
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
                      <td className="rp2-module-name text-capitalize">{perm.module}</td>
                      {ACTIONS.map((action) => {
                        const isCreate = action === "create";
                        const showOwnOption = supportsOwn && !isCreate;
                        const value = safeScope(perm[action]);
                        const meta = SCOPE_META[value];

                        return (
                          <td key={action} className="text-center">
                            <div className={`rp2-select-wrap ${meta.className}`}>
                              <FontAwesomeIcon icon={meta.icon} className="rp2-select-icon" />
                              <select
                                className="rp2-select"
                                value={value}
                                onChange={(e) => updateCell(perm.module, action, e.target.value)}
                                aria-label={`${action} permission for ${perm.module}`}
                              >
                                <option value="all">All</option>
                                {showOwnOption && <option value="own">Own</option>}
                                <option value="none">None</option>
                              </select>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rp2-footnote">
            <FontAwesomeIcon icon={faCircleInfo} className="me-2" />
            "Own" is only available where the system tracks who created each record. Other modules offer All or None only.
          </div>

          <button type="button" className="rp2-save-btn" onClick={handleSave} disabled={saving}>
            <FontAwesomeIcon icon={faFloppyDisk} />
            {saving ? "Saving..." : `Save ${activeRole === "admin" ? "Admin" : "Staff"} Permissions`}
          </button>
        </>
      )}
    </div>
  );
}