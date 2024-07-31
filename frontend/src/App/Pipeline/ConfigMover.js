import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import customStyles, { customStylesDark } from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HandleSearch } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const ConfigMoverCard = ({type, data, submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({fase:card.phase});
    const [fases, setFases] = useState();

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/pipeline/fases/${type === 'edit' ? card.phase+'/' : ''}`
        const method = type === 'edit' ? 'PUT' : 'POST'
        try {
            const response = await fetch(link, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosform)
            });
            const data = await response.json();
            if(response.status === 400){
              setMessage({...data})
            }
            else if (response.status === 401){
              localStorage.setItem("login", JSON.stringify(false));
              localStorage.setItem('token', "");
              RedirectToLogin(navigate);
            }
            else if (response.status === 201 || response.status === 200){
                type === 'edit' ? submit('edit', data.list_destinos) : submit('add', data)
                toast.success("Registro Atualizado com Sucesso!")
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    const handleSubmit = e => {
        e.preventDefault()
        setMessage(null)
        handleApi({...formData, destinos_permitidos:[...formData.destinos_permitidos, card.phase]});
    };
    const handleFieldChange = e => {
      const { name, value, type, checked } = e.target;
      setformData(prevState => {
        let newValue = prevState.destinos_permitidos || [];
        if (checked) {
          newValue = [...newValue, value];
        } 
        else {
          newValue = newValue.filter(f => parseInt(f) !== parseInt(value));
        }
        return {
            ...prevState, destinos_permitidos:newValue
        };
      });
    };

    useEffect(() =>{
      const getdata = async () =>{
        const status = HandleSearch('', 'pipeline/fases', (data) => setFases(data), `?pipe=${card.pipe_code}`)
        if(status === 401){
          RedirectToLogin(navigate)
        }
      }
      if (!fases){getdata()}
      else if (!formData.destinos_permitidos){
        setformData({...formData, destinos_permitidos:fases.filter(f => f.id === card.phase)[0].destinos_permitidos})
      }
    },[fases])

    return (
    <Form onSubmit={handleSubmit} className='row sectionform px-3' encType='multipart/form-data'>
      {fases && formData.destinos_permitidos && fases.map(f => f.id !== card.phase &&
        <Form.Group as={Col} xl={12} className='py-1  border border-1 mb-1 rounded-1' key={f.id}>
          <Form.Check 
            reverse
            type='switch'
            name='destinos_permitidos'
            className='text-justify mb-0'
            id={`fase-${f.id}`}
          >
            <Form.Check.Input className='col-auto fs-0' onChange={handleFieldChange} value={f.id} 
              checked={formData.destinos_permitidos ? formData.destinos_permitidos.some(d => parseInt(d) === f.id) : false}/>
            <Form.Check.Label className='col-auto mb-0'>{f.descricao}</Form.Check.Label>
          </Form.Check>
        </Form.Group>
      )}
      <Form.Group as={Col} className='text-end px-0' xl={12}>
          <Button type='submit'>Salvar</Button>
      </Form.Group>
    </Form>
    );
};
  
export default ConfigMoverCard;
  

