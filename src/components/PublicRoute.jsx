import authStore from "@/zustand/Store/authStore";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const authToken = authStore((state) => state.authToken);

  if (authToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
