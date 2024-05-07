import React, {useEffect, useState} from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faTractor, faPersonDigging, faFlask} from "@fortawesome/free-solid-svg-icons";
import { fetchPessoal } from "../Pipefy/Data";
import { fetchBenfeitorias, FetchAnaliseSolo } from "./Data";
import { useAppContext } from "../../Main";

const IndexCadGerais = () =>{
    const {config: { theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"))
    const [countRegs, setCountRegs] = useState();
    const navigate = useNavigate()
    useEffect(()=>{
      const buscadados = async () =>{
        const dadospessoal = await fetchPessoal();
        const dadosbenfeitoria = await fetchBenfeitorias();
        const dadosanalise = await FetchAnaliseSolo();
        setCountRegs({...countRegs, 'pessoal':dadospessoal.length, 'benfeitoria':dadosbenfeitoria.length,
        'analisesolo':dadosanalise.length})
      }
      if ((user.permissions && user.permissions.indexOf("ver_cadastros_gerais") === -1) && !user.is_superuser){
        navigate("/error/403")
      }
      if(!countRegs){
        buscadados()
      }
    },[])
    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Cadastros Gerais
            </li>    
        </ol>
        <Row className="gy-3 gx-4" xs={1} sm={3} lg={5} xl={6}>
          <Col>
            <Card className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/pipefy/pessoal'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faUsers} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`}/>
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Cadastro Pessoal</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.pessoal} Registros</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/register/machinery'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faTractor} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Máquinas e Equipamentos</h5>     
                  <h5 className="text-center text-white fs--2">0 Registros</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card as={Col} className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/register/farm-assets'}>
                <Card.Body as={Row} className="justify-content-center">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faPersonDigging} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Benfeitorias Fazendas</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.benfeitoria} Registros</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card as={Col} className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/register/analysis/soil'}>
                <Card.Body as={Row} className="justify-content-center">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faFlask} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Análises de Solo</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.analisesolo} Registros</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
        </Row>
        </>
    )
}

export default IndexCadGerais;