import { useEffect, useState} from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button, InputGroup, FormControl, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import PolygonMap from "../../../components/map/PolygonMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";
import {MapInfoDetailASV} from "./MapInfo";
import { Card } from "react-bootstrap";

const MapaAreasASV = () => {
    const channel = new BroadcastChannel('meu_canal');
    const [processos, setProcessos] = useState()
    const [coordenadas, setCoordenadas] = useState()
    const [search, setSearch] = useState('')
    const token = localStorage.getItem("token")
    const [tokenmaps, setTokenMaps] = useState()
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/` 

    const handleChange = (event) => {
        const { value } = event.target;
        setSearch(value);
        if (value !== ''){
          getCoordenadas(value); 
          getprocessos(value)
        }
      };

    const getCoordenadas = async (search) => {
        const params = search ? `?search=${search}` : '';
        const url = `${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas/${params}`
        try{
            const response = await fetch(url, {
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
                setCoordenadas([...data.map(d => d)])
            }
            else if (response.status === 404){
                setCoordenadas([])
            }
            
        } catch (error){
            console.error("Erro: ",error)
        }
    }

    const getprocessos = async (search) =>{
        const url = `${process.env.REACT_APP_API_URL}/environmental/inema/asvs/?search=${search}`
        try{
            const response = await fetch(url, {
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
                setProcessos(data)
            }
        } catch (error){
            console.error("Erro: ",error)
        }
    }

    useEffect(() =>{
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
            getCoordenadas()
            getprocessos('')
        }
        if (!tokenmaps){
            getTokenMaps()
        }
    }, [])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/ambiental/inema/asv'}>Processos ASV</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Mapa
            </li>             
        </ol>
        <Row className="flex-end-center justify-content-start mb-3">
            <Col lg={6} xxl={6}>
                <InputGroup className='position-relative'>
                    <FormControl
                        value={search}
                        onChange={handleChange}
                        size="sm"
                        id="search"
                        placeholder='Requerente, CPF/CNPJ, N° Processo, Município...'
                        type="search"
                        className="shadow-none"
                    />
                    <Button
                        size="xl"
                        variant="outline-secondary"
                        className="border-300 hover-border-secondary"
                    >
                        <FontAwesomeIcon icon={faSearch} className="fs--2" />
                    </Button>
                </InputGroup>
            </Col>
        </Row>
        <div className='text-end info p-2 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
        {search !== '' && coordenadas.length > 0 &&
            <Col lg={'auto'} xxl={'auto'} className="me-0 pe-0">
                <Link to={``} 
                 className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>
                </Link>
             </Col>        
          }
            <Col className="fw-bold">
                {coordenadas && Number(coordenadas.reduce((total, objeto) => total + objeto.area_total, 0)).toLocaleString('pt-BR')} ha
            em {processos && (processos.length)} portarias de ASV</Col>
        </div>
        {coordenadas && tokenmaps ? ( coordenadas.length > 0 && (
        <PolygonMap
            initialCenter={{
                lat: coordenadas.length > 0 ? Number(coordenadas[0].kml[0]['lat']) : -13.7910,
                lng: coordenadas.length > 0 ? Number(coordenadas[0].kml[0]['lng']) : -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-2 google-maps container-map"
            token_api={tokenmaps}
            mapTypeId='satellite'
            polygons={coordenadas}
            link={link}
        >
            <MapInfoDetailASV/>
        </PolygonMap>
        )) : 
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
  
  export default MapaAreasASV;
  