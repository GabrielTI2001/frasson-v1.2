import classNames from 'classnames';
import React, { useRef, useState, useContext } from 'react';
import { Button, Col, Form, Spinner} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import api from '../../../context/data';
import { PipeContext } from '../../../context/Context';
import { toast } from 'react-toastify';
import { fieldsFluxoGAI } from '../Data';
import RenderFields from '../../../components/Custom/RenderFields';

const ProductForm = ({
  onSubmit,
  type,
  fase
}) => {
  const {config: {theme}} = useAppContext();
  const { kanbanDispatch } = useContext(PipeContext);
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({phase:fase, created_by:user.id});
  const [message, setMessage] = useState();
  const [isLoading, setIsloading] = useState();
  const token = localStorage.getItem("token")

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const submit = async () => {
    setIsloading(true)
    const isEmpty = !Object.keys(formData).length;
    if (!isEmpty) {
      api.post('pipeline/fluxos/gestao-ambiental/', formData, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        kanbanDispatch({
          type: 'ADD_TASK_CARD',
          payload: { targetListId: fase, 
            novocard:{id: response.data.id, card:response.data.card, str_detalhamento:response.data.info_detalhamento.detalhamento_servico,
            str_beneficiario:response.data.list_beneficiario.razao_social, created_at: response.data.created_at, code:response.data.code,
            prioridade:response.data.prioridade, str_instituicao:response.data.info_instituicao.razao_social
          }}
        });
        onSubmit()
        toast.success("Card adicionado com sucesso!")
      })
      .catch((erro) => {
        if(erro.response.status == 400){
          setMessage(erro.response.data)
        }
        console.error('erro: '+erro);
      })
    }
    setIsloading(false)
  };

  return (
    <>
      <div
        className={classNames('rounded-3 transition-none', {
          'bg-100 p-x1': type === 'list',
          'p-3 border bg-white dark__bg-1000 mt-3': type === 'card'
        })}
      >
        <Form className='row row-cols-xl-1 row-cols-sm-1 row-cols-xs-1'
          onSubmit={e => {
            e.preventDefault();
            return submit();
          }}
        >
          <RenderFields fields={fieldsFluxoGAI} formData={formData}
            changefield={handleFieldChange} hasLabel={true} message={message} setform={setFormData}
          />
          <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
            <Button className="w-50" type="submit" disabled={isLoading} >
              {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar'}
            </Button>
          </Form.Group>  
        </Form>
      </div>   
    </>
  );
};

export default ProductForm;
