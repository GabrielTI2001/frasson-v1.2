import classNames from 'classnames';
import React, { useState, useContext, useEffect } from 'react';
import { Button, Col, Form, Spinner} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import api from '../../../context/data';
import { PipeContext } from '../../../context/Context';
import { toast } from 'react-toastify';
import { fieldsProspect } from '../Data';
import RenderFields from '../../../components/Custom/RenderFields';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import { useNavigate } from 'react-router-dom';
import { SelectOptions } from '../../../helpers/Data';

const ProspectForm = ({
  onSubmit,
  type,
  fase
}) => {
  const {config: {theme}} = useAppContext();
  const { kanbanDispatch } = useContext(PipeContext);
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({phase:fase, classificacao:'Cliente Novo', created_by:user.id});
  const [message, setMessage] = useState();
  const [options, setOptions] = useState();
  const [isLoading, setIsloading] = useState();
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const submit = async () => {
    const isEmpty = !Object.keys(formData).length;
    if (!isEmpty) {
      setIsloading(true)
      api.post('pipeline/fluxos/prospects/', formData, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        kanbanDispatch({
          type: 'ADD_TASK_CARD',
          payload: { targetListId: fase, 
            novocard:{id: response.data.id, str_produto:response.data.info_produto.description, 
              nome:response.data.nome, created_at: response.data.created_at, code: response.data.code,
              list_responsaveis: response.data.list_responsaveis, data_vencimento: response.data.data_vencimento,
          }}
        });
        onSubmit()
        toast.success("Card adicionado com sucesso!")
      })
      .catch((erro) => {
        if(erro.response.status == 400){
          setMessage(erro.response.data)
        }
        if(erro.response.status == 401){
          RedirectToLogin(navigate)
        }
        console.error('erro: '+erro);
      })
      setIsloading(false)
    }
  };

  useEffect(() => {
    const getoptions = async () =>{
      const options = await SelectOptions('register/produtos', 'description', 'acronym')
      setOptions({'produto':options})
    }
    if (!options) getoptions()
  }, [])

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
          <RenderFields fields={fieldsProspect.slice(0, 5)} formData={formData} options={options}
            changefield={handleFieldChange} hasLabel={true} message={message} setform={setFormData}
          />
          <Form.Group className={`mb-0 pb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
            <Button className="w-50" type="submit" disabled={isLoading} >
              {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar'}
            </Button>
          </Form.Group>  
        </Form>
      </div>   
    </>
  );
};

export default ProspectForm;
