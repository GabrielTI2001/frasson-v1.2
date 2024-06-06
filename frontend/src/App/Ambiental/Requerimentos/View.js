import { useEffect, useState } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import GoogleMap from "../../../components/map/GoogleMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faDownload } from "@fortawesome/free-solid-svg-icons";
import ModalDelete from "../../../components/Custom/ModalDelete";
import MapInfo from "./MapInfo";
import Info from "../../../components/Custom/Info";

const ViewRequerimentoAPPO = () => {
    const {uuid} = useParams()
    const [requerimento, setRequerimento] = useState()
    const [coordenadas, setCoordenadas] = useState()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [modal, setModal] = useState(false)
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/appo/coordenadas-detail/`

    const del = () =>{
        navigate('/ambiental/inema/requerimentos/appo')
    }

    useEffect(() =>{
        const getCoordenadas = async (id) => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/appo/coordenadas/?processo=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    navigate("/auth/login");
                }
                else if (response.status === 200){
                    const data = await response.json();
                    setCoordenadas(data)
                }
                else if (response.status === 404){
                    setCoordenadas([])
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }

        const getData = async () => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/appos/${uuid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    navigate("/auth/login");
                }
                else if (response.status === 200){
                    const data = await response.json();
                    setRequerimento(data)
                }
                else if (response.status === 404){
                    const data = await response.json();
                    navigate("/error/404")
                }
            } catch (error){
                setRequerimento([])
                setCoordenadas([])
                console.error("Erro: ",error)
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_requerimentos_appo") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!requerimento){
            getData()
        }
        else{
            if (!coordenadas){
                getCoordenadas(requerimento.id)
            }
        }
    }, [requerimento])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={`/ambiental/inema/requerimentos`}>Requerimentos Inema</Link>
            </li>
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={`/ambiental/inema/requerimentos/appo`}>APPO</Link>
            </li>
            {requerimento && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    Portaria {requerimento.numero_requerimento}
               </li>             
            )}
        </ol>
        { requerimento ? (
            <Row>
                <Col xl={6} sm={6}>
                    <Info title="N° Requerimento" description={requerimento.numero_requerimento} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="Data Requerimento" description={new Date(requerimento.data_requerimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="Nome Requerente" description={requerimento.nome_requerente} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="CPF/CNPJ" description={requerimento.cpf_cnpj} />
                </Col>
                <Col xl={12} sm={12}>
                    <Info title="Conduzido Frasson?" description={requerimento.frasson ? "Sim" : "Não"} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="Municipio" description={requerimento.nome_municipio || "-"} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="Email" description={requerimento.email || "-"} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="Qtd. Poços" description={requerimento.qtd_pontos} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="Data Formação" 
                    description={requerimento.data_formacao ? new Date(requerimento.data_formacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'} />
                </Col>
                <Col xl={6} sm={6}>
                    <Info title="N° Processo" description={requerimento.numero_processo} />
                </Col>
                <Col lg={4} xl={4} sm={4}>
                    <Info title="Criado Por" description={requerimento.info_user.first_name + " " +requerimento.info_user.last_name + " em " + 
                    new Date(requerimento.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} />
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
        <Row className="d-flex gx-1 gy-1">
          {requerimento && coordenadas && coordenadas.length > 0 &&
            <Col lg={'auto'} xxl={'auto'}>
                <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/appo/kml/${requerimento.id}`} 
                 className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                </Link>
             </Col>        
          }
            <Col lg={'auto'} xxl={'auto'}>
                <a className="btn btn-danger py-0 px-2" onClick={() => {setModal(true)}}>
                    <FontAwesomeIcon icon={faTrashCan} className="me-2"></FontAwesomeIcon>Excluir Requerimento
                </a>
            </Col>
        </Row>
      {requerimento && coordenadas ? (
        coordenadas.length > 0 && (
            <GoogleMap
                initialCenter={{
                    lat: Number(coordenadas[0].latitude_gd),
                    lng: Number(coordenadas[0].longitude_gd)
                }}
                mapStyle="Default"
                className="rounded-soft mt-2 google-maps container-map"
                token_api={requerimento.token_apimaps}
                mapTypeId='satellite'
                coordenadas={coordenadas}
                link={link}
            >
                <MapInfo type='appo'/>
            </GoogleMap>
        ))
        :    
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
      }
      {requerimento && (
        <ModalDelete show={modal} link={`${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/appos/${requerimento.uuid}`} 
            close={() => setModal(false)} update={del}
        />
      )}

    </>
    );
  };
  
  export default ViewRequerimentoAPPO;
  