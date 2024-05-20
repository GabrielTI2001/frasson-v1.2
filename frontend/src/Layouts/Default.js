import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import NavbarTop from '../components/navbar/top/NavbarTop';
// import Footer from '../components/footer/Footer';
import { useAppContext } from '../Main';

const App = () => {
    const { hash, pathname } = useLocation();
    const {
      config: { isFluid }
    } = useAppContext();
  
    useEffect(() => {
      setTimeout(() => {
        if (hash) {
          const id = hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        }
      }, 0);
    });
  
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    return (
      <>
        <div className={isFluid ? 'container-fluid' : 'container'}>
          <div className={classNames('content', 'pb-0')}>
              <NavbarTop />
              <hr className="my-0 d-lg-block"></hr>
              <div className="container-fluid mt-2 px-3 conteudo">
                <Outlet />
              </div>
          </div>
        </div>
      </>
    );
  };
  
  export default App;
  