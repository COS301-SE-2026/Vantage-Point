import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/** Requires a logged-in session but does not require a linked Riot ID. */
export default function AuthOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <p className="font-['Inter:Regular',sans-serif] text-[#757575]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
