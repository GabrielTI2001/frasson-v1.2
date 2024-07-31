import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col, Spinner} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { fetchStatus } from '../Data';
import { useAppContext } from '../../../Main';
import { sendData } from '../../../helpers/Data';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormAcomp = ({data, submit}) => {
    const navigate = useNavigate()
    const {config: {theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"))
    const [statuslist, setStatuslist] = useState();
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({user:user.id, processo:data.inema.id});
    const [isLoading, setIsLoading] = useState(false);

    const handleApi = async (dadosform) => {
        const {resposta, dados} = await sendData({type:'add', url:'processes/acompanhamentos', keyfield:null, dadosform:dadosform, is_json:false})
        if(resposta.status === 400){
          setMessage({...dados})
        }
        else if (resposta.status === 401){
            RedirectToLogin(navigate);
        }
        else if (resposta.status === 201 || resposta.status === 200){
            submit('add', {...dados, data: new Date(dados.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}), status:dados.str_status})
            toast.success("Registro Atualizado com Sucesso!")
        }
        setIsLoading(false)
    };
    const handleSubmit = async e => {
        setMessage(null)
        setIsLoading(true)
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
          formDataToSend.append(key, formData[key]);
        }  
        await handleApi(formDataToSend);
    };
    const handleFieldChange = e => {
        setformData({
          ...formData,
          [e.target.name]: e.target.value
        });
    };
    const handleFileChange = (e) => {
        setformData({...formData, [e.target.name]:e.target.files[0]})
    };
    useEffect(() =>{
        const getoptions = async () =>{
            const options = await fetchStatus()
            setStatuslist(options)
        }
        if (!statuslist){
            getoptions()
        }
    },[])

    return (
    <Form onSubmit={handleSubmit} className='row row-cols-1'>
        <Form.Group as={Col} className='mb-3'>
            <Form.Label className='mb-0 fw-bold'>Data*</Form.Label>
            <Form.Control type='date' value={formData.data || ''} 
                onChange={handleFieldChange}
                name='data'
            />
            <label className='text-danger'>{message ? message.data : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col}>
            <Form.Label className='fw-bold mb-1'>Status*</Form.Label>
            <Form.Select
              value={formData.status || ''}
              name="status"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              {statuslist &&( statuslist.map( c =>(
                <option key={c.value} value={c.value}>{c.label}</option>
              )))}
            </Form.Select>
            <label className='text-danger'>{message ? message.status : ''}</label>
        </Form.Group>

        <Form.Group as={Col} className='mb-3'>
            <Form.Label className='fw-bold mb-0'>Arquivo</Form.Label>
            <Form.Control type='file' onChange={handleFileChange} name='file'/>
            <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <Form.Group as={Col} className='mb-3'>
            <Form.Label className='mb-0 fw-bold'>Detalhamento</Form.Label>
            <Form.Control as='textarea' value={formData.detalhamento || ''} 
                onChange={handleFieldChange}
                name='detalhamento'
            />
            <label className='text-danger'>{message ? message.detalhamento : ''}</label>
        </Form.Group>
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Registrar'}
          </Button>
        </Form.Group>  
    </Form>
    );
};
  
export default FormAcomp;
  

