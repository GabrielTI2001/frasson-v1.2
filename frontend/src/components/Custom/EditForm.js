import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../Main';
import customStyles, {customStylesDark} from './SelectStyles';
import { SelectSearchOptions } from '../../helpers/Data';
import { useNavigate } from 'react-router-dom';

const EditFormModal = ({
  onSubmit: handleSubmit,
  show,
  setShow,
  record, field
}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({user:user.id});
  const [defaultselected, setdefaultSelected] = useState();
  const inputRef = useRef(null);
  const {config: {theme}} = useAppContext();
  const navigate = useNavigate()

  useEffect(() => {
    if (show) {
      if (field.type === 'select2'){
        const option = field.ismulti ? record[field.list].map(d => ({value:d.value, label:[field.string]})) 
        : {value: record[field.name], label: field.string ? record[field.string] : record[field.data] && record[field.data][field.attr_data]}
        setdefaultSelected({...defaultselected, [field.name]:option})
      }
    }
  }, [show]); 

  return (
    <>
    {show &&(
      <div
        className={classNames('rounded-3 transition-none')}
      >
        <Form
          onSubmit={e => {
          e.preventDefault();
            return handleSubmit(formData);
          }}
        >
          {field.type === 'select2' ? ( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>{field.label.replace('*', '')}</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected[field.name]} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select" ismulti={field.ismulti}
              loadOptions={(value) => SelectSearchOptions(value, field.url, field.attr1, field.attr2, false, null, navigate)} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  [field.name]: field.ismulti ? selected.map(s => s.value) : selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)
          : field.type === 'select' ?
          (<>
            <Form.Label className='mb-0 fw-bold fs--1'>{field.label.replace('*', '')}</Form.Label>
            <Form.Select ref={inputRef} defaultValue={record[field.name] || ''}
              value={formData[field.name]} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, [field.name]: target.value}));
              }
            }>
              {Object.keys(field.options).map(key => 
                  <option value={key} key={key}>{field.options[key]}</option>
              )}
            </Form.Select>
          </>)
          : field.type === 'file' ? <>
            <Form.Label className='mb-0 fw-bold fs--1'>{field.label.replace('*', '')}</Form.Label>
            <Form.Control
                name={field.name}
                className='mb-2'
                onChange={() => {}}
                type="file"
            />
            </>
          : 
          <>
            <Form.Label className='mb-0 fw-bold fs--1'>{field.label.replace('*', '')}</Form.Label>
            <Form.Control ref={inputRef} defaultValue={record[field.name] || ''} type={field.type}
              value={formData[field.name]} className={`mb-1 fs--1 py-0 w-${field.xl === 3 ? '50' : '100'}`} 
              as={field.type === 'textarea' ? 'textarea' : 'input'}
              onChange={({target}) => {
                setFormData(({...formData, [field.name]: target.value}));
              }
            }/>
          </>
          }

          <Row className={`gx-2 w-50 ms-0`}>
            <Button
              variant="primary"
              size="sm"
              className="col w-30 fs-xs p-0 me-1 ms-0"
              type="submit"
            >
              <span>Atualizar</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="col w-30 fs-xs p-0 border-400"
              type="button"
              onClick={() =>     
                setShow(prevState => ({
                ...prevState,
                [field.name]: false
              }))}
            >
              <span>Cancelar</span>
            </Button>
          </Row>  
        </Form>
      </div>   
    )}
    </>
  );
};

export default EditFormModal;
