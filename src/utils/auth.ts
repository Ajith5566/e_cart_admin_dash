export const getCurrentUser = () => {
  const user = localStorage.getItem("adminUser");

  return user ? JSON.parse(user) : null;
};

export const isSuperAdmin = () => {
  const user = getCurrentUser();

  return user?.role === "super_admin";
};