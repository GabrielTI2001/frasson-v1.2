import { useEffect, useState } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import GoogleMap from "../../../components/map/GoogleMap";
import SubtleBadge from '../../../components/common/SubtleBadge';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashCan, faDownload } from "@fortawesome/free-solid-svg-icons";
import ModalDelete from "../../../components/Custom/ModalDelete";
import { MapInfoDetailASV } from "./MapInfo";
import Info from "../../../components/Custom/Info";
import { RetrieveRecord } from "../../../helpers/Data";
import PolygonMap from "../../../components/map/PolygonMap";

const ViewASV = () => {
    const {uuid} = useParams()
    const [asv, setASV] = useState()
    const [coordenadas, setCoordenadas] = useState()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [modal, setModal] = useState(false)
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/`

    const del = () =>{
        navigate('/ambiental/inema/asvs/')
    }

    const setter = (data) =>{
        setASV(data)
    }

    useEffect(() =>{
        const getCoordenadas = async (id) => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas/?processo=${id}`, {
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
                    setCoordenadas([...data.map(d =>({...d, path:d.kml}))])
                }
                else if (response.status === 404){
                    setCoordenadas([])
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }

        const getData = async () => {
            const status = await RetrieveRecord(uuid, 'environmental/inema/asvs', setter)
            if (status === 401) navigate("auth/login")
        }
        if ((user.permissions && user.permissions.indexOf("view_processos_asv") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!asv){
            getData()
        }
        else{
            if (!coordenadas){
                getCoordenadas(asv.id)
            }
        }
    }, [asv])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/ambiental/inema/asv'}>Processos ASV</Link>
            </li>
            {asv && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    Portaria {asv.portaria}
               </li>             
            )}
        </ol>
        { asv ? (
            <Row className="mb-2">
                <Col xl={2} sm={4}>
                    <Info title="Portaria" description={asv.portaria} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="Data Formação" description={asv.data_formacao ? asv.data_formacao : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="Data Validade" description={asv.data_vencimento ? asv.data_vencimento : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="Data Validade" description={asv.data_vencimento ? asv.data_vencimento : '-'} />
                </Col>
                <Col xl={4} sm={4}>
                    <Info title="Processo INEMA" description={asv.processo ? asv.processo : '-'} />
                </Col>
                <Col xl={4} sm={4}>
                    <Info title="Nome Requerente" description={asv.requerente ? asv.requerente : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="CPF/CNPJ Requerente" description={asv.cpf_cnpj ? asv.cpf_cnpj : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="Localidade" description={asv.localidade ? asv.localidade : '-'} />
                </Col>
                <Col xl={4} sm={4}>
                    <Info title="Município" description={asv.nome_municipio ? asv.nome_municipio : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="Área Total ASV (ha)" description={asv.area_total ? asv.area_total : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <span className="fw-bold text-dark" style={{fontSize: '12px'}}>Rendimento (m<sup>3</sup>)</span>
                    <Info description={asv.rendimento ? asv.rendimento : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="Empresa Consultora" description={asv.str_empresa ? asv.str_empresa : '-'} />
                </Col>
                <Col xl={2} sm={4}>
                    <Info title="Técnico Responsável" description={asv.tecnico ? asv.tecnico : '-'} />
                </Col>
                <Col xl={2} sm={3}>
                    <h6 className="mb-0"><span className="fw-bold" style={{fontSize: '12px'}}>Status Portaria</span></h6>
                    {asv.data_vencimento ? new Date(asv.data_vencimento) < new Date()
                        ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
                        :<SubtleBadge bg='success'>Vigente</SubtleBadge>
                        :<span>-</span>
                    }
                </Col>
                <Col lg={4} xl={4} sm={4}>
                    <span>
                        <strong className="text-primary">{asv.info_user.first_name} {asv.info_user.last_name}</strong>
                        {" em " + 
                            new Date(asv.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})+" às "+
                            new Date(asv.created_at).toLocaleTimeString('pt-BR')}
                        </span>
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
          {asv && coordenadas && coordenadas.length > 0 &&
            <Col lg={'auto'} xxl={'auto'} className="">
                <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/asv/kml/${asv.id}`} 
                 className="btn btn-info py-0 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                </Link>
             </Col>        
          }
            <Col lg={'auto'} xxl={'auto'} className="">
                <Link to={`/ambiental/inema/asv/edit/${uuid}`} className="btn btn-primary py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faPen} className="me-2"></FontAwesomeIcon>Editar Portaria
                </Link>
            </Col>
            <Col lg={'auto'} xxl={'auto'} className="">
                <a className="btn btn-danger py-0 px-2" onClick={() => {setModal(true)}}>
                    <FontAwesomeIcon icon={faTrashCan} className="me-2"></FontAwesomeIcon>Excluir Portaria
                </a>
            </Col>
        </Row>
      {asv && coordenadas ? 
        <PolygonMap
            initialCenter={{
                lat: coordenadas.length > 0 ? Number(coordenadas[0].kml[0]['lat']) : -13.7910,
                lng: coordenadas.length > 0 ? Number(coordenadas[0].kml[0]['lng']) : -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-2 google-maps container-map"
            token_api={asv.token_apimaps}
            mapTypeId='satellite'
            polygons={coordenadas}
            link={link}
        >
            <MapInfoDetailASV />
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
      {asv && (
        <ModalDelete show={modal} link={`${process.env.REACT_APP_API_URL}/environmental/inema/asvs/${asv.uuid}`} 
            close={() => setModal(false)} update={del}
        />
      )}

    </>
    );
  };
  
  export default ViewASV;
  