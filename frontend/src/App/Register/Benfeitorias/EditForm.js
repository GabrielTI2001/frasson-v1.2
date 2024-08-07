import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { GetRecord, SelectSearchOptions } from '../../../helpers/Data';

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
  const [tipos, setTipos] = useState()

  useEffect(() => {
    const gettypes = async () =>{
      if(!tipos){
        const types = await GetRecord('', 'register/types-farm-assets');
        setTipos(types)
      }
    }
    if (show) {
      if (fieldkey === 'type'){
        gettypes()
      }
      switch(fieldkey){
        case 'farm':
          const farm = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'farm':farm})
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
          {fieldkey === 'farm' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Fazenda</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['farm']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'farms/farms', 'nome', 'matricula')} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  farm: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}

          {fieldkey === 'type' && tipos &&(<>
            <Form.Label className='fw-bold mb-1'>Tipo de Benfeitoria*</Form.Label>
            <Form.Select
              defaultValue={data || ''}
              className='mb-1 fs--1'
              onChange={({target}) => {
                setFormData(({...formData, type: target.value}));
              }}
            >
              <option value={undefined}>----</option>
              {tipos &&( tipos.map( c =>(
                <option key={c.id} value={c.id}>{c.description}</option>
              )))}
            </Form.Select>
          </>)
          }
          {fieldkey === 'data_construcao' && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Data Construção</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              type='date'
              className='mb-1 fs--1 px-2'
              onChange={({target}) => {
                  setFormData(({...formData, data_construcao: target.value}));
                }
              }
            />
          </>}
          {fieldkey === 'tamanho' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Tamanho</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              className='mb-1 fs--1 px-2'
              onChange={({target}) => {
                setFormData(({...formData, tamanho: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'valor_estimado' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Valor Estimado</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              className='mb-1 fs--1 px-2'
              onChange={({target}) => {
                setFormData(({...formData, valor_estimado: target.value}));
              }
            }/>
          </>)
          }

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
