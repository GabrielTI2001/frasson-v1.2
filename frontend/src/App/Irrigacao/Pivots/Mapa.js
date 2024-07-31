import { useEffect, useState} from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button, InputGroup, FormControl, Row, Col, Modal, CloseButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import GoogleMap from "../../../components/map/GoogleMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import {MapInfoDetail} from "./MapInfo";
import CircleMap from "../../../components/map/CircleMap";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const MapaPivots = () => {
    const [coordenadas, setCoordenadas] = useState()
    const [search, setSearch] = useState('')
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [tokenmaps, setTokenMaps] = useState()
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/irrigation/pivots-points/` 

    const handleChange = (event) => {
        const { value } = event.target;
        setSearch(value);
        if (value !== ''){
          getCoordenadas(value); 
        }
    };

    const getCoordenadas = async (search) => {
        const link = search ? `?search=${search}` : '';
        const url = `${process.env.REACT_APP_API_URL}/irrigation/pivots-points/${link}`
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
                RedirectToLogin(navigate);
            }
            if ((user.permissions && user.permissions.indexOf("view_cadastro_pivots") === -1) && !user.is_superuser){
                navigate("/error/403")
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
        }
        if (!tokenmaps){
            getTokenMaps()
        }
    }, [coordenadas])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={`/irrigation/pivots`}>Pivots</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Mapa Pivots
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
                        placeholder='Proprietário, Localização, Município...'
                        type="search"
                        className="shadow-none"
                    />
                </InputGroup>
            </Col>
            <Col>
                <Link className="btn btn-sm btn-primary">
                    <FontAwesomeIcon className="me-2" icon={faLocationDot} />Novo Pivot
                </Link>
            </Col>
        </Row>
        <div className='text-end info p-2 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
        {search !== '' &&
            <Col lg={'auto'} xxl={'auto'} className="me-0 pe-0">
                <Link to={`${process.env.REACT_APP_API_URL}/pivot/dashboard/kml/?search=${search}`} 
                 className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                </Link>
             </Col>        
          }
            <Col className="fw-bold">{coordenadas && (coordenadas.length)} pivots</Col>
        </div>
        {tokenmaps && coordenadas? 
            <CircleMap
                initialCenter={{
                    lat: coordenadas.length > 0 ? Number(coordenadas[0].lat_center_gd) : -13.7910,
                    lng: coordenadas.length > 0 ? Number(coordenadas[0].long_center_gd) : -45.6814
                }}
                mapStyle="Default"
                className="rounded-soft mt-0 google-maps-l container-map-l"
                token_api={tokenmaps}
                mapTypeId='satellite'
                circles={[...coordenadas.map(c => ({id:c.id, radius:Number(c.raio_irrigado_m), 
                    center:{lat:Number(c.lat_center_gd), lng:Number(c.long_center_gd)}
                }))]}
                zoom={10}
                link={link}
            >
                < MapInfoDetail/>
            </CircleMap>
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
  
  export default MapaPivots;
  