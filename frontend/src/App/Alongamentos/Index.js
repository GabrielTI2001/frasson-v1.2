import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Card, Spinner} from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";
import { faHourglassHalf, faMoneyBillWheat } from "@fortawesome/free-solid-svg-icons";
import { GetRecord } from "../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppContext } from "../../Main";

const IndexAlongamentos = () => {
  const user = JSON.parse(localStorage.getItem("user"))
  const [countRegs, setCountRegs] = useState();
  const {config: { theme}} = useAppContext();
  const navigate = useNavigate();

  useEffect(()=>{
    const buscadados = async () =>{
      const dados = await GetRecord('', 'alongamentos');
      if (!dados){
        RedirectToLogin(navigate)
      }
      else{
        setCountRegs({'next':dados.total_next, 'done':dados.total_along})
      }
    }
    if ((user.permissions && user.permissions.indexOf("view_operacoes_credito") === -1) && !user.is_superuser){
        navigate("/error/403")
    }
    if(!countRegs){
      buscadados()
    }
  },[])

  return (
    <>
      <CustomBreadcrumb>
          <span className="breadcrumb-item fw-bold" aria-current="page">
            Alongamentos Custeios Agrícolas
          </span>    
      </CustomBreadcrumb>
      <Row className="gy-3 gx-4" xs={1} sm={3} lg={5} xl={6}>
        <Col>
          <Card className="shadow-sm">
              <Link className="text-decoration-none" to={'done'}>
              <Card.Body as={Row} className="justify-content-between">
                <Row className="rounded-circle bg-200 mx-auto py-3 text-center" style={{width: '4rem'}}>
                  <FontAwesomeIcon icon={faMoneyBillWheat} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                </Row>
                <h5 className="text-center mt-2 fs--2">Operações Alongadas</h5>     
                <h5 className="text-center fs--2 fw-bold">{countRegs ? countRegs.done : <Spinner size="sm" />}</h5>                
              </Card.Body>
              </Link>
          </Card>
        </Col>
        <Col>
          <Card className="shadow-sm">
              <Link className="text-decoration-none" to={'next'}>
              <Card.Body as={Row} className="justify-content-between">
                <Row className="rounded-circle bg-200 mx-auto py-3 text-center" style={{width: '4rem'}}>
                  <FontAwesomeIcon icon={faHourglassHalf} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                </Row>
                <h5 className="text-center mt-2 fs--2">Próximos Alongamentos</h5>     
                <h5 className="text-center fw-bold fs--2">{countRegs ? countRegs.next : <Spinner size="sm"/>}</h5>                
              </Card.Body>
              </Link>
          </Card>
        </Col>
      </Row>
    </>
  );
};
  
export default IndexAlongamentos;
  