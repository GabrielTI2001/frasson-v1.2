import { useEffect, useState} from "react";
import React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Button, InputGroup, FormControl, Row, Col, Modal, CloseButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import GoogleMap from "../../../components/map/GoogleMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import {MapInfoDetail} from "./MapInfo";
import NewRequerimento from "./New";
import { HandleSearch } from "../../../helpers/Data";
import ViewRequerimentoAPPO from "./View";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const initData = {'appo': {title:'APPO', textpoint: 'Poços '}, 
    'outorga': {title:'Outorga', textpoint: 'pontos de outorga '}
}

const MapaPontosRequerimento = ({type}) => {
    const [processos, setProcessos] = useState()
    const [coordenadas, setCoordenadas] = useState()
    const [search, setSearch] = useState('')
    const user = JSON.parse(localStorage.getItem("user"))
    const [tokenmaps, setTokenMaps] = useState()
    const [modalnew, setModalNew] = useState(false)
    const [modal, setModal] = useState(false)
    const navigate = useNavigate();
    const {uuid} = useParams()
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/${type}/coordenadas-detail/` 

    const handleChange = (event) => {
        const { value } = event.target;
        setSearch(value);
        if (value !== ''){
          getCoordenadas(value); 
          getprocessos(value)
        }
    };

    const reducer = (type, data, points) =>{
        if (type == 'add'){
            setProcessos([...processos, data])
            setModalNew(false)
            setCoordenadas([...coordenadas, ...points])
        }
        else if (type === 'edit' && processos){
            setProcessos([...processos.map(reg =>
                parseInt(reg.id) === parseInt(data.id) ? data : reg
            )])
        }
        else if (type === 'delete' && processos){
            setCoordenadas()
        }
    }

    const getCoordenadas = async (search) => {
        const status = await HandleSearch(search, `environmental/inema/requerimento/${type}/coordenadas`, setCoordenadas)
        if (status === 401){ RedirectToLogin(navigate)} 
    }

    const getprocessos = async (search) =>{
        const status = await HandleSearch(search, `environmental/inema/requerimento/${type}s`, setProcessos)
        if (status === 401){ RedirectToLogin(navigate)} 
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_processos_outorga") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        if (uuid){
            setModal(true)
        }
        else{
            setModal(false)
            const getTokenMaps = async () => {
                try{
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/token/maps/`, {
                        method: 'GET'
                    });
                    if (response.status === 200){
                        const data = await response.json();
                        setTokenMaps(data.token)
                    }
                } catch (error){
                    console.error("Erro: ",error)
                }
            }
            if (!coordenadas){
                getCoordenadas('')
                getprocessos('')
            }
            if (!tokenmaps){
                getTokenMaps()
            }
        }
    },[uuid, coordenadas])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={`/ambiental/inema/requerimentos`}>Requerimentos Inema</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                {initData[type].title}
            </li>             
        </ol>
        <Row className="flex-end-center justify-content-start mb-3 gy-1">
            <Col lg={6} xxl={6}>
                <InputGroup className='position-relative'>
                    <FormControl
                        value={search}
                        onChange={handleChange}
                        size="sm"
                        id="search"
                        placeholder='Requerente, CPF/CNPJ, Requerimento, N° Processo, Município'
                        type="search"
                        className="shadow-none"
                    />
                </InputGroup>
            </Col>
            <Col>
                <Link className="btn btn-sm btn-primary" onClick={() => setModalNew(true)}>
                    <FontAwesomeIcon className="me-2" icon={faLocationDot} />Novo Requerimento
                </Link>
            </Col>
        </Row>
        <div className='text-end info p-2 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
        {search !== '' &&
            <Col lg={'auto'} xxl={'auto'} className="me-0 pe-0">
                <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/${type}/map/kml/?search=${search}`} 
                 className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                </Link>
             </Col>        
        }
            <Col className="fw-bold">{coordenadas && (coordenadas.length)} ponto(s) em {processos && (processos.length)} requerimento(s)</Col>
        </div>
        {coordenadas && tokenmaps ? ( coordenadas.length > 0 && (
            <GoogleMap
                initialCenter={{
                    lat: Number(coordenadas[0].latitude_gd),
                    lng: Number(coordenadas[0].longitude_gd)
                }}
                mapStyle="Default"
                className="rounded-soft mt-0 google-maps-l container-map-l"
                token_api={tokenmaps}
                mapTypeId='satellite'
                coordenadas={coordenadas}
                link={link}
            >
                < MapInfoDetail type={type}/>
            </GoogleMap>
            )) : 
            <div>
                <Placeholder animation="glow">
                    <Placeholder xs={7} /> <Placeholder xs={4} /> 
                    <Placeholder xs={4} />
                    <Placeholder xs={6} /> <Placeholder xs={8} />
                </Placeholder>    
            </div>   
        }
        <NewRequerimento show={modalnew} close={() => setModalNew(false)} reduce={reducer}/>
        <ViewRequerimentoAPPO show={modal} close={() => setModal(false)} reducer={reducer}/>
    </>
    );
  };
  
  export default MapaPontosRequerimento;
  