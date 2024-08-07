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
          {fieldkey === 'status' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Status</Form.Label>
            <Form.Select
              ref={inputRef}
              className="mb-2 shadow-none outline-none"
              onChange={({ target }) =>
                setFormData({ ...formData, status: target.value })
              }
              defaultValue={data || ''}
            >
              <option value='AD'>Aguardando Distribuição</option>
              <option value='NT'>Notificação</option>
              <option value='FT'>Faturamento</option>
              <option value='AG'>Agendado</option>
              <option value='PG'>Pago</option>
            </Form.Select>  
          </>)}
          {fieldkey === 'data_previsao' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Data Previsão Pagamento</Form.Label>
            <Form.Control
              ref={inputRef}
              type='date'
              className="mb-2 shadow-none outline-none px-2"
              onChange={({ target }) =>
                setFormData({ ...formData, data_previsao: target.value })
              }
              defaultValue={data || ''}
            />
          </>)}
          {fieldkey === 'orientacoes' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Orientações</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} as='textarea' rows={5}
              onChange={({target}) => {
                setFormData(({...formData, orientacoes: target.value}));
              }
            } className='mb-1 fs--1'/>
          </>)}
          {fieldkey === 'responsaveis' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Responsáveis</Form.Label>
            <AsyncSelect ref={inputRef} isMulti defaultValue={defaultselected['responsaveis']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'users/users', 'first_name', 'last_name', true, `pipe=${pipe || ''}`)}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  responsaveis: selected.map(s => s.value)
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
