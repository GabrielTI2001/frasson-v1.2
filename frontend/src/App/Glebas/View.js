import { useEffect, useState } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder, Tab, Tabs } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Info from "../../components/Custom/Info";
import { RetrieveRecord } from "../../helpers/Data";
import PolygonMap from "../../components/map/PolygonMap";
import IndexProdAgricola from "../Litec/Agricola/Index";
import IndexProdPecuaria from "../Litec/Pecuaria/Index";

const ViewGleba = () => {
    const {id} = useParams()
    const [gleba, setGleba] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();

    const setter = (data) =>{
        setGleba(data)
    }

    useEffect(() =>{
        const getData = async () => {
            const status = await RetrieveRecord(id, 'glebas/coordenadas', setter)
            if (status === 401) navigate("/auth/login")
        }
        if ((user.permissions && user.permissions.indexOf("view_glebas_areas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!gleba){
            getData()
        }
    }, [])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-0">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/glebas'}>Glebas</Link>
            </li>
            {gleba && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    {gleba.gleba} - {gleba.list_propriedades}
               </li>             
            )}
        </ol>

    <Tabs defaultActiveKey="mapa" id="uncontrolled-tab-example" className="rounded-1">
        <Tab eventKey="mapa" title="Mapa Gleba" className='p-3 rounded-top-0'>
            { gleba ? (
                <Row className="mb-2">
                    <Col xl={3} sm={4} xs={12}>
                        <Info title="Gleba" description={gleba.gleba} />
                    </Col>
                    <Col xl={3} sm={4} xs={12}>
                        <Info title="Cliente" description={gleba.str_cliente} />
                    </Col>
                    <Col xl={3} sm={4} xs={12}>
                        <Info title="Propriedades" description={gleba.list_propriedades} />
                    </Col>
                    <Col xl={3} sm={4} xs={12}>
                        <Info title="Município" description={gleba.str_municipio} />
                    </Col>
                </Row>
            ) : (
            <div>
                <Placeholder animation="glow">
                    <Placeholder xs={7} /> <Placeholder xs={4} /> 
                    <Placeholder xs={4} />
                    <Placeholder xs={6} /> <Placeholder xs={8} />
                </Placeholder>    
            </div>   
            )}
            <Row className="d-flex gy-1 gx-1">
            {gleba &&
                <Col lg={'auto'} xxl={'auto'} className="">
                    <Link to={`${process.env.REACT_APP_API_URL}/glebas/kml/download/${gleba.id}`} 
                    className="btn btn-primary py-0 ms-0 text-light">
                        <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                    </Link>
                </Col>        
            }
            </Row>
            {gleba ? 
                <PolygonMap
                    initialCenter={{
                        lat: gleba.coordenadas.length > 0 ? Number(gleba.coordenadas[0]['lat']) : -13.7910,
                        lng: gleba.coordenadas.length > 0 ? Number(gleba.coordenadas[0]['lng']) : -45.6814
                    }}
                    mapStyle="Default"
                    className="rounded-soft mt-2 google-maps container-map"
                    token_api={gleba.token_apimaps}
                    mapTypeId='satellite'
                    polygons={[{path:gleba.coordenadas.map(c=> ({lat:c.lat, lng:c.lng}))}]}
                >
                </PolygonMap>
                :    
                <div>
                    <Placeholder animation="glow">
                        <Placeholder xs={7} /> <Placeholder xs={4} /> 
                        <Placeholder xs={4} />
                        <Placeholder xs={6} /> <Placeholder xs={8} />
                    </Placeholder>    
                </div>   
            }
        </Tab>
        <Tab eventKey="agricola" title="Produção Agrícola" className='p-3'>
            <IndexProdAgricola />
        </Tab>
        <Tab eventKey="pecuaria" title="Produção Pecuária" className='p-3'>
            <IndexProdPecuaria />
        </Tab>
    </Tabs>

    </>
    );
  };
  
  export default ViewGleba;
  