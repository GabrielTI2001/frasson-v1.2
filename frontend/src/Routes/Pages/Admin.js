import React, {useEffect, useState} from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { GetRecord } from "../../helpers/Data";
import CustomBreadcrumb from "../../components/Custom/Commom";
import Association from '../../components/pages/asscociations/Association';
import { adminRoutes} from "../siteMaps";
import { Skeleton } from "@mui/material";

const Admin = () =>{
  const acessors = {'Usuários':'users', 'Feedbacks':'feedbacks', 'Avaliação 360':'assessments'}
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
        <span className="breadcrumb-item fw-bold" aria-current="page">AdmFin</span>    
      </CustomBreadcrumb>
      <Row className="g-3">
        {countRegs ? adminRoutes.children.map(c => <div key={c.name}>
          <h4 className="mb-1 fw-bold fs--1">{c.name}</h4>
          <Row className="gx-4 gy-0">
            {c.children.map(i => 
              <Col key={i.name} xl='auto' sm='auto'>
                <Association
                  title={i.name}
                  description={countRegs[acessors[i.name]] !== undefined && countRegs[acessors[i.name]]+' registro(s)'}
                  to={i.to}
                  icon={i.icon} icon2={i.icon2}
                />
              </Col>
            )}
          </Row>
        </div>) : <><Skeleton /><Skeleton /><Skeleton /></>}
      </Row>
    </>
  )
}

export default Admin;