import React, { useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Row, Col, Spinner} from 'react-bootstrap';
import { RetrieveRecord, SelectOptions, sendData } from '../../helpers/Data';
import { useAppContext } from '../../Main';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const IndicatorForm = ({ hasLabel=true, type, data, submit, pk}) => {
  const [formData, setFormData] = useState({});
  const {config: {theme}} = useAppContext();
  const [users, setUsers] = useState();
  const [message, setMessage] = useState();
  const [indicators, setIndicators] = useState();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'kpi/metas', keyfield:type === 'edit' ? data.id : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage(dados)
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        toast.success("Registro Atualizado com Sucesso!")
        submit('edit', dados)
      }
      else{
        toast.success("Registro Adicionado com Sucesso!")
        submit('add', dados)
      }
    }
    setIsLoading(false)
  };

  const handleSubmit = e => {
    setIsLoading(true)
    setMessage(null)
    e.preventDefault();
    handleApi(formData);
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = () => {
      if (!data){
        RetrieveRecord(pk, 'kpi/metas', (data) => setFormData(data))
      }
      else{
        setFormData({...formData, ...data})
      }
    }
    const loadUsers = async () => {
      const options = await SelectOptions('users/users', 'first_name')
      Array.isArray(options) ? setUsers(options) : RedirectToLogin(navigate)
      const options2 = await SelectOptions('kpi/indicators', 'description', null, 'uuid')
      Array.isArray(options2) ? setIndicators(options2) : RedirectToLogin(navigate)
    }
    if (type === 'edit'){
      if(!formData.year){   
        loadFormData()
      }
    }
    if(!users) loadUsers()

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Indicador*</Form.Label>}
          <Form.Select
            value={formData.indicator || ''}
            name="indicator"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {indicators &&( indicators.map( u =>(
              <option key={u.value} value={u.value}>{u.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message && (message.indicator)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Ano*</Form.Label>}
          <Form.Control
            value={formData.year || ''}
            name="year"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message && (message.year)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Responsável*</Form.Label>}
          <Form.Select
            value={formData.assignee || ''}
            name="assignee"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {users &&( users.map( u =>(
              <option key={u.value} value={u.value}>{u.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message && (message.assignee)}</label>
        </Form.Group>

        <Row className='px-0 mx-auto'>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Janeiro*</Form.Label>}
              <Form.Control
                value={formData.target_january || ''}
                name="target_january"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_january)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Janeiro*</Form.Label>}
              <Form.Control
                value={formData.actual_january || ''}
                name="actual_january"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_january)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Fevereiro*</Form.Label>}
              <Form.Control
                value={formData.target_february || ''}
                name="target_february"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_february)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Fevereiro*</Form.Label>}
              <Form.Control
                value={formData.actual_february || ''}
                name="actual_february"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_february)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Março*</Form.Label>}
              <Form.Control
                value={formData.target_march || ''}
                name="target_march"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_march)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Março*</Form.Label>}
              <Form.Control
                value={formData.actual_march || ''}
                name="actual_march"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_march)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Abril*</Form.Label>}
              <Form.Control
                value={formData.target_april || ''}
                name="target_april"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_april)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Abril*</Form.Label>}
              <Form.Control
                value={formData.actual_april || ''}
                name="actual_april"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_april)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Maio*</Form.Label>}
              <Form.Control
                value={formData.target_may || ''}
                name="target_may"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_may)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Maio*</Form.Label>}
              <Form.Control
                value={formData.actual_may || ''}
                name="actual_may"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_may)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Junho*</Form.Label>}
              <Form.Control
                value={formData.target_june || ''}
                name="target_june"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_june)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Junho*</Form.Label>}
              <Form.Control
                value={formData.actual_june || ''}
                name="actual_june"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_june)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Julho*</Form.Label>}
              <Form.Control
                value={formData.target_july || ''}
                name="target_july"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_july)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Julho*</Form.Label>}
              <Form.Control
                value={formData.actual_july || ''}
                name="actual_july"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_july)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Agosto*</Form.Label>}
              <Form.Control
                value={formData.target_august || ''}
                name="target_august"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_august)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Agosto*</Form.Label>}
              <Form.Control
                value={formData.actual_august || ''}
                name="actual_august"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_august)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Setembro*</Form.Label>}
              <Form.Control
                value={formData.target_september || ''}
                name="target_september"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_september)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Setembro*</Form.Label>}
              <Form.Control
                value={formData.actual_september || ''}
                name="actual_september"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_september)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Outubro*</Form.Label>}
              <Form.Control
                value={formData.target_october || ''}
                name="target_october"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_october)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Outubro*</Form.Label>}
              <Form.Control
                value={formData.actual_october || ''}
                name="actual_october"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_october)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Novembro*</Form.Label>}
              <Form.Control
                value={formData.target_november || ''}
                name="target_november"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_november)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Novembro*</Form.Label>}
              <Form.Control
                value={formData.actual_november || ''}
                name="actual_november"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_november)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Meta Dezembro*</Form.Label>}
              <Form.Control
                value={formData.target_december || ''}
                name="target_december"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.target_december)}</label>
          </Form.Group>
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Realizado Dezembro*</Form.Label>}
              <Form.Control
                value={formData.actual_december || ''}
                name="actual_december"
                onChange={handleFieldChange}
                type="number"
              />
            <label className='text-danger'>{message && (message.actual_december)}</label>
          </Form.Group>

        </Row>
        <label className='text-danger'>{message && (message.non_field_errors)}</label>  
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/>
              : type === 'edit' ? 'Atualizar' : 'Cadastrar'+' Indicador'
            }
          </Button> 
        </Form.Group>         
      </Form>
    </>
  );
};

export default IndicatorForm;
