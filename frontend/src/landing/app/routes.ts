import { createBrowserRouter } from "react-router";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import RiotIdPage from "./components/RiotIdPage";
import DashboardPage from "./components/DashboardPage";
import SignInLoadingPage from "./components/SignInLoadingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/sign-in-loading",
    Component: SignInLoadingPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/link-riot-id",
    Component: RiotIdPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
]);
