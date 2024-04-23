import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import logoutImg from '../../assets/img/icons/spot-illustrations/45.png';
import { useEffect } from 'react';

const LogoutContent = ({ layout, titleTag: TitleTag }) => {
  const token = localStorage.getItem("token")
  const navigate = useNavigate();
  const [iniciado, setIniciado] = useState(false)


  useEffect(() => {
    const SendApi = async () => {
      try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/token/logout/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
          });
          console.log(response.status)
          if (response.status === 401){
            localStorage.setItem("login", JSON.stringify(false));
            localStorage.setItem('token', "");
            navigate(`${process.env.PUBLIC_URL}/auth/login`);
          }
          else{
            localStorage.setItem("login", JSON.stringify(false));
            localStorage.setItem('token', "");
          }
      } catch (error) {
          console.error('Erro ao fazer logout:', error);
      }
    };
    if (!iniciado){
      SendApi()
      setIniciado(true)
    }
  },[iniciado, navigate, token])

  return (
    <>
      <img
        className="d-block mx-auto mb-4"
        src={logoutImg}
        alt="shield"
        width={100}
      />
      <TitleTag>Vejo Você de Novo!</TitleTag>
      <p>
        Obrigado Por Usar Nossa Aplicação
      </p>
      <Button
        as={Link}
        size="sm"
        className="mt-3 text-light"
        to={`/auth/login`}
      >
        <FontAwesomeIcon
          icon={faChevronLeft}
          transform="shrink-4 down-1"
          className="me-1"
        />
        Ir Para O Login
      </Button>
    </>
  );
};

LogoutContent.propTypes = {
  layout: PropTypes.string,
  titleTag: PropTypes.string
};

LogoutContent.defaultProps = {
  layout: 'simple',
  titleTag: 'h4'
};

export default LogoutContent;
