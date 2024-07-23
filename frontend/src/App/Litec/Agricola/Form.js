import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions } from '../../../helpers/Data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ModalDelete from '../../../components/Custom/ModalDelete';

const meses = [{'name': 'JAN'}, {'name': 'FEV'}, {'name': 'MAR'}, {'name': 'ABR'}, {'name': 'MAI'}, {'name': 'JUN'}, {'name': 'JUL'}, 
  {'name': 'AGO'}, {'name': 'SET'}, {'name': 'OUT'}, {'name': 'NOV'}, {'name': 'DEZ'}
];

const monthOrder = {};
meses.forEach((mes, index) => {
  monthOrder[mes.name] = index;
});

const FormProdAgricola = ({ hasLabel, data, type, submit, gleba}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate();
  const [formData, setFormData] = useState({user: user.id, plantio:[], gleba:gleba || null, colheita:[], safra:'2022/2022'});
  const [message, setMessage] = useState()
  const [safras, setSafras] = useState([])
  const [modal, setModal] = useState({show:false})
  const token = localStorage.getItem("token")
  const [defaultoptions, setDefaultOptions] = useState()

  const sortMonths = (months) => {
    return months.sort((a, b) => monthOrder[a] - monthOrder[b]);
  }

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/litec/agricola/${type === 'edit' ? data.id+'/' : ''}`
    const method = type === 'edit' ? 'PUT' : 'POST'
    let dataToSend = { ...dadosform };

    // Remove plantio se for vazio
    if (dataToSend.plantio.length === 0) {
        delete dataToSend.plantio;
    } else {
        dataToSend.plantio = sortMonths(dataToSend.plantio).join(", ");
    }

    // Remove colheita se for vazio
    if (dataToSend.colheita.length === 0) {
        delete dataToSend.colheita;
    } else {
        dataToSend.colheita = sortMonths(dataToSend.colheita).join(", ");
    }

    try {
        const response = await fetch(link, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dataToSend)
        });
        const data = await response.json();
        if(response.status === 400){
          setMessage({...data})
        }
        else if (response.status === 401){
          localStorage.setItem("login", JSON.stringify(false));
          localStorage.setItem('token', "");
          navigate("/auth/login");
        }
        else if (response.status === 201 || response.status === 200){
          if (type === 'edit'){
            toast.success("Registro Atualizado com Sucesso!")
            submit('edit', data)
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            submit('add', data)
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
    setMessage(null)
    e.preventDefault();
    handleApi(formData);
  };

  const handleFieldChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prevState => {
          let newValue = prevState[name];

          if (checked) {
            newValue = [...newValue, value];
          } else {
            newValue = newValue.filter(mes => mes !== value);
          }
          return {
              ...prevState,
              [name]: newValue
          };
      });
    } else {
      setFormData(prevState => ({
          ...prevState,
          [name]: value
      }));
    }
};

  useEffect(()=>{
    const loadFormData = async () => {
      const { str_cultura, plantio, colheita, ...rest } = data;
      setFormData({
        ...formData,
        ...rest,
        plantio: plantio ? plantio.split(', ') : [],
        colheita: colheita ? colheita.split(', ') : []
      })
      setDefaultOptions({
        cultura:{value:data.cultura, label:str_cultura}
      })

    }
    const currentYear = new Date().getFullYear();
    const newChoices = [];
    for (let ano = 2022; ano <= currentYear; ano++) {
        const choice1 = `${ano}/${ano}`;
        newChoices.push({ value: choice1, label: choice1 });
        const choice2 = `${ano}/${ano + 1}`;
        newChoices.push({ value: choice2, label: choice2 });
    }
    setSafras(newChoices);

    if (type === 'edit' && (!defaultoptions)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row sectionform'>
        
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Cultura Agrícola*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'glebas/culturas', 'cultura')} name='cultura' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.cultura : '') : '' }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  cultura: selected.value
                }));
              }} />
            <label className='text-danger'>{message ? message.cultura : ''}</label>
          </Form.Group>
        )}

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Variedade Cultura*</Form.Label>}
          <Form.Control
            value={formData.variedade || ''}
            name="variedade"
            onChange={handleFieldChange}
            type='text'
          />
          <label className='text-danger'>{message ? message.variedade : ''}</label>
        </Form.Group>
        
        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Safra*</Form.Label>}
          <Form.Select
            value={formData.safra || ''}
            name="safra"
            onChange={handleFieldChange}
            type="text"
          >
            {safras.map(s => 
              <option key={s.value} value={s.value}>{s.label}</option>
            )}
          </Form.Select>
          <label className='text-danger'>{message ? message.safra : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1 d-block'>Meses Plantio*</Form.Label>}
          <Row className='gx-1 d-flex justify-content-start'>
            {meses.map(mes =>
                <Form.Check 
                    className="col-auto me-1 mb-0 cursor-pointer d-flex"
                    key={mes.name}
                    name='plantio'
                    label={mes.name}
                    value={mes.name}
                    onChange={handleFieldChange}
                    id={`plantio-${mes.name}`}
                    checked={formData.plantio.includes(mes.name)}
                />
            )}
          </Row>
          <label className='text-danger'>{message ? message.plantio : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1 d-block'>Meses Colheita*</Form.Label>}
          <Row className='gx-1 d-flex justify-content-start'>
            {meses.map(mes =>
                <Form.Check 
                    className="col-auto me-1 mb-0 cursor-pointer d-flex"
                    key={mes.name}
                    name='colheita'
                    label={mes.name}
                    value={mes.name}
                    onChange={handleFieldChange}
                    id={`colheita-${mes.name}`}
                    checked={formData.colheita.includes(mes.name)}
                />
            )}
          </Row>
          <label className='text-danger'>{message ? message.colheita : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Prod. Prevista (kg)</Form.Label>}
          <Form.Control
            value={formData.prod_prevista_kg || ''}
            name="prod_prevista_kg"
            onChange={handleFieldChange}
            type='number'
          />
          <label className='text-danger'>{message ? message.prod_prevista_kg : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Prod. Obtida (kg)</Form.Label>}
          <Form.Control
            value={formData.prod_obtida_kg || ''}
            name="prod_obtida_kg"
            onChange={handleFieldChange}
            type='number'
          />
          <label className='text-danger'>{message ? message.prod_obtida_kg : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={6} sm={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição</Form.Label>}
          <Form.Control
            value={formData.descricao || ''}
            name="descricao"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.descricao : ''}</label>
        </Form.Group>
        <Row>
          <Form.Group className={`mb-1 pe-1 ${type === 'edit' ? 'text-start' : 'text-end'}`} as={Col} xl='auto' xs='auto' sm='auto'> 
            <Button className="w-40 py-1" type="submit">
              {type === 'edit' ? "Atualizar Produção" : "Cadastrar Produção"}
            </Button>
          </Form.Group>       
          {type === 'edit' &&
            <Form.Group className={`mb-0 ps-1 ${type === 'edit' ? 'text-start' : 'text-end'}`} as={Col} xl='auto' xs='auto' sm='auto'>
              <Button className="w-40 btn-danger py-1" onClick={() => setModal({show:true, id:data.id})}>
                <FontAwesomeIcon icon={faTrash} className="me-2"></FontAwesomeIcon>Excluir
              </Button>
            </Form.Group> 
          } 
        </Row>
      </Form>
      {type ===  'edit' &&
        <ModalDelete show={modal.show} link={`${process.env.REACT_APP_API_URL}/litec/agricola/${data.id}/`} close={() => setModal({show:false})} 
          update={submit} 
        />
      }
    </>
  );
};

export default FormProdAgricola;
