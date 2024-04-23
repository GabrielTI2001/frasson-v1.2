import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const login = localStorage.getItem("login") || false;
  return login !== false ? (
    <Outlet />
    ) : (
    <Navigate to={`${process.env.PUBLIC_URL}/auth/login`} />
  );
};

export default PrivateRoute;
