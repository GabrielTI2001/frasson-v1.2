import { useEffect, useState } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import {Spinner} from "react-bootstrap";
import { Placeholder } from "react-bootstrap";
import GoogleMap from "../../../components/map/GoogleMap";
import SubtleBadge from '../../../components/common/SubtleBadge';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashCan, faDownload } from "@fortawesome/free-solid-svg-icons";
import ModalDelete from "../../../components/Custom/ModalDelete";
import MapInfo from "./../MapInfo";
import Info from "../../../components/Custom/Info";

const View = () => {
    const channel = new BroadcastChannel('meu_canal');
    const {uuid} = useParams()
    const [outorga, setOutorga] = useState()
    const [coordenadas, setCoordenadas] = useState()
    const token = localStorage.getItem("token")
    const [modal, setModal] = useState(false)
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/outorga/coordenadas-detail/`

    const dif = (data_ren) => {
        const dif = parseInt((new Date(data_ren) - new Date())/(1000 * 60 * 60 * 24))
        const v = dif <= 0 ? 0 : dif;
        return v;
    }

    const del = () =>{
        navigate('/ambiental/inema/outorgas/')
    }

    channel.onmessage = function(event) {
        if (coordenadas && event.data.outorga_id === outorga.id){
            if(event.data.tipo === 'adicionar_coordenada'){
                setCoordenadas([...coordenadas, {...event.data.reg}])
                setOutorga({...outorga, qtd_pontos:outorga.qtd_pontos+1})
            }
            if(event.data.tipo === 'remover_coordenada'){
                setCoordenadas(coordenadas.filter(ponto => ponto.id !== event.data.id))
                setOutorga({...outorga, qtd_pontos:outorga.qtd_pontos-1})
            }
            if(event.data.tipo === 'atualizar_outorga'){
                setOutorga({...event.data.reg})
            }
        }

    };

    useEffect(() =>{
        const getCoordenadas = async (id) => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/outorga/coordenadas/?processo=${id}`, {
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
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/outorgas/${uuid}`, {
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
                    setOutorga(data)
                }
                else if (response.status === 404){
                    const data = await response.json();
                    navigate("/error/404")
                }
            } catch (error){
                setOutorga([])
                setCoordenadas([])
                console.error("Erro: ",error)
            }
        }
        if (!outorga){
            getData()
        }
        else{
            if (!coordenadas){
                getCoordenadas(outorga.id)
            }
        }
    }, [outorga])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/ambiental/inema/outorgas'}>Processos Outorga</Link>
            </li>
            {outorga && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    Portaria {outorga.numero_portaria}
               </li>             
            )}
        </ol>
        { outorga ? (
            <Row>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Portaria" description={outorga.numero_portaria} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Data Publicação" description={new Date(outorga.data_publicacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Data Validade" description={new Date(outorga.data_validade).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} />
                </Col>
                <Col lg={3} xl={3} sm={3}>
                    <Info title="Processo INEMA" description={outorga.numero_processo} />
                </Col>
                <Col lg={3} xl={3} sm={3}>
                    <Info title="Nome Requerente" description={outorga.nome_requerente} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="CPF/CNPJ" description={outorga.cpf_cnpj} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Tipo Captação" description={outorga.str_tipo_captacao} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Finalidade" description={outorga.str_finalidade} />
                </Col>
                <Col lg={3} xl={3} sm={3}>
                    <Info title="Nome Propriedade" description={outorga.nome_propriedade} />
                </Col>
                <Col lg={3} xl={3} sm={3}>
                    <Info title="Municipio" description={outorga.nome_municipio ? (outorga.nome_municipio) :"-"} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Área (ha)" description={outorga.area_ha} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Conduzido Frasson?" description={outorga.processo_frasson ? "Sim" : "Não"} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Bacia Hidrográfica" description={outorga.bacia_hidro} />
                </Col>
                <Col lg={3} xl={3} sm={2}>
                    <Info title="Pontos Outorgados" description={outorga.qtd_pontos} />
                </Col>
                <Col lg={2} xl={3} sm={3}>
                <h6 className="fs-0 mb-0"><span className="fw-bold" style={{fontSize: '12px'}}>Status Portaria</span></h6>
                    {new Date(outorga.data_validade) < new Date()
                        ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
                        :<SubtleBadge bg='success'>Vigente</SubtleBadge>
                    }
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    {outorga.renovacao && <Info title="Data RENOUT" description={new Date(outorga.renovacao.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}/>}
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <h6 className="fs-0 mb-0"><span className="fw-bold" style={{fontSize: '12px'}}>Status Renovação</span></h6>
                    {outorga.renovacao && new Date(outorga.renovacao.data) < new Date()
                        ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
                        :<SubtleBadge bg='success'>Vigente</SubtleBadge>
                    }
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    {outorga.renovacao &&<Info title="Dias p/ Renovação" description={dif(outorga.renovacao.data)} />}
                </Col>
                <Col lg={4} xl={4} sm={4}>
                    <Info title="Criado Por" description={outorga.info_user.first_name + " " +outorga.info_user.last_name + " em " + 
                    new Date(outorga.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} />
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
        <Row className="d-flex">
          {outorga && coordenadas && coordenadas.length > 0 &&
            <Col lg={'auto'} xxl={'auto'} className="me-0 pe-0">
                <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/outorga/kml/${outorga.id}`} 
                 className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                </Link>
             </Col>        
          }
            <Col lg={'auto'} xxl={'auto'} className="pe-0 ps-2">
                <Link to={`/ambiental/inema/outorgas/edit/${uuid}`} className="btn btn-primary py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faPen} className="me-2"></FontAwesomeIcon>Editar Portaria
                </Link>
            </Col>
            <Col lg={'auto'} xxl={'auto'} className="ps-2">
                <a className="btn btn-danger py-0 px-2" onClick={() => {setModal(true)}}>
                    <FontAwesomeIcon icon={faTrashCan} className="me-2"></FontAwesomeIcon>Excluir Portaria
                </a>
            </Col>
        </Row>
      {outorga && coordenadas ? (
        coordenadas.length > 0 && (
            <GoogleMap
                initialCenter={{
                    lat: Number(coordenadas[0].latitude_gd),
                    lng: Number(coordenadas[0].longitude_gd)
                }}
                mapStyle="Default"
                className="rounded-soft mt-2 google-maps container-map"
                token_api={outorga.token_apimaps}
                mapTypeId='satellite'
                coordenadas={coordenadas}
                link={link}
            >
                <MapInfo/>
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
      {outorga && (
        <ModalDelete show={modal} link={`${process.env.REACT_APP_API_URL}/environmental/inema/outorgas/${outorga.uuid}`} 
            close={() => setModal(false)} update={del}
        />
      )}

    </>
    );
  };
  
  export default View;
  