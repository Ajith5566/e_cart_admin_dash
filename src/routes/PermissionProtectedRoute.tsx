// routes/PermissionProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type Props = {
  module: string;
  action: "view" | "create" | "update" | "status" | "delete";
  children: React.ReactNode;
};

function PermissionProtectedRoute({ module, action, children }: Props) {
  const { can, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (!can(module, action)) {
    return <Navigate to="/admin-dash" replace />;
    // or render a styled "Access Denied" page instead of redirecting, your call
  }

  return <>{children}</>;
}

export default PermissionProtectedRoute;