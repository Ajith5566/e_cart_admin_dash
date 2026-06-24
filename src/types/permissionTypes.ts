// types/types.ts
export type ModulePermission = {
  module: string;
  view: boolean;
  create: boolean;
  update: boolean;
  status: boolean;
  delete: boolean;
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

export type AuthCheckResponse = {
  authenticated: boolean;
  adminId: string;
  role: string;
  permissions: ModulePermission[] | null;
};