import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col, Spinner} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppContext } from '../../Main';
import { HandleSearch, sendData } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const ConfigMoverCard = ({type, submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({fase:card.phase});
    const [isLoading, setIsLoading] = useState(false);
    const [fases, setFases] = useState();

    const handleApi = async (dadosform) => {
        const {resposta, dados} = await sendData({type:type, url:'pipeline/fases', keyfield:type === 'edit' && card.phase, dadosform:dadosform})
        if(resposta.status === 400){
          setMessage({...dados})
        }
        else if (resposta.status === 401){
          RedirectToLogin(navigate)
        }
        else if (resposta.status === 201 || resposta.status === 200){
          type === 'edit' ? submit('edit', dados.list_destinos) : submit('add', dados)
          toast.success("Registro Atualizado com Sucesso!")
        }
        setIsLoading(false)
    };

    const handleSubmit = e => {
        e.preventDefault()
        setIsLoading(true)
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
        <Button type='submit' disabled={isLoading}>
          {isLoading ? <Spinner size='sm' className='p-0 mx-3' style={{height:'12px', width:'12px'}}/> :<span>Salvar</span>}
        </Button>
      </Form.Group>
    </Form>
    );
};
  
export default ConfigMoverCard;
  

