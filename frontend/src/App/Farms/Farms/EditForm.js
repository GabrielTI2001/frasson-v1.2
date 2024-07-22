import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { SelectSearchOptions } from '../../../helpers/Data';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate()

  useEffect(() => {
    if (show) {
      switch(fieldkey){
        case 'municipio':
          const municipio = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'municipio':municipio})
          break
        case 'municipio':
          const cartorio = {value: data.value, label: data.label};
          setdefaultSelected({...defaultselected, 'cartorio':cartorio})
          break
        case 'proprietarios':
          const proprietarios = data.map(d =>({value: d.id, label: d.razao_social})) 
          setdefaultSelected({...defaultselected, 'proprietarios':proprietarios})
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

          {fieldkey === 'nome' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Nome da Fazenda</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.nome} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, nome: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'matricula' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Matrícula</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.matricula} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, matricula: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'area_total' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Área Total (ha)</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              value={formData.area_total} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, area_total: target.value}));
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
          {fieldkey === 'proprietarios' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Proprietários</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['proprietarios']} isMulti
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social', 'cpf_cnpj', false, null, navigate)} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  proprietarios: selected.map(s => s.value)
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}
          {fieldkey === 'cartorio_registro' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Cartório</Form.Label>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected['cartorio_registro']} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(value) => SelectSearchOptions(value, 'register/cartorios', 'razao_social')} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  cartorio_registro: selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)}

          {fieldkey === 'livro_registro' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Livro Registro</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.livro_registro} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, livro_registro: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'numero_registro' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Número Registro</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.numero_registro} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, numero_registro: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'cns' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>CNS</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.cns} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, cns: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'cep' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>CEP</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.cep} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, cep: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'endereco' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Endereço</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.endereco} className='mb-1 fs--1 py-0 w-100'
              onChange={({target}) => {
                setFormData(({...formData, endereco: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'titulo_posse' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Título Posse</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.titulo_posse} className='mb-1 fs--1 py-0 w-100'
              onChange={({target}) => {
                setFormData(({...formData, titulo_posse: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'codigo_car' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>N° CAR</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.codigo_car} className='mb-1 fs--1 py-0 w-100'
              onChange={({target}) => {
                setFormData(({...formData, codigo_car: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'codigo_imovel' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Código Imóvel</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.codigo_imovel} className='mb-1 fs--1 py-0 w-100'
              onChange={({target}) => {
                setFormData(({...formData, codigo_imovel: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'numero_nirf' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>N° NIRF</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              value={formData.numero_nirf} className='mb-1 fs--1 py-0 w-100'
              onChange={({target}) => {
                setFormData(({...formData, numero_nirf: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'roteiro_acesso' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Roteiro Acesso</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} as='textarea' rows={3}
              value={formData.roteiro_acesso} className='mb-1 fs--1 py-0 px-1 w-100'
              onChange={({target}) => {
                setFormData(({...formData, roteiro_acesso: target.value}));
              }
            }/>
          </>)
          }
          
          {fieldkey === 'localizacao_reserva' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Localização Reserva</Form.Label>
            <Form.Select ref={inputRef} defaultValue={data || ''}
              value={formData.localizacao_reserva} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, localizacao_reserva: target.value}));
              }
            }>
              <option value='AM'>Mesma Matrícula</option>
              <option value='AE'>Área Externa</option>
              <option value='AP'>Área Externa Parcial</option>
            </Form.Select>
          </>)
          }

          {fieldkey === 'area_veg_nat' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Área Veg. Nativa (ha)</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              value={formData.area_veg_nat} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, area_veg_nat: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'area_app' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Área APP (ha)</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              value={formData.area_app} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, area_app: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'area_reserva' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Área RL (ha)</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              value={formData.area_reserva} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, area_reserva: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'area_explorada' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Área Explorada (ha)</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              value={formData.area_explorada} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, area_explorada: target.value}));
              }
            }/>
          </>)
          }
          {fieldkey === 'modulos_fiscais' &&(<>
            <Form.Label className='mb-0 fw-bold fs--1'>Módulos Fiscais</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''} type='number'
              value={formData.modulos_fiscais} className='mb-1 fs--1 py-0 w-50'
              onChange={({target}) => {
                setFormData(({...formData, modulos_fiscais: target.value}));
              }
            }/>
          </>)
          }
          
          {fieldkey === 'data_registro' &&( defaultselected && <>
            <Form.Label className='mb-0 fw-bold fs--1'>Data Registro</Form.Label>
            <Form.Control ref={inputRef} defaultValue={data || ''}
              type='date'
              className='mb-1 fs--1 py-0 w-50'
              value={formData.data_registro}
              onChange={({target}) => {
                  setFormData(({...formData, data_registro: target.value}));
                }
              }
            />
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
