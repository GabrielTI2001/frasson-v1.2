import React, { useContext, useEffect, useState} from "react";
import { Form, Col, Button, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { sendData } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import { fieldsProfile } from "../Data";
import RenderFields from "../../../components/Custom/RenderFields";
import { ProfileContext } from "../../../context/Context";
import CustomBreadcrumb from "../../../components/Custom/Commom";
import Avatar from '../../../components/common/Avatar';

const ProfileForm = ({hasLabel, type}) => {
    const {profileState, profileDispatch} = useContext(ProfileContext)
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState();
    const [message, setMessage] = useState()
    const navigate = useNavigate();
    
    const handleApi = async (dadosform) => {
      const {resposta, dados} = await sendData({type:'edit', url:'users/profile', keyfield: profileState.perfil && profileState.perfil.user, 
        dadosform:dadosform, is_json:false
      })
      if(resposta.status === 400){
        setMessage({...dados})
      }
      else if (resposta.status === 401){
        RedirectToLogin(navigate)
      }
      else if (resposta.status === 201 || resposta.status === 200){
        profileDispatch({type: 'SET_PROFILE', payload:dados});
        toast.success("Registro Atualizado com Sucesso!")
      }
      setIsLoading(false)
    };

    const handleSubmit = e => {
        setMessage(null)
        setIsLoading(true)
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
          formData[key] && formDataToSend.append(key, formData[key]);
        }  
        handleApi(formDataToSend);
    };

    const FileChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.files[0]
        });
    };
    
    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
      if (profileState){
        const {avatar, ...rest} = profileState.perfil;
        setFormData({...rest})
      }
      else{
        RedirectToLogin(navigate)
      }

    }, [profileState])

    return (profileState && 
    <>
      <CustomBreadcrumb>
        <span className="breadcrumb-item fw-bold" aria-current="page">
          Usuário
        </span>   
        <span className="breadcrumb-item fw-bold" aria-current="page">
          {profileState.perfil.first_name} {profileState.perfil.last_name}
        </span> 
        <span className="breadcrumb-item fw-bold" aria-current="page">
          Editar Perfil
        </span>   
      </CustomBreadcrumb>
      <Row className="gx-3">
        <Col xl='auto'>
          <Avatar src={`${profileState.perfil && profileState.perfil.avatar}`} size={'3xl'}/>
        </Col>
        <Col className="d-flex flex-column justify-content-center">
          {profileState && <h5 className="fw-bold fs-0">{profileState.perfil.first_name} {profileState.perfil.last_name}</h5>}
          <h6 className="text-700">{profileState && (profileState.perfil.job_function || profileState.perfil.email)}</h6>
        </Col>
      </Row>
      <hr></hr>
      <Form onSubmit={handleSubmit} className='row'>
        {formData && 
          <RenderFields fields={fieldsProfile} formData={formData} changefield={handleFieldChange}
            hasLabel={hasLabel} message={message} type={type} changefile={FileChange}
          />
        }
        <Form.Group as={Col} xl='12' className={`mb-0`}>
          <Button className="w-40" variant="success" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size='sm' className='p-0 mx-3' style={{height:'12px', width:'12px'}}/> :<span>Atualizar Informações</span>}
          </Button>
        </Form.Group>  
      </Form>
      <hr></hr>
      <Link to={'/auth/password/change'} className="btn btn-primary fs--2">Redefinir Senha</Link>
    </>
  );
}

export default ProfileForm;