import React, { useState, useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Form, Col, Table, Row, Placeholder} from 'react-bootstrap';
import { useAppContext } from "../../Main";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";

const ConsultaCNPJ = () =>{
    const {config: {theme}} = useAppContext();
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState()
    const [cnpj, setCNPJ] = useState()
    const navigate = useNavigate();

    const handleApi = async (cnpj) => {
        const link = `${process.env.REACT_APP_API_URL}/external/cnpj/?search=${cnpj}`
        const method = 'GET'
        try {
            const response = await fetch(link, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if(response.status === 400){
              setMessage(data.msg)
              setFormData({})
            }
            else if (response.status === 401){
              localStorage.setItem("login", JSON.stringify(false));
              localStorage.setItem('token', "");
              RedirectToLogin(navigate);
            }
            else if (response.status === 201 || response.status === 200){
                setFormData({...data, atividade_principal:`${data.atividade_principal_codigo || ''} ${data.atividade_principal_texto || ''}`})
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
    };
    const handleSubmit = e => {
        setFormData(null)
        setMessage(null)
        e.preventDefault();
        handleApi(cnpj);
    };
    useEffect(()=>{
    },[])
    

    return(
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/services'}>Serviços</Link>
            </span>
            <span className="breadcrumb-item fw-bold">
                Consulta CNPJ
            </span>
        </CustomBreadcrumb>
        <Form onSubmit={handleSubmit} className='row d-flex align-items-center'>
            <Form.Group className="mb-2" as={Col} xl={3} sm={4}>
                <Form.Label className='fw-bold mb-1'>CNPJ</Form.Label>
                <Form.Control
                    value={cnpj || ''}
                    name="description"
                    onChange={(e) => setCNPJ(e.target.value)}
                    type="text"
                />
                <label className='text-danger'>{message ? message : ''}</label>
            </Form.Group>
            <Col className={`mb-0 text-end`} xl='auto' sm='auto'>
                <Button className="w-40" type="submit">Pesquisa</Button>
            </Col> 
        </Form>
        {formData ?
        <>
        <Form onSubmit={handleSubmit} className='row'>
            <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
                <Form.Label className='fw-bold mb-1'>Razão Social</Form.Label>
                <Form.Control
                    value={formData.nome || ''}
                    name="nome"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>CNPJ</Form.Label>
                <Form.Control
                    value={formData.cnpj || ''}
                    name="cnpj"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
                <Form.Label className='fw-bold mb-1'>Natureza Jurídica</Form.Label>
                <Form.Control
                    value={formData.natureza_juridica || ''}
                    name="natureza_juridica"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
                <Form.Label className='fw-bold mb-1'>Email</Form.Label>
                <Form.Control
                    value={formData.email || ''}
                    name="email"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
                <Form.Label className='fw-bold mb-1'>Endereço</Form.Label>
                <Form.Control
                    value={formData.endereco || ''}
                    name="endereco"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={5} sm={6}>
                <Form.Label className='fw-bold mb-1'>Nome Fantasia</Form.Label>
                <Form.Control
                    value={formData.fantasia || ''}
                    name="fantasia"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
                <Form.Label className='fw-bold mb-1'>Porte</Form.Label>
                <Form.Control
                    value={formData.porte || ''}
                    name="porte"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={5} sm={12}>
                <Form.Label className='fw-bold mb-1'>Atividade Principal</Form.Label>
                <Form.Control
                    value={formData.atividade_principal || ''}
                    name="atividade_principal"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>Tipo</Form.Label>
                <Form.Control
                    value={formData.tipo || ''}
                    name="tipo"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
                <Form.Label className='fw-bold mb-1'>Município</Form.Label>
                <Form.Control
                    value={formData.municipio || ''}
                    name="municipio"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>CEP</Form.Label>
                <Form.Control
                    value={formData.cep || ''}
                    name="cep"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>Data Abertura</Form.Label>
                <Form.Control
                    value={formData.data_abertura || ''}
                    name="data_abertura"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>Capital Social</Form.Label>
                <Form.Control
                    value={formData.capital_social || ''}
                    name="capital_social"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>Telefone</Form.Label>
                <Form.Control
                    value={formData.telefone || ''}
                    name="telefone"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>Situação</Form.Label>
                <Form.Control
                    value={formData.situacao || ''}
                    name="situacao"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>Data Situação</Form.Label>
                <Form.Control
                    value={formData.data_situacao || ''}
                    name="data_situacao"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} xl={2} sm={6}>
                <Form.Label className='fw-bold mb-1'>Última Atualização</Form.Label>
                <Form.Control
                    value={formData.ultima_atualizacao || ''}
                    name="ultima_atualizacao"
                    onChange={handleFieldChange}
                    type="text"
                />
            </Form.Group>
        </Form>
        <Row xl={2} className="mt-2">
            <Table responsive>
                <thead className="bg-300">
                    <tr>
                        <th scope="col">Nome</th>
                        <th scope="col">Qualificação</th>
                        <th scope="col">País Origem</th>
                        <th scope="col">Rep. Legal</th>
                        <th scope="col">Qual. Rep. Legal</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {formData && formData.socios && formData.socios.map(socios =>(
                <tr key={socios.nome} style={{cursor:'auto'}}>
                    <td>{socios.nome}</td>
                    <td>{socios.qualificacao}</td>
                    <td>{socios.pais_origem}</td>
                    <td>{socios.nome_rep_legal}</td>
                    <td>{socios.qual_rep_legal}</td>
                </tr>
                ))} 
                </tbody>
            </Table>
            <Table responsive>
                <thead className="bg-300">
                    <tr>
                        <th scope="col" className="text-center">Código</th>
                        <th scope="col" className="text-center">Atividade</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {formData && formData.atividades && formData.atividades.map(atividade =>(
                <tr key={atividade.codigo} style={{cursor:'auto'}}>
                    <td className="text-center">{atividade.codigo}</td>
                    <td className="text-center">{atividade.atividade}</td>
                </tr>
                ))} 
                </tbody>
            </Table>    

        </Row>
        </>
        :             
        <Placeholder animation="glow">
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
            <Placeholder xs={4} />
            <Placeholder xs={6} /> <Placeholder xs={8} />
        </Placeholder> 
        }
        </>
    )
}

export default ConsultaCNPJ;