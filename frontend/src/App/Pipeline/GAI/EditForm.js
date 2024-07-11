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
      if (fieldkey === 'card'){
        inputRef.current.focus();         
      }
      let sel;
      switch(fieldkey){
        case 'beneficiario':
          const ids = data.map(b => ({value: b.id, label: b.razao_social, cpf_cnpj: b.cpf_cnpj}));
          setdefaultSelected({...defaultselected, 'beneficiario':ids})
          break
        case 'detalhamento':
          sel = {value: data.id, label: data.detalhamento_servico, produto: data.produto};
          setdefaultSelected({...defaultselected, 'detalhamento':sel})
          break
        case 'instituicao':
          sel = {value: data.id, label: data.razao_social, identificacao: data.identificacao};
          setdefaultSelected({...defaultselected, 'instituicao':sel})
          break
        case 'contrato':
          sel = data ? {value: data.id, label: data.contratante, produto: data.produto} : {};
          setdefaultSelected({...defaultselected, 'contrato':sel})
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
          {fieldkey === 'beneficiario' &&( defaultselected &&
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['beneficiario']}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social', 'cpf_cnpj')}
              onChange={(selectedOption) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  beneficiario: selectedOption.value
                }));
              }
              } className='mb-1'/>
          )}
          {fieldkey === 'detalhamento' &&( defaultselected &&
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['detalhamento']}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'register/detalhamentos', 'detalhamento_servico', 'produto')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  detalhamento: selected.value
                }));
              }
              } className='mb-1 fs--1'/>
          )}
          {fieldkey === 'instituicao' &&( defaultselected &&
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['instituicao']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'register/instituicoes', 'razao_social', 'identificacao')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  instituicao: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          )}
          {fieldkey === 'contrato' &&( defaultselected &&
            <AsyncSelect ref={inputRef} isMulti={false} defaultValue={defaultselected['contrato']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'finances/contratos-ambiental', 'str_contratante', 'str_produto')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  contrato: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          )}
          <Row className={`gx-2 w-50 ms-2`}>
            <Button
              variant="primary"
              size="sm"
              className="col w-30 fs-xs p-0 me-1"
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
