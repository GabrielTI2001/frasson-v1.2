import classNames from 'classnames';
// import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState, useContext} from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import api from '../../context/data';
import { PipeContext } from '../../context/Context';
import { SelectSearchOptions } from '../../helpers/Data';
import { useAppContext } from '../../Main';
import customStyles, { customStylesDark } from '../../components/Custom/SelectStyles';

const AddAnotherFase = ({
  onSubmit: handleSubmit,
  type,
  showForm,
  setShowForm
}) => {
  const {
    kanbanState,
    kanbanDispatch
  } = useContext(PipeContext);
  const [formData, setFormData] = useState({done:false, pipe:kanbanState.pipe.code});
  const [msg, setMsg] = useState();
  const inputRef = useRef(null);
  const token = localStorage.getItem("token")
  const {config: {theme}} = useAppContext();

  const submitform = () => {
    api.post('/pipeline/fases/', {...formData, pipe:kanbanState.pipe.id}, {headers: {Authorization: `Bearer ${token}`}})
    .then((response) => {
      handleSubmit(response.data)
    })
    .catch((erro) => {
      if (erro.response.status === 400){
        setMsg(erro.response.data)
      }
      console.error('erro: '+erro);
    })
  }

  useEffect(() => {
    if (showForm) {
      inputRef.current.focus();
    }
  }, [showForm]);

  return (
    <>
      {showForm && (
        <div
          className={classNames('rounded-3 transition-none', {
            'bg-100 p-x1': type === 'list',
            'p-3 border bg-white dark__bg-1000 mt-3': type === 'card'
          })}
        >
          <Form
            onSubmit={e => {
              setIsloading(true)
              e.preventDefault();
              return submitform();
            }}
          >
            <Form.Control
              as="textarea"
              rows={2}
              className="mb-2"
              ref={inputRef}
              onChange={({ target }) =>
                setFormData({ ...formData, descricao: target.value })
              }
              placeholder={
                type === 'list'
                  ? 'Descrição da fase...'
                  : 'Descrição da fase...'
              }
            />
            <label className='error-msg text-danger'>{msg && msg.descricao}</label>
            <Form.Check
              className="mb-2"
              label="Fase de Conclusão?"
              ref={inputRef}
              onChange={({ target }) =>
                setFormData({ ...formData, done: target.checked ? true : false})
              }
            />
            <label className='error-msg text-danger'>{msg && msg.done}</label>
            <Form.Label className='fw-bold mb-1 fs--1'>Responsáveis*</Form.Label>
            <AsyncSelect
              ref={inputRef} isMulti styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              rows={3}
              loadOptions={(v) => SelectSearchOptions(v, 'users/users', 'first_name', 'last_name', true)}
              onChange={(selectedOptions ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  responsaveis: selectedOptions.map(s => s.value)
                }));
              }} 
              className='mb-1'
            />
            <label className='text-danger fs--2'>{msg ? msg.responsaveis : ''}</label>
            <Form.Control
              className="mb-2"
              type='number'
              ref={inputRef}
              onChange={({ target }) =>
                setFormData({ ...formData, dias_prazo: target.value })
              }
              placeholder='Dias Prazo'
            />
            <label className='error-msg text-danger'>{msg && msg.dias_prazo}</label>
            <Row className="gx-2 gy-2">
              <Col>
                <Button
                  variant="primary"
                  size="sm"
                  className="d-block w-100"
                  type="submit"
                >
                  Add
                </Button>
              </Col>
              <Col>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-block w-100 border-400"
                  type="button"
                  onClick={() => {setShowForm(false); setMsg(null)}}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </>
  );
};

// AddAnotherFase.propTypes = {
//   onSubmit: PropTypes.func,
//   type: PropTypes.string,
//   showForm: PropTypes.bool,
//   setShowForm: PropTypes.func
// };

export default AddAnotherFase;
