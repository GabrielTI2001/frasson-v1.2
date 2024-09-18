import React, { useState } from 'react';
import { Button, Form, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import { sendData } from '../../../helpers/Data';
import { toast } from 'react-toastify';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { useNavigate } from 'react-router-dom';
import {CardTitle} from '../CardInfo';
import { fieldsProcesso } from './Form';
import EditFormModal from '../../../components/Custom/EditForm';
import RenderFields from '../../../components/Custom/RenderFields';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const IndexProtocolo = ({card, updatedactivity, currentacomp, setter}) => {
  const {config: {theme, isRTL}} = useAppContext();
  const [modaldel, setModaldel] = useState({show:false})
  const [message, setMessage] = useState()
  const user = JSON.parse(localStorage.getItem("user"))
  const [showForm, setShowForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setformData] = useState({created_by:user.id, processo:card.id});
  const navigate = useNavigate()

  const submit = (type, data) => {
    setter(data)
  }

  const handleFieldChange = e => {
    setformData({
      ...formData,
      [e.target.name]: e.target.value
    })
  };

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleApi = async (dadosform, type) => {
    const {resposta, dados} = await sendData({type:type, url:'processes/followup', 
      keyfield:type == 'add' ? null : currentacomp && currentacomp.id, dadosform:dadosform})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      submit(type, dados)
      toast.success("Registro Adicionado com Sucesso!")
    }
    setShowForm({})
    setIsLoading(false)
  };

  const handledelete = (type, data) =>{
    setter({inema:{}})
  }

  return (
    <>
      <div className='row mx-0 mb-0 gx-0'>
        <h5 className="col-auto mb-0 fs-0 fw-bold p-2 ps-0">Processo Em Andamento</h5>
      </div>
      <Row className='mt-2 mb-2 gx-0' xs={1}>
        <CardTitle title={'Próxima Consulta'}/>
        {currentacomp && currentacomp.id ? <>
          <div className="fs--1 row-10">{currentacomp.inema.proxima_consulta 
            ? new Date(currentacomp.inema.proxima_consulta).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
          </div>
          {fieldsProcesso.map(f => 
            !showForm[f.name] ?
              <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                {f.type === 'date' ? 
                  <div className="fs--1 row-10">{currentacomp[f.name] ? new Date(currentacomp[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
                : 
                  <div className="fs--1 row-10">{f.isnumber
                    ? currentacomp[f.name] ? Number(currentacomp[f.name]).toLocaleString('pt-br', {minimumFractionDigits:2}) : '-'
                : currentacomp[f.name] || '-'}</div>}
              </div>
              :
              <EditFormModal key={f.name}
                onSubmit={(formData) => handleApi(formData, 'edit')} 
                show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                record={currentacomp} field={f}
              />
          )}
          <div>
            {((user.permissions && currentacomp && user.permissions.indexOf("delete_processos_andamento") !== -1) | user.is_superuser) ?
              <Button className='col-auto btn-danger btn-sm px-2' style={{fontSize:'10px'}} 
                  onClick={() => setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/processes/followup/${currentacomp.id}/`})}>
                  <FontAwesomeIcon icon={faTrash} className='me-2' />Excluir Acompanhamento
              </Button> : null
            }
          </div>
          </>
          : 
          <>
            <span className='text-danger fw-bold'>Esta demanda não possui processo de acompanhamento vinculado... Por favor faça o registro!</span>
            <hr className='my-2'></hr>
            <Form
              onSubmit={e => { e.preventDefault(); handleApi(formData);}}
            >
              <RenderFields fields={fieldsProcesso} formData={formData}
                changefield={handleFieldChange} hasLabel={true} message={message} setform={setformData}
              />
              <Form.Group className={`mb-0 text-end ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
                <Button className="w-50" type="submit" disabled={isLoading} >
                  {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar'}
                </Button>
              </Form.Group>  
            </Form> 
          </>}
      </Row>
      <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default IndexProtocolo;
