import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  readonly requireRiot?: boolean;
}

export default function ProtectedRoute({
  requireRiot = false,
}: Readonly<ProtectedRouteProps>) {
  const { user, loading } = useAuth();

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

  if (requireRiot && !user.has_linked_riot) {
    return <Navigate to="/link-riot" replace />;
  }

  return <Outlet />;
}
