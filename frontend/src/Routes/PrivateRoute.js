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
  const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
  navigate(`/auth/login?next=${next}`);
}