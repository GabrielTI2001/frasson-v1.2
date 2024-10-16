import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Spinner } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { SelectSearchOptions } from '../../../helpers/Data';
import ServicoEtapa from './ServicoEtapa';

const EditForm = ({
  onSubmit: handleSubmit,
  type,
  fieldkey,
  show,
  setShow,
  data,
  contrato
}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({user:user.id});
  const [defaultselected, setdefaultSelected] = useState();
  const [servicesSelected, setServicesSelected] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const {config: {theme}} = useAppContext();

  useEffect(() => {
    if (show) {
      setIsLoading(false)
      switch(fieldkey){
        case 'servicos':
          const servs = data.map(b => ({value: b.value, label: b.label}));
          setdefaultSelected({...defaultselected, 'servicos':servs})
          setServicesSelected(servs)
          break
        case 'contratante':
          const cliente = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'contratante':cliente})
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
            setIsLoading(true)
            handleSubmit(formData);
            setIsLoading(false)
          }}
        >

          {fieldkey === 'detalhes' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Detalhes da Negociação</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} 
              as='textarea' rows={5}
              onChange={({target}) => {
                setFormData(({...formData, detalhes: target.value}));
              }
            } className='mb-1 fs--1 px-2'/>
          </>)}

          {fieldkey === 'contratante' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Contratante</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['contratante']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social', 'cpf_cnpj')} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  contratante: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}

          {fieldkey === 'servicos' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Serviços</Form.Label>
            <AsyncSelect ref={inputRef} isMulti defaultValue={defaultselected['servicos']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/detalhamentos', 'detalhamento_servico', null, false, 'produto=GAI')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  servicos: selected.map(s => s.value)
                }));
                setServicesSelected(selected)
              }
            } className='mb-1 fs--1'/>
            <ServicoEtapa servicos={servicesSelected} valor_contrato={contrato && contrato.valor} 
              change={(data) => setFormData({...formData, servicos_etapas:data, 
                servicos:data.map(d => d.servico)
              })} etapas_current={contrato && contrato.etapas}
            />

          </>)}

          {fieldkey === 'data_assinatura' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Data Assinatura</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              type='date'
              className='mb-1 fs--1 px-2'
              onChange={({target}) => {
                  setFormData(({...formData, data_assinatura: target.value}));
                }
              }
            />
          </>)}

          <Row className={`gx-2 w-50 ms-0`}>
            <Button
              variant="primary"
              size="sm"
              className="col-auto me-1 ms-0"
              type="submit" disabled={isLoading}
            >
              {isLoading ? <Spinner size='sm' className='p-0 mx-3' style={{height:'12px', width:'12px'}}/> :<span>Atualizar</span>}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="col-auto border-400"
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
