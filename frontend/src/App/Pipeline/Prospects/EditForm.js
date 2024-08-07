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
        case 'cliente':
          const ids = {value: data.id, label: data.razao_social, cpf_cnpj: data.cpf_cnpj}
          setdefaultSelected({...defaultselected, 'cliente':ids})
          break
        case 'produto':
          sel = {value: data.id, label: data.descricao + ' - '+data.sigla};
          setdefaultSelected({...defaultselected, 'produto':sel})
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
          {fieldkey === 'cliente' &&( defaultselected &&
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['cliente']}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social', 'cpf_cnpj')}
              onChange={(selectedOption) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  cliente: selectedOption.value
                }));
              }
              } className='mb-1'/>
          )}
          {fieldkey === 'produto' &&( defaultselected &&
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['produto']}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'register/produtos', 'description', 'acronym')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  produto: selected.value
                }));
              }
              } className='mb-1 fs--1'/>
          )}

          <Row className={`gx-2 w-50 ms-0`}>
            <Button
              variant="primary"
              size="sm"
              className="col col-auto me-1"
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
