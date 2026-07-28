import { createBrowserRouter, Navigate } from "react-router";
import AuthOnlyRoute from "./components/AuthOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LinkRiotPage from "./pages/LinkRiotPage";
import LoadingPage from "./pages/LoadingPage";
import LoginPage from "./pages/LoginPage";
import MatchDetailView from "./pages/MatchDetailView";
import MatchesListView from "./pages/MatchesListView";
import ProfileView from "./pages/ProfileView";
import RegisterPage from "./pages/RegisterPage";
import AdminRoute from "./components/AdminRoute";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminMatchesPage from "./pages/admin/AdminMatchesPage";
import AdminMapAssetsPage from "./pages/admin/AdminMapAssetsPage";
import AdminChampionAssetsPage from "./pages/admin/AdminChampionAssetsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    element: <AdminRoute />,
    children: [
      { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "/admin/dashboard", Component: AdminDashboardPage },
      { path: "/admin/users", Component: AdminUsersPage },
      { path: "/admin/matches", Component: AdminMatchesPage },
      { path: "/admin/map-assets", Component: AdminMapAssetsPage },
      { path: "/admin/champion-assets", Component: AdminChampionAssetsPage },
      { path: "/admin/settings", Component: AdminSettingsPage },
    ],
  },
  {
    path: "/link-riot-id",
    element: <Navigate to="/link-riot" replace />,
  },
  {
    path: "/sign-in-loading",
    element: <Navigate to="/loading" replace />,
  },
  {
    element: <AuthOnlyRoute />,
    children: [
      {
        path: "/link-riot",
        Component: LinkRiotPage,
      },
      {
        path: "/loading",
        Component: LoadingPage,
      },
    ],
  },
  {
    element: <ProtectedRoute requireRiot />,
    children: [
      {
        path: "/dashboard",
        Component: DashboardPage,
        children: [
          { index: true, element: <Navigate to="matches" replace /> },
          { path: "matches", Component: MatchesListView },
          { path: "matches/:matchId", Component: MatchDetailView },
          { path: "profile", Component: ProfileView },
        ],
      },
    ],
  },
]);
