import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Row, Col, Spinner } from 'react-bootstrap';
const RegistrationForm = ({ hasLabel }) => {
  // State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    re_password: '',
  });
  const [message, setMessage] = useState({email:"", password:"", re_password:""})
  const navigate = useNavigate();
  const [isload, setIsLoad] = useState(false)

  const handleApi = async (credentials) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if(response.status === 400){
          setMessage({...message, email: data.email ? data.email : "", password: data.password ? data.password : "",
            re_password: data.re_password ? data.re_password : ""
          })
          setIsLoad(false)
        }
        else if (response.status === 201){
          toast.success("Registro Efetuado com Sucesso!")
          toast.success("Acesse seu E-mail Para Ativar Sua Conta", {autoClose:4000})
          setIsLoad(false)
          navigate(`${process.env.PUBLIC_URL}/auth/login`);
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
  };

  const handleSubmit = e => {
    setIsLoad(true)
    e.preventDefault();
    if (formData.password === formData.re_password){
      handleApi(formData);
    } 
    else{
      setIsLoad(false)
      setMessage({...message, re_password: "As senhas não coincidem"})
    }

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
        {hasLabel && <Form.Label>Nome</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'Nome' : ''}
          value={formData.first_name}
          name="first_name"
          onChange={handleFieldChange}
          type="text"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Sobrenome</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'Sobrenome' : ''}
          value={formData.last_name}
          name="last_name"
          onChange={handleFieldChange}
          type="text"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Email</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'Email address' : ''}
          value={formData.email}
          name="email"
          onChange={handleFieldChange}
          type="text"
        />
        <div className="fs-xs text-warning fw-semibold">{message.email}</div>
      </Form.Group>
      <Form.Group className="mb-3">
          {hasLabel && <Form.Label>Senha</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Password' : ''}
            value={formData.password}
            name="password"
            onChange={handleFieldChange}
            type="password"
          />
          <div className="fs-xs text-warning fw-semibold">{message.password}</div>
        </Form.Group>
        <Form.Group className="mb-3">
          {hasLabel && <Form.Label>Confirmar Senha</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Confirm Password' : ''}
            value={formData.re_password}
            name="re_password"
            onChange={handleFieldChange}
            type="password"
          />
          <div className="fs-xs text-warning fw-semibold">{message.re_password}</div>
        </Form.Group>
      <Form.Group className="mb-3">
        {isload ? <div className='text-center'><Spinner></Spinner></div> :   
        <Button
          className="w-100"
          type="submit"
          disabled={
            !formData.first_name ||
            !formData.email ||
            !formData.re_password ||
            !formData.password ||
            !formData.last_name 
          }
        >
          Register
        </Button>}
      </Form.Group>
      <Row className="justify-content-center align-items-center">
        <Col xs="auto">
          <label>Já Tem Uma Conta? </label>
          <Link
            className="fs--1 mb-0 mx-1"
            to={'/auth/login'}
          >
            Clique Aqui
          </Link>
          <label> Para Fazer Login</label>
        </Col>
      </Row>
    </Form>
  );
};

RegistrationForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default RegistrationForm;
