import classNames from 'classnames';
// import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState, useContext} from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import api from '../../context/data';
import { PipeContext } from '../../context/Context';

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
  const [formData, setFormData] = useState({done:false});
  const [msg, setMsg] = useState();
  const inputRef = useRef(null);

  const submitform = () => {
    api.post('/pipeline/fases/', {...formData, pipe:kanbanState.pipe.id})
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
            <Row className="gx-2">
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
                  onClick={() => setShowForm(false)}
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
