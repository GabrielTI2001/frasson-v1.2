import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Spinner } from 'react-bootstrap';
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
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const {config: {theme}} = useAppContext();

  useEffect(() => {
    if (show) {
      setIsLoading(false)
      switch(fieldkey){
        case 'responsaveis':
          const ids_resps = data.map(b => ({value: b.id, label: b.nome}));
          setdefaultSelected({...defaultselected, 'responsaveis':ids_resps})
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
            setIsLoading(true);
            e.preventDefault();
            return handleSubmit(formData);
          }}
        >
          {fieldkey === 'atividade' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Atividade</Form.Label>
            <Form.Select
              ref={inputRef}
              rows={2}
              className="mb-2 shadow-none outline-none"
              onChange={({ target }) =>
                setFormData({ ...formData, atividade: target.value })
              }
              defaultValue={data || ''}
            >
              <option value={undefined}>----</option>
              <option value='AC'>Ação com Cliente</option>
              <option value='AT'>Ação com Terceiros</option>
              <option value='ET'>Entrega Técnica</option>
              <option value='LLC'>LITEC - Levantamento de Campo</option>
              <option value='LPT'>LITEC - PTC</option>
              <option value='LNT'>LITEC - NT</option>
              <option value='FB'>Feedback</option>
              <option value='RC'>Renovação de Contrato</option>
              <option value='ND'>Novas Demandas</option>
              <option value='MT'>Make Time</option>
              <option value='FOC'>Formalização Operação de Crédito</option>
              <option value='OF'>Outras Frentes</option>
            </Form.Select>  
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
              type="submit" disabled={isLoading}
            >
              {isLoading ? <Spinner size='sm' className='p-0 mx-3' style={{height:'12px', width:'12px'}}/> :<span>Atualizar</span>}
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
