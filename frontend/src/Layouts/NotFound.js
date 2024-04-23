import React from 'react';
import { useAppContext } from '../Main';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const {config: {theme}} = useAppContext();
  return (
    <div id="page-container" className='content content-full py-11'>
        <main id="main-container">
            <div className="hero">
                <div className="hero-inner text-center">
                    <div className="bg-body-extra-light">
                        <div className='p-4 bg-white'>
                            <div className="py-4">
                                <h1 className="display-1 fw-bolder text-danger">
                                    404
                                </h1>
                                <h2 className="h5 fw-semibold text-dark mb-5">
                                    A página que você tentou acessar não existe ou não foi encontrada...
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

export default NotFound;
