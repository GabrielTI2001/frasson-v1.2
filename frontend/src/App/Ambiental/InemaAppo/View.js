import { useEffect, useState} from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import Info from "../../../components/Custom/Info";
import { Placeholder } from "react-bootstrap";
import {format} from 'date-fns'
import GoogleMap from "../../../components/map/GoogleMap";
import SubtleBadge from '../../../components/common/SubtleBadge';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashCan, faFilePdf, faDownload } from "@fortawesome/free-solid-svg-icons";
import ModalDelete from "../../../components/Custom/ModalDelete";
import MapInfo from "./../MapInfo";
import { toast } from "react-toastify";

export const View = () => {
    const channel = new BroadcastChannel('meu_canal');
    const {uuid} = useParams()
    const [appo, setAppo] = useState()
    const [coordenadas, setCoordenadas] = useState()
    const token = localStorage.getItem("token")
    const [modal, setModal] = useState(false)
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/appo/coordenadas-detail/`

    const dif = (data_ren) => {
        const dif = parseInt((new Date(data_ren) - new Date())/(1000 * 60 * 60 * 24))
        const v = dif <= 0 ? 0 : dif;
        return v;
    }

    const del = () =>{
        navigate('/ambiental/inema/appos/')
    }

    channel.onmessage = function(event) {
        if (coordenadas && event.data.appo_id == appo.id){
            if(event.data.tipo === 'adicionar_coordenada'){
                setCoordenadas([...coordenadas, {...event.data.reg}])
                setAppo({...appo, qtd_pontos:appo.qtd_pontos+1})
            }
            if(event.data.tipo === 'remover_coordenada'){
                setCoordenadas(coordenadas.filter(ponto => ponto.id !== event.data.id))
                setAppo({...appo, qtd_pontos:appo.qtd_pontos-1})
            }
            if(event.data.tipo === 'atualizar_appo'){
                setAppo({...event.data.reg})
            }
        }

    };

    useEffect(() =>{
        const getCoordenadas = async (id) => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/appo/coordenadas/?processo=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    toast.error("Sua Sessão Expirou")
                    const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
                    navigate(`/auth/login?next=${next}`);
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
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/appos/${uuid}`, {
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
                    setAppo(data)
                }
                else if (response.status === 404){
                    const data = await response.json();
                    navigate("/error/404")
                }
            } catch (error){
                console.error("Erro: ",error)
            }
        }
        if (!appo){
            getData()
        }
        else{
            if (!coordenadas){
                getCoordenadas(appo.id)
            }
        }
    }, [appo])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/ambiental/inema/appos'}>Processos APPO</Link>
            </li>
            {appo && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    Processo {appo.numero_processo}
               </li>             
            )}
        </ol>
        { appo ? (
            <Row>
                <Col lg={4} xl={4} sm={4}>
                    <Info title="Nome Requerente" description={appo.nome_requerente} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="CPF/CNPJ" description={appo.cpf_cnpj} />
                </Col>
                <Col lg={4} xl={4} sm={4}>
                    <Info title="Processo INEMA" description={appo.numero_processo} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Municipio" description={appo.nome_municipio} />
                </Col>
                <Col lg={4} xl={4} sm={4}>
                    <Info title="Nome Propriedade" description={appo.nome_fazenda} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Data Publicação" description={format(new Date(appo.data_documento), 'dd/MM/yyyy')} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Data Validade" description={format(new Date(appo.data_vencimento), 'dd/MM/yyyy')} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Aquífero" description={appo.str_tipo_aquifero} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Conduzido Frasson?" description={appo.processo_frasson ? "Sim" : "Não"} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Qtd. Poços" description={appo.qtd_pontos} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                <h6 className="fs-0 mb-0"><span className="fw-bold" style={{fontSize: '12px'}}>Status APPO</span></h6>
                    {new Date(appo.data_vencimento) < new Date()
                        ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
                        :<SubtleBadge bg='success'>Vigente</SubtleBadge>
                    }
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Data REAPPO" description={format(new Date(appo.renovacao.data), 'dd/MM/yyyy')} />
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <h6 className="fs-0 mb-0"><span className="fw-bold" style={{fontSize: '12px'}}>Status REAPPO</span></h6>
                    {new Date(appo.renovacao.data) < new Date()
                        ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
                        :<SubtleBadge bg='success'>Vigente</SubtleBadge>
                    }
                </Col>
                <Col lg={2} xl={2} sm={2}>
                    <Info title="Dias restantes REAPPO" description={dif(appo.renovacao.data)} />
                </Col>
                <Col lg={4} xl={4} sm={4}>
                    <Info title="Criado Por" description={appo.info_user.first_name + " " +appo.info_user.last_name + " em " + 
                    format(new Date(appo.created_at), 'dd/MM/yyyy HH:mm')} />
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
        <Row className="d-flex ps-3">
        {appo && appo.file &&
            <Col lg={'auto'} xxl={'auto'} className="p-0 me-2">
                <Link to={`${appo.file}`} target="__blank" className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faFilePdf} className="me-2"></FontAwesomeIcon>Arquivo PDF
                </Link>
            </Col>
            }
        {appo && coordenadas && coordenadas.length > 0 &&
            <Col lg={'auto'} xxl={'auto'} className="p-0 me-2">
                <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/appo/kml/${appo.id}`} 
                 className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                </Link>
             </Col>        
        }
            <Col lg={'auto'} xxl={'auto'} className="p-0 me-2">
                <Link to={`/ambiental/inema/appos/edit/${uuid}`} className="btn btn-primary py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faPen} className="me-2"></FontAwesomeIcon>Editar Processo
                </Link>
            </Col>
            <Col lg={'auto'} xxl={'auto'} className="p-0 me-2">
                <a className="btn btn-danger py-0 px-2" onClick={() => {setModal(true)}}>
                    <FontAwesomeIcon icon={faTrashCan} className="me-2"></FontAwesomeIcon>Excluir Processo
                </a>
            </Col>
        </Row>
      {appo && coordenadas ? (
        coordenadas.length > 0 && (
            <GoogleMap
                initialCenter={{
                    lat: Number(coordenadas[0].latitude_gd),
                    lng: Number(coordenadas[0].longitude_gd)
                }}
                mapStyle="Default"
                className="rounded-soft mt-2 google-maps container-map"
                token_api={appo.token_apimaps}
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
      {appo && (
        <ModalDelete show={modal} link={`${process.env.REACT_APP_API_URL}/environmental/inema/appos/${appo.uuid}`} 
            close={() => setModal(false)} update={del}
        />
      )}

    </>
    );
  };
  