// types/types.ts

export type ScopeValue = "all" | "own" | "none";
export type CreateScopeValue = "all" | "none"; // no "own" — creator is automatically the owner

export type ModulePermission = {
  module: string;
  view: ScopeValue;
  create: CreateScopeValue;
  update: ScopeValue;
  status: ScopeValue;
  delete: ScopeValue;
};

export type PermissionDoc = {
  _id: string;
  role: "admin" | "staff";
  permissions: ModulePermission[];
};

export type ModulesResponse = {
  modules: string[];
};

export type PermissionResponse = {
  permission: PermissionDoc;
};

// types/permissionTypes.ts (or wherever this lives)
export type AuthCheckResponse = {
  authenticated: boolean;
  adminId: string;
  role: string;
  permissions: ModulePermission[] | null;
};

// Modules where "Own" is a meaningful option, because records track who created them.
// Expand this list as you add createdBy/adminId tracking to more modules.
export const OWNERSHIP_MODULES = ["products", "blog"];