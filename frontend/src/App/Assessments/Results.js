import React, {useState, useEffect} from "react";
import { Card, Row, Col, Form, Placeholder} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../Main";
import { BarChart } from "../../components/Custom/Charts";
import { HandleSearch } from "../../helpers/Data";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomBreadcrumb from "../../components/Custom/Commom";

const ResultsAssessment = () =>{
    const {config: {theme}} = useAppContext();
    const [formData, setFormData] = useState();
    const navigate = useNavigate();
    const [data, setData] = useState()
    const {uuid} = useParams()
    const user = JSON.parse(localStorage.getItem("user"))

    const setter = (responsedata) => {
        setData(responsedata)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("add_avaliacao_colaboradores") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('', `assessments/results/${uuid}`, setter)
        }
    }, [])

    if (formData && (formData.colaborador)){
        if(!data){
            HandleSearch(formData.colaborador, `assessments/results/${uuid}`, setter)
        }
    }

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
        setData(null)
    };

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/assessments'}>Avaliações</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Resultados
            </span>    
        </CustomBreadcrumb>
        <Form className='row mb-3'>
            <Form.Group className="mb-0" as={Col} xl={3} sm={4}>
                <Form.Select name='colaborador' onChange={handleFieldChange} value={formData ? formData.colaborador : ''}>
                    {data && data.options.map(opt =>(
                        <option key={opt.id} value={opt.id}>{opt.nome}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            {data && formData &&
                <Form.Group className="mb-0" as={Col} xl={3} sm={4}>
                    <Link to={`${process.env.REACT_APP_API_URL}/assessments/report?uuid=${data.assessment.uuid}&search=${formData.colaborador}`} 
                        className="px-2 fw-bold btn btn-danger"
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="me-2"></FontAwesomeIcon>Relatório PDF
                    </Link>
                </Form.Group>
            }
        </Form>
        {data ? <>
        <h5 className="fw-bold mb-3 fs-0">Avaliações Qualitativas</h5>
        <Row xs={1} sm={2} xl={2} className="gx-4 mb-4 d-flex"> 
            <Col>
                <Card.Body className="card">
                    <BarChart
                        columns={data.outros_qualitativo.map(oq => oq.categoria)}
                        title={`Avaliação de Outros`}
                        series = {[{
                            name: '',
                            data: data.outros_qualitativo.map(oq => oq.percentual)
                        }]}
                        hidescale
                        percentual
                        max={100}
                        height={260}
                    />
                </Card.Body>
            </Col>  
            <Col>
                <Card.Body className="card">
                    <BarChart
                        columns={data.auto_qualitativo.map(oq => oq.categoria)}
                        title={`Autoavaliação`}
                        series = {[{
                            name: '',
                            data: data.auto_qualitativo.map(oq => oq.percentual)
                        }]}
                        hidescale
                        max={100}
                        percentual
                        height={260}
                    />
                </Card.Body>
            </Col> 
        </Row> 
        <h5 className="fw-bold mb-3 fs-0">Avaliações Quantitativas</h5>
        <Row xs={1} sm={2} xl={2} className="gx-4 d-flex mb-4"> 
            <Col>
                <Card.Body className="card">
                    <BarChart
                        columns={data.outros_quantitativo.map(oq => oq.categoria)}
                        title={`Avaliação de Outros`}
                        series = {[{
                            name: '',
                            data: data.outros_quantitativo.map(oq => oq.percentual)
                        }]}
                        hidescale
                        percentual
                        max={100}
                        height={260}
                    />
                </Card.Body>
            </Col>  
            <Col>
                <Card.Body className="card">
                    <BarChart
                        columns={data.auto_quantitativo.map(oq => oq.categoria)}
                        title={`Autoavaliação`}
                        series = {[{
                            name: '',
                            data: data.auto_quantitativo.map(oq => oq.percentual)
                        }]}
                        hidescale
                        max={100}
                        percentual
                        height={260}
                    />
                </Card.Body>
            </Col> 
        </Row> 
        <Row className="mb-3">
            <h5 className="fw-bold mb-2 fs-0">Média Final</h5>
            {data.medias.map(m => 
                <div className="row">
                    <label className="col-3 mb-0">{m.label}</label>
                    <span className="col-3">{m.value} %</span>
                </div>
            )}
        </Row>
        </>    
        : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        } 
        </>
        
    )
}

export default ResultsAssessment;