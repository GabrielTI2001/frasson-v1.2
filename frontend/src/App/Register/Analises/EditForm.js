import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { GetRecord, SelectSearchOptions } from '../../../helpers/Data';
import { useDropzone } from 'react-dropzone';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import Flex from '../../../components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
  const [isDragActive, setIsDragActive] = useState();
  const { getRootProps: getRootProps, getInputProps: getInputProps } = useDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFormData({...formData, file: acceptedFiles });
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

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
        case 'fazenda':
          const farm = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'fazenda':farm})
          break
        case 'cliente':
          const cliente = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'cliente':cliente})
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
          {fieldkey === 'fazenda' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Fazenda</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['fazenda']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'farms/farms', 'nome', 'matricula')} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  fazenda: selected.value
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

          {fieldkey === 'data_coleta' && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Data Coleta</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              type='date'
              className='mb-1 fs--1 py-0 px-2 w-50'
              value={formData.data_coleta}
              onChange={({target}) => {
                  setFormData(({...formData, data_coleta: target.value}));
                }
              }
            />
          </>}
          {fieldkey === 'identificacao_amostra' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Identificação Amostra</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.identificacao_amostra} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, identificacao_amostra: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'responsavel' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Responsável Coleta</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.responsavel} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, responsavel: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'laboratorio_analise' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Laboratório Análise</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.laboratorio_analise} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, laboratorio_analise: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'numero_controle' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Número Controle</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.numero_controle} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, numero_controle: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'profundidade' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Profundidade</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              value={formData.profundidade} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, profundidade: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'file' &&
            <div {...getRootProps({className: `dropzone-area py-2 mb-2 container container-fluid ${isDragActive ? 'dropzone-active' : ''}`})}>
              <input {...getInputProps()} />
                <Flex justifyContent="center" alignItems="center">
                  <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-warning' /></span>
                  <p className="fs-9 mb-0 text-700 ms-2">
                    {!formData.file ? 'Arraste o arquivo aqui' : formData.file.length+' Arquivo(s) Selecionado(s)'}
                  </p>
                </Flex>
            </div>
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
