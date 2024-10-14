import React, {useEffect} from "react";
import { Row, Col} from "react-bootstrap";
import CustomBreadcrumb from "../../components/Custom/Commom";
import Association from '../../components/pages/asscociations/Association';
import { servicosRoutes } from "../siteMaps";

const Servicos = () =>{
    useEffect(()=>{
    },[])
    return (
      <>
        <CustomBreadcrumb>
          <span className="breadcrumb-item fw-bold" aria-current="page">Servicos</span>    
        </CustomBreadcrumb>
        <Row className="g-3">
          {servicosRoutes.children.map(c => <div key={c.name}>
            <h4 className="mb-2 fw-bold fs--1">{c.name}</h4>
            <Row className="gx-4 gy-0">
              {c.children.map(i => 
                <Col key={i.name} xl='auto' sm='auto'>
                  <Association
                    title={i.name}
                    description={i.descricao}
                    to={i.to}
                    icon={i.icon} icon2={i.icon2}
                  />
                </Col>
              )}
            </Row>
          </div>)}
        </Row>
      </>
    )
}

export default Servicos;