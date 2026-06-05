import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute = ({
  children,
  allowedRoles
}: Props) => {

  const user = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/admin-dash" />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;