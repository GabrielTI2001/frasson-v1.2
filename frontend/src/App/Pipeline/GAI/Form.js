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
  onSubmit, data,
  type,
  fase
}) => {
  const {config: {theme}} = useAppContext();
  const { kanbanDispatch } = useContext(PipeContext);
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({phase:fase, created_by:user.id, prioridade:'Alta', ...data});
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
        onSubmit('add', response.data)
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
        className={classNames('rounded-3 transition-none')}
      >
        <Form className='row row-cols-xl-1 row-cols-sm-1 row-cols-xs-1'
          onSubmit={e => {
            setIsloading(true)
            e.preventDefault();
            return submit();
          }}
        >
          <RenderFields fields={data ? 
              (type === 'gai' ? fieldsFluxoGAI.slice(0, 5) : fieldsFluxoGAI).filter(f => !Object.keys(data).some(k => k === f.name)) 
            : 
              type === 'gai' ? fieldsFluxoGAI.slice(0, 5) : fieldsFluxoGAI} 
            formData={formData}
            changefield={handleFieldChange} hasLabel={true} message={message} setform={setFormData}
          />
          <Form.Group className={`mb-0 mt-3 pb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
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
