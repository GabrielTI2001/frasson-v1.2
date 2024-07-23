import PropTypes from 'prop-types';
import React, { useState} from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {Spinner} from 'react-bootstrap';

const LoginForm = ({ hasLabel=false, layout='simple'}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState("")
  const navigate = useNavigate();
  const [isload, setIsLoad] = useState(false)
  const [searchParams] = useSearchParams();

  const handleLogin = async (credentials) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        if (response.status === 401){
          setMessage("E-Mail ou Senha Incorretos")
          setIsLoad(false)
        }
        else if (response.status === 200){
          const data = await response.json();
          toast.success("Login Efetuado com Sucesso!")
          setIsLoad(false)
          localStorage.setItem("login", JSON.stringify(true));
          localStorage.setItem('token', data.access);
          localStorage.setItem('user', JSON.stringify({id:data.user.id, is_superuser:data.user.is_superuser, 
            permissions: data.user.permissions}));
          if (searchParams.get('next')){
            setIsLoad(true)
            navigate(`${searchParams.get('next')}`);
          }
          else{
            navigate(`${process.env.PUBLIC_URL}/home`);
          }

        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
  };


  // Handler
  const handleSubmit = e => {
    setMessage("")
    setIsLoad(true)
    e.preventDefault();
    handleLogin(formData);
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Email address</Form.Label>}
        <Form.Control
          className='fs--1'
          placeholder={!hasLabel ? 'Email address' : ''}
          value={formData.email}
          name="email"
          onChange={handleFieldChange}
          type="email"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Password</Form.Label>}
        <Form.Control
          className='fs--1'
          placeholder={!hasLabel ? 'Password' : ''}
          value={formData.password}
          name="password"
          onChange={handleFieldChange}
          type="password"
        />
      </Form.Group>

      <Row className="justify-content-between align-items-center">
        <Col xs="auto">
          <Link
            className="fs--1 mb-0 text-primary fw-semibold"
            to={'/auth/password/forget'}
          >
            Esqueceu Sua Senha?
          </Link>
        </Col>
      </Row>

      <Form.Group>
        {isload ? <div className='text-center'><Spinner></Spinner></div> :   
        <Button
          type="submit"
          color="primary"
          className="mt-3 w-100 fs--1"
          disabled={!formData.email || !formData.password}
        >
          Log in
        </Button>}
      </Form.Group>
      <div className='text-danger mt-4 text-center'><label>{message}</label></div>
    </Form>
  );
};

LoginForm.propTypes = {
  layout: PropTypes.string,
  hasLabel: PropTypes.bool
};

export default LoginForm;
