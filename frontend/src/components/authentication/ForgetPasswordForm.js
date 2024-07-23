import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form } from 'react-bootstrap';

const ForgetPasswordForm = ({layout='simple'}) => {
  // State
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const Api = async (credentials) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/users/reset_password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        if (response.status === 400){
          const data = await response.json();
          setMessage(data.email)
        }
        else{
          alert("Email enviado com sucesso")
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  }

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    Api({"email": email})
    if (email) {
      toast.success(`An email is sent to ${email} with password reset link`, {
        theme: 'colored'
      });
    }
  };

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Control
          placeholder={'Email'}
          value={email}
          name="email"
          onChange={({ target }) => setEmail(target.value)}
          type="email"
        />
        <div className='text-danger'>{message}</div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Button className="w-100" type="submit" disabled={!email}>
          Enviar Link de Redefinição
        </Button>
      </Form.Group>
    </Form>
  );
};

ForgetPasswordForm.propTypes = {
  layout: PropTypes.string
};

export default ForgetPasswordForm;
