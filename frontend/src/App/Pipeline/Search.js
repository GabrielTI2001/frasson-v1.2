import React, { useEffect, useRef, useState, useContext } from 'react';
import { Col, Form} from 'react-bootstrap';
import { PipeContext } from '../../context/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

const SearchForm = () => {
  const {kanbanState, kanbanDispatch} = useContext(PipeContext);
  const [formData, setFormData] = useState();
  const inputRef = useRef(null);
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
