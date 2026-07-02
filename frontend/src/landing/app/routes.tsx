import { createBrowserRouter, Navigate } from "react-router";
import AuthOnlyRoute from "./components/AuthOnlyRoute";
import ConfirmEmailPage from "./components/ConfirmEmailPage";
import DashboardPage from "./components/DashboardPage";
import LinkRiotPage from "./components/LinkRiotPage";
import LoadingPage from "./components/LoadingPage";
import LoginPage from "./components/LoginPage";
import MatchDetailView from "./components/MatchDetailView";
import MatchesListView from "./components/MatchesListView";
import OAuthCallbackPage from "./components/OAuthCallbackPage";
import ProfileView from "./components/ProfileView";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import RegisterPage from "./components/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/auth/callback",
    Component: OAuthCallbackPage,
  },
  {
    path: "/confirm",
    Component: ConfirmEmailPage,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/register",
        Component: RegisterPage,
      },
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
