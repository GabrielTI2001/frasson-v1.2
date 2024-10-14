import React, {useEffect, useState} from "react";
import { Row, Col, Spinner } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { GetRecord } from "../../helpers/Data";
// import { RedirectToLogin } from "../PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";
import Association from '../../components/pages/asscociations/Association';
import { creditoRoutes } from "../siteMaps";

const CreditoRural = () =>{
    // const user = JSON.parse(localStorage.getItem("user"))
    // const [countRegs, setCountRegs] = useState();
    // const navigate = useNavigate()
    useEffect(()=>{
      // const buscadados = async () =>{
      //   const dados = await GetRecord('', 'register/cadastros');
      //   if (!dados){
      //     RedirectToLogin(navigate)
      //   }
      //   else{
      //     setCountRegs({'benfeitoria':dados.benfeitorias, 'analisesolo':dados.analises_solo, 'maquinas':dados.maquinas,
      //       'pessoal':dados.pessoal, 'cartorios':dados.cartorios
      //     })
      //   }
      // }
      // if ((user.permissions && user.permissions.indexOf("ver_cadastros_gerais") === -1) && !user.is_superuser){
      //   navigate("/error/403")
      // }
      // if(!countRegs){
      //   buscadados()
      // }
    },[])
    return (
        <>
        <CustomBreadcrumb>
          <span className="breadcrumb-item fw-bold" aria-current="page">Crédito Rural</span>    
        </CustomBreadcrumb>
        <Row className="g-3">
           <div>
            <h4 className="mb-1 fw-bold fs--1">Crédito</h4>
            <Row className="gx-4 gy-0">
              {creditoRoutes.children[0].children.map(i => 
                <Col key={i.name} xl='auto' sm='auto'>
                  <Association
                    title={i.name}
                    description={'teste'}
                    to={i.to}
                    icon={i.icon} icon2={i.icon2}
                  />
                </Col>
              )}
            </Row>
          </div>
        </Row>
        </>
    )
}

export default CreditoRural;