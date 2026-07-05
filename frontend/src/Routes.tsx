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
