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

export const RedirectToLogin = (navigate) =>{
  const url = new URL(window.location.href.toString());
  const path = url.pathname;
  navigate(`/auth/login?next=${path}`);
}