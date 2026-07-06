// routes/GuestRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAdminAuthApi } from "../services/allAPi";

type Props = {
  children: React.ReactNode;
};

export default function GuestRoute({ children }: Props) {
  const [status, setStatus] = useState<"checking" | "authenticated" | "guest">("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        await checkAdminAuthApi();
        if (!cancelled) setStatus("authenticated");
      } catch {
        // interceptor already tried refresh and failed — just show login
        // ✅ clear the logged_out flag so fresh login works next time
        sessionStorage.removeItem("logged_out");
        if (!cancelled) setStatus("guest");
      }
    };

    check();

    // cleanup — prevents state update if component unmounts mid-check
    return () => { cancelled = true; };
  }, []); // runs once only on mount

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          color: "#8a8da3",
          fontSize: "14px",
        }}
      >
        <div
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        />
        <span>Checking session…</span>
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/admin-dash" replace />;
  }

  return <>{children}</>;
}