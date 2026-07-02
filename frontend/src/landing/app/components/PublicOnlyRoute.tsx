import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/** Redirects authenticated users away from login/register pages. */
export default function PublicOnlyRoute() {
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

  if (user) {
    if (user.has_linked_riot) {
      return <Navigate to="/loading" replace />;
    }
    return <Navigate to="/link-riot" replace />;
  }

  return <Outlet />;
}
