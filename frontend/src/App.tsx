import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./Routes";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
