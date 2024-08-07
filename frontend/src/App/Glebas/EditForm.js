import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../Main';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { SelectSearchOptions } from '../../helpers/Data';

const EditForm = ({
  onSubmit: handleSubmit,
  type,
  fieldkey,
  show,
  setShow,
  data,
  pipe
}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({user:user.id});
  const [defaultselected, setdefaultSelected] = useState();
  const inputRef = useRef(null);
  const {config: {theme}} = useAppContext();

  useEffect(() => {
    if (show) {
      switch(fieldkey){
        case 'propriedades':
          setdefaultSelected({...defaultselected, 'propriedades':data})
          break
        case 'cliente':
          setdefaultSelected({...defaultselected, 'cliente':data})
          break
        case 'municipio':
          setdefaultSelected({...defaultselected, 'municipio':data})
          break
        default:
          setdefaultSelected({...defaultselected})
      }
    }
  }, [show]); 

  return (
    <>
    {show &&(
      <div
        className={classNames('rounded-3 transition-none', {
          'bg-100 p-x1': type === 'list',
          'p-3 border bg-white dark__bg-1000 mt-3': type === 'card'
        })}
      >
        <Form
          onSubmit={e => {
          e.preventDefault();
            return handleSubmit(formData);
          }}
        >
          {fieldkey === 'gleba' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Gleba</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              className='mb-1 fs--1 px-2'
              onChange={({target}) => {
                setFormData({...formData, gleba: target.value});
              }
            }/>
          </>)}
          {fieldkey === 'descricao' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Descrição</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} as='textarea' rows={3}
              onChange={({target}) => {
                setFormData({...formData, descricao: target.value});
              }
            } className='mb-1 fs--1'/>
          </>)}
          {fieldkey === 'propriedades' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Propriedades</Form.Label>
            <AsyncSelect ref={inputRef} isMulti defaultValue={defaultselected['propriedades']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'farms/farms', 'nome', 'matricula')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  propriedades: selected.map(s => s.value)
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}
          {fieldkey === 'cliente' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Cliente</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['cliente']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social', 'cpf_cnpj')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  cliente: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}
          {fieldkey === 'municipio' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Município</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['municipio']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/municipios', 'nome_municipio', 'sigla_uf')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  municipio: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}
          <Row className={`gx-2 w-50 ms-0`}>
            <Button
              variant="primary"
              size="sm"
              className="col col-auto me-1 ms-0"
              type="submit"
            >
              <span>Atualizar</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="col col-auto border-400"
              type="button"
              onClick={() =>     
                setShow(prevState => ({
                ...prevState,
                [fieldkey]: false
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

export default EditForm;
