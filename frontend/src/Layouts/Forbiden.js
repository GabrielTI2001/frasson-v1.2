import React from 'react';
import { useAppContext } from '../Main';
import { Link } from 'react-router-dom';

const Forbiden = () => {
  const {config: {theme}} = useAppContext();
  return (
    <div id="page-container" className='content content-full py-11'>
        <main id="main-container">
            <div className="hero">
                <div className="hero-inner text-center">
                    <div className="bg-body-extra-light">
                        <div className='p-4 bg-white'>
                            <div className="py-4">
                                <h1 className="display-1 fw-bolder text-primary mb-4">
                                  Opa!
                                </h1>
                                <h2 className="h5 fw-semibold text-dark mb-5">
                                  Você não possui permissão para acessar esta página...
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="text-muted fs-sm fw-medium p-4">
                      <Link className="link text-decoration-none" to={'/home/'}>Voltar para Home Page</Link>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default Forbiden;
