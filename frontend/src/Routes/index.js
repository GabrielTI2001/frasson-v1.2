import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import LayoutRoutes from "./LayoutRoutes";
import 'react-toastify/dist/ReactToastify.css';
import AuthSimpleLayout from "../Layouts/AuthSimpleLayout";
import Login from "../Authentication/Login";
import Register from "../Authentication/Register";
import ActivateAccount from "../Authentication/ActivateAccount";
import ForgetPasswordForm from "../components/authentication/ForgetPasswordForm";
import PasswordConfirmForm from "../components/authentication/PasswordConfirmForm";
import LogoutContent from '../components/authentication/LogoutContent'
import React, { useReducer} from 'react';
import { ProfileContext } from '../context/Context';
import { profileReducer } from "../reducers/profileReducer";
import Forbiden from "../Layouts/Forbiden";

const RouterData = () => {
  const login = localStorage.getItem("login");
  const initialState = {
    perfil:{}
  };
  const [profileState, profileDispatch] = useReducer(profileReducer, initialState);
  return (
    <ProfileContext.Provider value={{ profileState, profileDispatch }}>
      <BrowserRouter basename={"/"}>
        <Routes>
        {login ? (
            <>
              <Route
                path={`${process.env.PUBLIC_URL}` || '/'}
                element={
                  <Navigate to={`${process.env.PUBLIC_URL}/home`} />
                }
              />
            </>
          ) : (
            ""
          )}
          <Route path={"/"} element={<PrivateRoute />}> 
            <Route path={`/*`} element={<LayoutRoutes />} />
          </Route>
          <Route element={<AuthSimpleLayout />}>
            <Route path={`/auth/logout`} element={<LogoutContent />} />
            <Route path={`/auth/login`} element={<Login />} />
            <Route path={`/auth/register`} element={<Register />} />
            <Route path={`/activate/:uid/:token`} element={<ActivateAccount />} />
            <Route path="/auth/password/forget" element={<ForgetPasswordForm />}/>
            <Route path="/password/reset/confirm/:uid/:token" element={<PasswordConfirmForm />}/>
          </Route>
          <Route path="/error/403" element={<Forbiden />}/>
        </Routes>
      </BrowserRouter>
    </ProfileContext.Provider>
  );
};

export default RouterData;
