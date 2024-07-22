import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { SelectSearchOptions } from '../../../helpers/Data';

const EditForm = ({
  onSubmit: handleSubmit,
  type,
  fieldkey,
  show,
  setShow,
  data
}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({user:user.id});
  const [defaultselected, setdefaultSelected] = useState();
  const inputRef = useRef(null);
  const {config: {theme}} = useAppContext();

  useEffect(() => {
    if (show) {
      switch(fieldkey){
        case 'municipio':
          const municipio = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'municipio':municipio})
          break
        case 'grupo':
          const grupo = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'grupo':grupo})
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

          {fieldkey === 'cpf_cnpj' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>CPF/CNPJ</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.cpf_cnpj} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, cpf_cnpj: target.value}));
              }
            }/>
          </>)
          }

          {fieldkey === 'numero_rg' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>RG</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.numero_rg} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, numero_rg: target.value}));
              }
            }/>
          </>)
          }

          {fieldkey === 'logradouro' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Logradouro</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.logradouro} className='mb-1 fs--1 py-0 w-100'
              onChange={({target}) => {
                setFormData(({...formData, logradouro: target.value}));
              }
            }/>
          </>)
          }

          {fieldkey === 'cep_logradouro' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>CEP</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.cep_logradouro} className='mb-1 fs--1 py-0 w-100'
              onChange={({target}) => {
                setFormData(({...formData, cep_logradouro: target.value}));
              }
            }/>
          </>)
          }

          {fieldkey === 'municipio' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Município</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['municipio']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/municipios', 'nome_municipio', 'sigla_uf')} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  contratante: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}

          {fieldkey === 'data_nascimento' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Data Nascimento</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              type='date'
              className='mb-1 fs--1 py-0 w-50'
              value={formData.data_nascimento}
              onChange={({target}) => {
                  setFormData(({...formData, data_nascimento: target.value}));
                }
              }
            />
          </>)}

          {fieldkey === 'grupo' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Grupo</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['grupo']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/grupos-clientes', 'nome_grupo')} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  grupo: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}

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
