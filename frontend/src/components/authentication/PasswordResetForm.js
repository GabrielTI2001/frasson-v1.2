import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

const PasswordResetForm = ({ hasLabel }) => {
  // State
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    re_new_password: ''
  });

  const token = localStorage.getItem("token")

  const [message, setMessage] = useState({current_password:"", new_password:"", re_new_password:""})
  const navigate = useNavigate();

  const SendApi = async (credentials) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/users/set_password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(credentials)
        });
        if (response.status === 400){
          const data = await response.json();
          setMessage({current_password: data.current_password ? data.current_password : "",
            new_password: data.new_password ? data.new_password : "",
            re_new_password: data.re_new_password ? data.re_new_password : "",
          })
        }
        else if (response.status === 401){
          localStorage.setItem("login", JSON.stringify(false));
          localStorage.setItem('token', "");
          navigate(`${process.env.PUBLIC_URL}/auth/login`);
        }
        else{
          alert("Senha atualizada com sucesso")
          navigate(`${process.env.PUBLIC_URL}/auth/login`);
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    SendApi(formData)
    toast.success('Login with your new password', {
      theme: 'colored'
    });
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Form
      className={classNames('mt-3', { 'text-left': hasLabel })}
      onSubmit={handleSubmit}
    >
      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Senha Atual</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'Current Password' : ''}
          value={formData.current_password}
          name="current_password"
          onChange={handleFieldChange}
          type="password"
        />
        <div className="fs-xs text-warning fw-semibold">{message.current_password}</div>
      </Form.Group>
      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Nova Senha</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'New Password' : ''}
          value={formData.new_password}
          name="new_password"
          onChange={handleFieldChange}
          type="password"
        />
        <div className="fs-xs text-warning fw-semibold">{message.new_password}</div>
      </Form.Group>

      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Confirme A Senha</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'Confirm Password' : ''}
          value={formData.re_new_Password}
          name="re_new_password"
          onChange={handleFieldChange}
          type="password"
        />
        <div className="fs-xs text-warning fw-semibold">{message.re_new_password}</div>
      </Form.Group>

      <Button
        type="submit"
        className="w-100"
        disabled={!formData.current_password || !formData.new_password || !formData.re_new_password}
      >
        Alterar Senha
      </Button>
    </Form>
  );
};

PasswordResetForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default PasswordResetForm;
