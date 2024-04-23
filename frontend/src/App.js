import RouterData from "./Routes";
import is from 'is_js';
import { useAppContext } from './Main';
import React, { useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer } from "react-toastify";
import './assets/css/home_style.css'


const App = () => {
  const {
    config: { navbarPosition }
  } = useAppContext();

  const HTMLClassList = document.getElementsByTagName('html')[0].classList;

  useEffect(() => {
    if (is.windows()) {
      HTMLClassList.add('windows');
    }
    if (is.chrome()) {
      HTMLClassList.add('chrome');
    }
    if (is.firefox()) {
      HTMLClassList.add('firefox');
    }
    if (is.safari()) {
      HTMLClassList.add('safari');
    }
  }, [HTMLClassList]);

  useEffect(() => {
    if (navbarPosition === 'double-top') {
      HTMLClassList.add('double-top-nav-layout');
    }
    return () => HTMLClassList.remove('double-top-nav-layout');
  }, [navbarPosition, HTMLClassList]);

  return (
    <>
      <RouterData />
      <ToastContainer position='top-right' hideProgressBar={true} autoClose={1400}></ToastContainer>
    </>
  );
};

export default App;
