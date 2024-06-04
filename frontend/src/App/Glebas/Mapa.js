import { useEffect, useState} from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button, InputGroup, FormControl, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import PolygonMap from "../../components/map/PolygonMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";

const MapaGlebas = () => {
    const [glebas, setGlebas] = useState()
    const [search, setSearch] = useState('')
    const token = localStorage.getItem("token")
    const [tokenmaps, setTokenMaps] = useState()
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/glebas/coordenadas/` 

    if (glebas){console.log(glebas.map(g =>({id:g.id, path:g.coordenadas.map(c=> ({lat:c.lat, lng:c.lng}))})))}

    const handleChange = (event) => {
        const { value } = event.target;
        setSearch(value);
        getGlebas(value)
      };

    const getGlebas= async (search) =>{
        const url = `${process.env.REACT_APP_API_URL}/glebas/coordenadas/?search=${search}`
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
                setGlebas(data)
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

        if (!glebas){
            getGlebas('')
        }
        if (!tokenmaps){
            getTokenMaps()
        }
    }, [])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/glebas'}>Glebas</Link>
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
                        placeholder='Cliente, Propriedade, Município ou Gleba...'
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
        {search !== '' && glebas.length > 0 &&
            <Col lg={'auto'} xxl={'auto'} className="me-0 pe-0">
                <Link to={``} 
                 className="btn btn-info py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"/>KML
                </Link>
             </Col>        
          }
            <Col className="fw-bold"> {glebas && glebas.length} Gleba(s)</Col>
        </div>
        {glebas && tokenmaps ? (
        <PolygonMap
            initialCenter={{
                lat: glebas.length > 0 ? Number(glebas[0].coordenadas[0]['lat']) : -13.7910,
                lng: glebas.length > 0 ? Number(glebas[0].coordenadas[0]['lng']) : -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-2 google-maps container-map"
            token_api={tokenmaps}
            mapTypeId='satellite'
            polygons={glebas.map(g =>({id:g.id, path:g.coordenadas.map(c=> ({lat:c.lat, lng:c.lng}))}))}
            link={link}
        >
        </PolygonMap>
        ) : 
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
  
  export default MapaGlebas;
  