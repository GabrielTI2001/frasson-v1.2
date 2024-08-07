import React, {useEffect, useState} from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faListCheck, faUsers, faVial} from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../Main";
import { GetRecord } from "../../helpers/Data";
import CustomBreadcrumb from "../../components/Custom/Commom";

const IndexAdministrator = () =>{
    const {config: { theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"))
    const [countRegs, setCountRegs] = useState();
    const navigate = useNavigate()
    useEffect(()=>{
      const buscadados = async () =>{
        const dados = await GetRecord('', 'administrator');
        setCountRegs(dados)
      }
      if ((user.permissions && user.permissions.indexOf("ver_administrator") === -1) && !user.is_superuser){
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
            Administrator Panel
          </span> 
        </CustomBreadcrumb>
   
        <Row className="gy-3 gx-4" xs={1} sm={3} lg={5} xl={6}>
          <Col>
            <Card className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/admin/users'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faUsers} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`}/>
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Users</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.users}</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/register/feedbacks'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faComments} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`}/>
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Feedbacks</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.feedbacks}</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/assessments'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faListCheck} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`}/>
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Avaliação 360</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.assessments}</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
        </Row>
        </>
    )
}

export default IndexAdministrator;