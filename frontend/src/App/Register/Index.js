import React, {useEffect, useState} from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTractor, faPersonDigging, faFlask, faPerson, faContactBook} from "@fortawesome/free-solid-svg-icons";
import { fetchBenfeitorias, FetchAnaliseSolo } from "./Data";
import { useAppContext } from "../../Main";
import { GetRecord } from "../../helpers/Data";

const IndexCadGerais = () =>{
    const {config: { theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"))
    const [countRegs, setCountRegs] = useState();
    const navigate = useNavigate()
    useEffect(()=>{
      const buscadados = async () =>{
        const dadosbenfeitoria = await fetchBenfeitorias();
        const dadosanalise = await FetchAnaliseSolo();
        const dadosmaquinas = await GetRecord('', 'register/machinery');
        const dadospessoas = await GetRecord('', 'register/pessoal');
        const cartorios = await GetRecord('', 'register/cartorios');
        if (!dadosbenfeitoria || !dadosanalise || !dadosbenfeitoria || !cartorios){
          navigate("/auth/login")
        }
        else{
          setCountRegs({'benfeitoria':dadosbenfeitoria.length, 'analisesolo':dadosanalise.length, 'maquinas':dadosmaquinas.length,
            'pessoal':dadospessoas.length, 'cartorios':cartorios.length
          })
        }
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
                <Link className="text-decoration-none" to={'/register/pessoal'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faPerson} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Cadastro Pessoal</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs ? countRegs.pessoal+' Registro(s)' : <Spinner size="sm" />}</h5>                
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
                  <h5 className="text-center text-white fs--2">{countRegs ? countRegs.maquinas+' Registro(s)' : <Spinner size="sm"/>}</h5>                
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
                  <h5 className="text-center text-white fs--2">{countRegs ? countRegs.benfeitoria+' Registro(s)' : <Spinner size="sm"/>}</h5>                
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
                  <h5 className="text-center text-white fs--2">{countRegs ? countRegs.analisesolo+' Registro(s)' : <Spinner size="sm"/>}</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card as={Col} className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/register/cartorios'}>
                <Card.Body as={Row} className="justify-content-center">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faContactBook} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Cartórios</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs ? countRegs.cartorios+' Registro(s)' : <Spinner size="sm"/>}</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
        </Row>
        </>
    )
}

export default IndexCadGerais;