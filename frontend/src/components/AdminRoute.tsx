import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

interface AdminRouteProps {
  readonly requireSuperAdmin?: boolean; // for  only superadmins to access, not regular admins
}

export default function AdminRoute({
  requireSuperAdmin = false,
}: Readonly<AdminRouteProps>) {
  const { user, loading } = useAuth();

  // STUB — remove once the backend returns UserMe.role
  if (import.meta.env.DEV) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <p className="font-['Inter:Regular',sans-serif] text-[#757575]">
          Loading…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  const isAdmin = role === "Admin" || role === "Super Admin";
  const isSuperAdmin = role === "Super Admin";

  if (!isAdmin || (requireSuperAdmin && !isSuperAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
