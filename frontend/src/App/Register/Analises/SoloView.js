import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import Spinner from 'react-bootstrap';

const ViewAnaliseSolo = () => {
    const {uuid} = useParams()
    const navigate = useNavigate()
    const [analise, setAnalise] = useState()

    const setter = (data) =>{
        setAnalise(data)
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(uuid, 'register/analysis-soil', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if (!analise){
            getdata()
        }
    },[analise])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs mb-1">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/register/analysis-soil'}>Análises Solo</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {analise && analise.localizacao}
        </li>  
    </ol>

    <Row className='mt-2' xs={1} lg={2} xxl={2}>
        <Col className='d-flex flex-column justify-content-between'>
            <div>
                <div className='mb-1'><strong>Cliente: </strong></div>
                <div className='mb-1'><strong>Localização: </strong></div>
                <div className='mb-1'><strong>Data Coleta: </strong></div>
                <div className='mb-1'><strong>Identificação Amostra: </strong></div>
                <div className='mb-1'><strong>Responsável Coleta: </strong></div>
                <div className='mb-1'><strong>Laboratório da Análise: </strong></div>
                <div className='mb-1'><strong>Número da Amostra: </strong></div>
                <div className='mb-1'><strong>Profundidade (cm): </strong></div>
                <div className='mb-1'>Criado por</div>
            </div>
            <hr class="mb-1 mt-2 d-flex" style={{height: '1px', color: 'black', opacity: '.2'}}></hr>
        </Col>
        <Col>
            <div className='row gy-1'>
                <h4 className='mb-1' style={{fontSize:'14px'}}>Resultados</h4>
                <Col xxl={6} lg={6}><strong>Ca<sup>2+</sup> (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Mg<sup>2+</sup> (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Al<sup>3+</sup> (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Na<sup>+</sup> (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>K (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>P (mg/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>P-rem. (mg/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>S (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Zn (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Fe (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Cu (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Mn (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>B (cmolc/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>H+Al:</strong></Col>
                <Col xxl={6} lg={6}><strong>pH H<sub>2</sub>O:</strong></Col>
                <Col xxl={6} lg={6}><strong>pH CaCl<sub>2</sub>:</strong></Col>
                <Col xxl={6} lg={6}><strong>Matéria Orgânica (dag/dm<sup>3</sup>):</strong></Col>
                <Col xxl={6} lg={6}><strong>Areia (%):</strong></Col>
                <Col xxl={6} lg={6}><strong>Silte (%):</strong></Col>
                <Col xxl={6} lg={6}><strong>Argila (%):</strong></Col>
            </div>
            <hr class="mb-1 mt-2" style={{color: 'black', opacity: '.2'}}></hr>
        </Col>
    </Row>
    <Row xxl={2} lg={2}>
        <Col></Col>
        <Col></Col>
    </Row>
    </>
    );
};
  
export default ViewAnaliseSolo;
  

