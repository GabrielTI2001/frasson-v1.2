import React, {useEffect, useState} from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTractor,  faPerson } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../Main";
import { GetRecord } from "../../helpers/Data";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";

const IndexAppFarms = () =>{
    const {config: { theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"))
    const [countRegs, setCountRegs] = useState();
    const navigate = useNavigate()
    useEffect(()=>{
      const buscadados = async () =>{
        const dadosfarms = await GetRecord('', 'farms/farms');
        const dadosregime = await GetRecord('', 'farms/regime');
        if (!dadosfarms || !dadosregime){
          RedirectToLogin(navigate)
        }
        else{
          setCountRegs({'farms':dadosfarms.length, 'regimes':dadosregime.length})
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
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Cadastros Fazendas
            </span>    
        </CustomBreadcrumb>
        <Row className="gy-3 gx-4" xs={1} sm={3} lg={5} xl={6}>
          <Col>
            <Card className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/farms/farms'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faPerson} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Imóveis Rurais</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.farms} Registro(s)</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm" style={{backgroundColor: 'rgba(6,159,186,.75)'}}>
                <Link className="text-decoration-none" to={'/farms/regime'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Row className="rounded-circle bg-white mx-auto py-3 text-center" style={{width: '4rem'}}>
                    <FontAwesomeIcon icon={faTractor} className={`fs-4 mx-auto p-0 ${theme==='dark' ? 'text-dark' :'text-900'}`} />
                  </Row>
                  <h5 className="text-center text-white mt-2 fs--2">Regimes de Exploração</h5>     
                  <h5 className="text-center text-white fs--2">{countRegs && countRegs.regimes} Registro(s)</h5>                
                </Card.Body>
                </Link>
            </Card>
          </Col>
        </Row>
        </>
    )
}

export default IndexAppFarms;