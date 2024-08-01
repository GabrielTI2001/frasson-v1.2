import React, { useEffect, useState} from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { Button, Form, Col, Row, Spinner, Placeholder} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import GoogleMap from '../../../components/map/GoogleMap';
import MapInfo from './MapInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowDown, faMapLocation } from '@fortawesome/free-solid-svg-icons';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const KMLPolygon = () => {
  const {config: {theme}} = useAppContext();
  const [isLoading, setIsLoading] = useState(false)
  const [formKML, setFormKML] = useState({})
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const [dados, setDados] = useState({coordinates:[]})
  const [tokenmaps, setTokenMaps] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/services/tools/kml/polygon/`
    const method = 'POST'
    try {
        const response = await fetch(link, {
          method: method,
          headers: {
              'Authorization': `Bearer ${token}`
          },
          body: dadosform
        });
        const data = await response.json();
        if(response.status === 400){
          setMessage({...data})
        }
        else if (response.status === 401){
          localStorage.setItem("login", JSON.stringify(false));
          localStorage.setItem('token', "");
          RedirectToLogin(navigate);
        }
        else if (response.status === 201 || response.status === 200){
          setDados({...data})
        }
    } catch (error) {
        console.error('Erro:', error);
    }
    setIsLoading(false)
  };
  const downloadKML = async () => {
    const link = `${process.env.REACT_APP_API_URL}/services/tools/kml/polygon/download`
    try {
        const response = await fetch(link, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({coordinates: dados.coordinates})
        });
        const blob = await response.blob();
        if(response.status === 200){
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `Polygon_${new Date().getTime()}.kml`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };


  const handleKMLsubmit = async e => {
    e.preventDefault();
    setMessage(null)
    setIsLoading(true)
    const formDataToSend = new FormData();
    for (const key in formKML) {
      formDataToSend.append(key, formKML[key]);
    }
    await handleApi(formDataToSend);
  };

  const handleFilechange = (e) => {
    setFormKML({...formKML, [e.target.name]:e.target.files[0]})
  };

  useEffect(()=>{
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
    if (!tokenmaps) getTokenMaps()
  },[])

  return (
    <>
      <ol className="breadcrumb breadcrumb-alt fs-xs mb-2">
        <li className="breadcrumb-item fw-bold">
          <Link className="link-fx text-primary" to={'/services/tools'}>Ferramentas</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
          Mapa Polígono
        </li>    
      </ol>
      <div className='fs--2 mb-2' style={{marginTop: '-0rem'}}>
        Esta ferramenta carrega o arquivo KML de um polígono e permite o download em formato compatível com o GeoMapa Rural do Banco do Brasil.
      </div>
      <Form onSubmit={handleKMLsubmit} className='row' encType='multipart/form-data'>
        <Form.Group className="mb-0" as={Col} lg={5}>
          <Form.Label className='fw-bold mb-1'>Arquivo KML*</Form.Label>
          <Form.Control
            name="file"
            onChange={handleFilechange}
            type="file"
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>
        <Form.Group className={`d-flex align-items-center`} as={Col} lg={3}>
          {!isLoading ?
          <Button
            className="w-40"
            type="submit"
            style={{marginTop: '0px'}}
          >
            <FontAwesomeIcon icon={faMapLocation} className='me-1' />Carregar Mapa
          </Button>
          : <div className="text-center"><Spinner></Spinner></div>}
        </Form.Group>    
      </Form>
      <div className="mb-2 d-flex justify-content-start" style={{marginTop:'-0.4rem'}}>
        <Col xl='auto me-2'>
          <button type="submit" className="badge btn btn-sm btn-info shadow-none fs-xs fw-normal" onClick={downloadKML}
            disabled={dados.coordinates.length === 0}
          >
            <FontAwesomeIcon icon={faCloudArrowDown} className='me-1'/>KML Polygon
          </button>
        </Col>
      </div>
      {!isLoading ?
      <Row xl={1} sm={1} style={{height: '66vh'}} className='gy-1 d-flex align-items-start mt-2'>
        <Col>
          {tokenmaps && 
          <GoogleMap
            initialCenter={{
              lat: dados.coordinates.length > 0 ? dados.coordinates[0].lat : -13.7910,
              lng: dados.coordinates.length > 0 ? dados.coordinates[0].lng : -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-0 google-maps-l container-map-l"
            token_api={tokenmaps}
            mapTypeId='satellite'
            polygons={[{points:dados.coordinates}]}
            infounlink
          >
            <MapInfo />
          </GoogleMap>} 
        </Col>
      </Row>
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

export default KMLPolygon;
