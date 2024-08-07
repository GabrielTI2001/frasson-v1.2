import React, {useState, useEffect} from "react";
import { Card, Row, Col, Form, Table, Spinner} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faChartColumn, faArrowTrendDown, faArrowTrendUp, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../../Main";
import { LineChart } from "../../../components/Custom/Charts";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const Commodities = () =>{
    const {config: {theme}} = useAppContext();
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState()
    const [statistics, setStatistics] = useState()
    const [produtos, setProdutos] = useState()
    const [locations, setLocations] = useState()
    const token = localStorage.getItem("token")

    useEffect(()=>{
        if (!searchResults){
            setSearchResults([]) 
        }
        if(!locations){
            loadFormdata()
        }
    }, [])

    const handleSearch = async (search) => {
        const url = `${process.env.REACT_APP_API_URL}/services/currency/commodities?${search}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();
            if (response.status === 401) {
                localStorage.setItem("login", JSON.stringify(false));
                localStorage.setItem('token', "");
                RedirectToLogin(navigate);
            } else if (response.status === 200) {
                setSearchResults(data.list)
                setStatistics({'media':data.media, 'desvio_padrao':data.desvio_padrao, 'min':data.minimo, 'max':data.maximo})
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    if (formData.data_final && formData.data_inicio && formData.produto && formData.localizacao){
        if(!searchResults){
            const params = `produto=${formData.produto}&local=${formData.localizacao}&inicio=${formData.data_inicio}&final=${formData.data_final}`
            handleSearch(params)
        }
    }
    else{
        if(!searchResults){
            setSearchResults([])
        }  
    }

    const loadFormdata = async () => {
        const url1 = `${process.env.REACT_APP_API_URL}/services/currency/locations/`
        const url2 = `${process.env.REACT_APP_API_URL}/services/currency/produtos/`
        try {
            const response = await fetch(url1, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const response2 = await fetch(url2, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data1 = await response.json();
            const data2 = await response2.json();
            if (response.status === 401) {
                localStorage.setItem("login", JSON.stringify(false));
                localStorage.setItem('token', "");
                RedirectToLogin(navigate);
            } else if (response.status === 200 && response2.status === 200) {
                setLocations(data1)
                setProdutos(data2)
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
        setSearchResults(null)
        setStatistics(null)
    };

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/external-api'}>API de Terceiros</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Commodities
            </span>    
        </CustomBreadcrumb>
        <Form className='row mb-2'>
            <Form.Group className="mb-2" as={Col} lg={3} xl={3} sm={3}>
                <Form.Label className='fw-bold mb-1'>Produto*</Form.Label>
                <Form.Select
                    value={formData.produto || ''}
                    name="produto"
                    onChange={handleFieldChange}
                >
                    <option value={0}>----</option>
                {produtos && produtos.map(p =>
                    <option key={p.id} value={p.id}>{p.commodity}</option> 
                )}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" as={Col} lg={3} xl={3} sm={3}>
                <Form.Label className='fw-bold mb-1'>Localização*</Form.Label>
                <Form.Select
                    value={formData.localizacao || ''}
                    name="localizacao"
                    onChange={handleFieldChange}
                >
                    <option value={0}>----</option>
                {locations && locations.map(l =>
                    <option key={l.id} value={l.id}>{l.location}</option> 
                )}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" as={Col} lg={3} xl={3} sm={3}>
                <Form.Label className='fw-bold mb-1'>Data Início*</Form.Label>
                <Form.Control
                    value={formData.data_inicio || ''}
                    name="data_inicio"
                    onChange={handleFieldChange}
                    type="date"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} lg={3} xl={3} sm={3}>
                <Form.Label className='fw-bold mb-1'>Data Final*</Form.Label>
                <Form.Control
                    value={formData.data_final|| ''}
                    name="data_final"
                    onChange={handleFieldChange}
                    type="date"
                />
            </Form.Group>
        </Form>
        <Row className="gx-4 gy-2 mb-3" xs={1} md={2} lg={4}>
            <Col>
                <Card className="shadow-sm px-3 panel">
                    <Card.Body as={Row} className="justify-content-between">
                    <Col lg={9} sm={9} className="ps-0">
                        <Card.Title className="fw-bold">{
                            statistics && statistics.media ? statistics.media.toLocaleString('pt-br', { style: "currency", currency: "BRL" }):'R$'
                        }</Card.Title>  
                        <p className="mb-0 fw-600">Cotação Média</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 text-end">
                        <FontAwesomeIcon icon={faChartColumn} className="fs-5" style={{color:'#17a2b8'}}/>
                    </Col>
                    </Card.Body>
                </Card>            
            </Col>
            <Col>
                <Card className="shadow-sm px-3 panel">
                    <Card.Body as={Row} className="justify-content-between">
                    <Col lg={9} sm={9} className="ps-0">
                        <Card.Title className="fw-bold">{
                            statistics && statistics.min ? statistics.min.toLocaleString('pt-br', { style: "currency", currency: "BRL" }):'R$'
                        }</Card.Title>  
                        <p className="mb-0 fw-600">Cotação Mínima</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 text-end">
                        <FontAwesomeIcon icon={faArrowTrendDown} className="fs-4 mt-1" style={{color:'#17a2b8'}}/>
                    </Col>
                    </Card.Body>
                </Card>            
            </Col>
            <Col>
                <Card className="shadow-sm px-3 panel">
                    <Card.Body as={Row} className="justify-content-between">
                    <Col lg={9} sm={9} className="ps-0">
                        <Card.Title className="fw-bold">{
                            statistics && statistics.max ? statistics.max.toLocaleString('pt-br', { style: "currency", currency: "BRL" }):'R$'
                        }
                        </Card.Title>  
                        <p className="mb-0 fw-600">Cotação Máxima</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 text-end">
                        <FontAwesomeIcon icon={faArrowTrendUp} className="fs-4 mt-1" style={{color:'#17a2b8'}}/>
                    </Col>
                    </Card.Body>
                </Card>            
            </Col>
            <Col>
                <Card className="shadow-sm px-3 panel">
                    <Card.Body as={Row} className="justify-content-between">
                    <Col lg={9} sm={9} className="ps-0">
                        <Card.Title className="fw-bold">{
                            statistics && statistics.desvio_padrao !== null ? statistics.desvio_padrao.toLocaleString('pt-br', { style: "currency", currency: "BRL" }):'R$'
                        }</Card.Title>  
                        <p className="mb-0 fw-600">Desvio Padrão</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 text-end">
                        <FontAwesomeIcon icon={faChartLine} className="fs-5" style={{color:'#17a2b8'}}/>
                    </Col>
                    </Card.Body>
                </Card>            
            </Col>
        </Row>
        {searchResults ?
        <Row lg={1} xl={2}> 
            <Table responsive>
                <thead className="bg-300">
                    <tr>
                        <th scope="col">Data</th>
                        <th scope="col">Commodity</th>
                        <th scope="col">Localização</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Unidade</th>
                        <th scope="col">Cotação</th>
                    </tr>
                </thead>
                {/* #d8e2ef */}
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {searchResults.map(price =>(
                <tr key={price.id} style={{cursor:'auto'}}>
                    <td>{new Date(price.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td>{price.str_commodity}</td>
                    <td>{price.localizacao}</td>
                    <td>{price.type}</td>
                    <td>{price.unit}</td>
                    <td>{Number(price.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                </tr>
                ))}
                </tbody>
            </Table> 
            <Col>
            {searchResults && formData &&
                <LineChart 
                    values={searchResults.map(p => Number(p.price))} 
                    columns={searchResults.map(p => new Date(p.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}))}
                    name='Preço'
                    title={`${searchResults.length > 0 ? 'Preços de '
                        +produtos.filter(produtos => produtos.id === parseInt(formData.produto))[0].commodity
                        +' - '+new Date(formData.data_inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})
                        +' a '+new Date(formData.data_final).toLocaleDateString('pt-BR', {timeZone: 'UTC'})
                        : ''}`}
                />
            }
            </Col>
        </Row>      
        : <div className="text-center"><Spinner></Spinner></div>} 
        </>
        
    )
}

export default Commodities;