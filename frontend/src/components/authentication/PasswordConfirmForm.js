import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';

const PasswordConfirmForm = ({ hasLabel }) => {
  const [formData, setFormData] = useState({
    new_password: '',
    re_new_password: ''
  });
  const { uid, token } = useParams()
  const [message, setMessage] = useState({non_field_errors:"", new_password:"", re_new_password:""})
  const navigate = useNavigate();

  const SendApi = async (credentials) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/users/reset_password_confirm/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        if (response.status === 400){
          const data = await response.json();
          setMessage({
            new_password: data.new_password ? data.new_password : "",
            re_new_password: data.re_new_password ? data.re_new_password : "",
            non_field: data.non_field_errors ? data.non_field_errors : "",
          })
        }
        else{
          alert("Senha atualizada com sucesso")
          navigate(`${process.env.PUBLIC_URL}/auth/login`);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    SendApi({new_password:formData.new_password, re_new_password: formData.re_new_password, uid:uid, token:token})
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
        <div className="fs-xs text-warning fw-semibold">{message.non_field_errors}</div>
      </Form.Group>

      <Button
        type="submit"
        className="w-100"
        disabled={!formData.new_password || !formData.re_new_password}
      >
        Set password
      </Button>
    </Form>
  );
};

PasswordConfirmForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default PasswordConfirmForm;
