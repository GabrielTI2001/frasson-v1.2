import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { SelectSearchOptions } from '../../../helpers/Data';

const EditFormOthers = ({
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
    const ids_resps = data.responsaveis.map(b => ({value: b.id, label: b.nome}));
    setdefaultSelected({...defaultselected, 'responsaveis':ids_resps})
  }, []); 

  return (
    <>
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
          <>
          {defaultselected &&
              <Form.Group>
                <Form.Label className='my-0'>Responsáveis</Form.Label>
                <AsyncSelect ref={inputRef} isMulti defaultValue={defaultselected['responsaveis']}
                  styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                  loadOptions={(v) => SelectSearchOptions(v, 'users/users', 'first_name', 'last_name', true)}
                  onChange={(selectedOptions ) => {
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      responsaveis: selectedOptions.map(s => s.value)
                    }));
                  }
                } className='mb-1'/>
              </Form.Group>
            }
            <Form.Group>
              <Form.Label className='my-0'>Data de Vencimento</Form.Label>
              <Form.Control
                ref={inputRef}
                type='date'
                className="mb-2 w-50 fs-xs py-0 px-1 shadow-none outline-none"
                onChange={({ target }) =>
                  setFormData({ ...formData, data_vencimento: target.value })
                }
                value={formData.data_vencimento || data.data_vencimento.slice(0, 10)}
              /> 
            </Form.Group> 
            <Form.Group>
              <Form.Label className='my-0'>Prioridade</Form.Label>
              <Form.Select
                ref={inputRef}
                rows={2}
                className="mb-2 w-50 fs-xs py-0 px-1 shadow-none outline-none"
                onChange={({ target }) =>
                  setFormData({ ...formData, prioridade: target.value })
                }
                defaultValue={data.prioridade}
                value={formData.prioridade}
              >
                <option>---</option>
                <option value='Alta'>Alta</option>
                <option value='Media'>Média</option>
                <option value='Baixa'>Baixa</option>
              </Form.Select> 
            </Form.Group>
          </>
          <Row className={`gx-2 text-end d-flex justify-content-end`}>
            <Button
              variant="primary"
              size="sm"
              className="col-6 w-30 fs-xs p-0 me-1"
              type="submit"
            >
              <span>Atualizar</span>
            </Button>
          </Row>  
        </Form>
      </div>   
    </>
  );
};

export default EditFormOthers;
