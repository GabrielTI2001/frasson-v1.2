import { useEffect, useState } from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";
import { Placeholder} from "react-bootstrap";
import { RetrieveRecord } from "../../../helpers/Data";
import PolygonMap from "../../../components/map/PolygonMap";
import FormProdPecuaria from "./Form";

const EditProdPecuaria = ({id, gleba, submit}) => {
    const [producao, setProducao] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();

    const setter = (data) =>{
        setProducao(data)
    }

    const submitform = (type, data) =>{
        if (type === 'edit'){submit(type, data)}
        if (type === 'delete'){submit(type, data)}
    }

    useEffect(() =>{
        const getData = async () => {
            const status = await RetrieveRecord(id, 'litec/pecuaria', setter)
            if (status === 401) navigate("/auth/login")
        }
        if ((user.permissions && user.permissions.indexOf("view_glebas_areas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!producao){
            getData()
        }
    }, [])

    return (
    <>

        { producao ? (
            <Row className="mb-2">
                <FormProdPecuaria hasLabel type='edit' data={producao} submit={submitform} gleba={gleba.id}/>
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
    </>
    );
  };
  
  export default EditProdPecuaria;
  