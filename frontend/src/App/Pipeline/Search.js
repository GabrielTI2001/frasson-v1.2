import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../Main';
import api from '../../context/data';
import { PipeContext } from '../../context/Context';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, prefix } from '@fortawesome/free-solid-svg-icons';

const SearchForm = ({
  onSubmit,
  type,
  fase
}) => {
  const {config: {theme}} = useAppContext();
  const {kanbanState, kanbanDispatch} = useContext(PipeContext);
  const [formData, setFormData] = useState();
  const [message, setMessage] = useState();
  const inputRef = useRef(null);
  const token = localStorage.getItem("token")
  const [prevstate, setPrevState] = useState()

  const submit = async (value) => {
    setFormData(value)
    if (value !== ''){
      kanbanDispatch({
        type: 'FILTER_CARD',
        payload: {value:value}
      })
    }
    else{
      kanbanDispatch({
        type: 'SET_DATA',
        payload: prevstate
      })
    }
  };

  
  useEffect(() => {
    if(kanbanState && !formData){
      setPrevState(kanbanState)
    }
  }, [kanbanState]);

  return (
    <Form className='row d-flex justify-content-xl-end justify-content-sm-center pe-4'
      onSubmit={e => {
        e.preventDefault();
        return submit();
      }}
    >
      <Form.Group className="" as={Col} xl={6} sm={8} xs={8}>
        <Form.Control
          size='xs'
          type='text'
          placeholder='Procurar Cards'
          className='py-1 rounded-4'
          ref={inputRef}
          onChange={({ target }) => 
            submit(target.value)
          }
          value={formData || ''}
        />
      </Form.Group>
      <Form.Group className="text-end px-0 d-flex align-items-center" as={Col} xl='auto' sm='auto' xs='auto'>
        <FontAwesomeIcon icon={faFilter} className='fs-2 mb-1'/>
      </Form.Group>
    </Form>
  );
};

export default SearchForm;
