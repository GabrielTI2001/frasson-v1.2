import React, { useEffect, useState} from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { Form, Col, Row } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import GoogleMap from '../../../components/map/GoogleMap';
import MapInfo from './MapInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faVectorSquare, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const InsertPoints = () => {
  const {config: {theme}} = useAppContext();
  const [formData, setFormData] = useState({})
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const [coordenadas, setCoordenadas] = useState([])
  const [poligonos, setPoligonos] = useState([])
  const [tokenmaps, setTokenMaps] = useState()

  const createPolygon = () => {
    if (coordenadas.length >= 3)
      setPoligonos([{points:coordenadas}])
  };

  const handleApi = async (type) => {
    const link = `${process.env.REACT_APP_API_URL}/services/tools/LatLong/kml/${type === 'point' ? 'point' : 'polygon'}`
    const obj = type === 'point' ? {coordinates: coordenadas} : poligonos
    const method = 'POST'
    try {
        const response = await fetch(link, {
          method: method,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(obj)
        });
        const blob = await response.blob();
        if(response.status === 200){
          const filename = type === 'point' ? `Points_${new Date().getTime()}.kml` : `Polygon_${new Date().getTime()}.kml`;
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        else if (response.status === 401){
          localStorage.setItem("login", JSON.stringify(false));
          localStorage.setItem('token', "");
          RedirectToLogin(navigate);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };


  
  function isMarkerAlreadyExists(lat, lng) {
    const s = coordenadas.filter(c => c.lat === lat && c.lng === lng)
    return s.length > 0 ? true : false; // No marker with the same coordinates found
  }

  function convertDMSToDD(dmsLat, dmsLng) {
    // Splitting DMS strings into components
    const latComponents = dmsLat.match(/-?\d+\.\d+|-?\d+/g);
    const lngComponents = dmsLng.match(/-?\d+\.\d+|-?\d+/g);

    if (!latComponents || !lngComponents) {
        return null; // Invalid format
    }

    const latDegrees = parseFloat(latComponents[0]);
    const latMinutes = parseFloat(latComponents[1] || 0);

    let latSeconds = 0;
    if (latComponents[2]) {
        latSeconds = parseFloat(latComponents[2].replace(',', '.')) || 0;
    }

    const lngDegrees = parseFloat(lngComponents[0]);
    const lngMinutes = parseFloat(lngComponents[1] || 0);

    let lngSeconds = 0;
    if (lngComponents[2]) {
        lngSeconds = parseFloat(lngComponents[2].replace(',', '.')) || 0;
    }

    const latDecimal = latDegrees + (latDegrees < 0 ? -1 : 1) * (latMinutes / 60 + latSeconds / 3600);
    const lngDecimal = lngDegrees + (lngDegrees < 0 ? -1 : 1) * (lngMinutes / 60 + lngSeconds / 3600);

    return { lat: latDecimal, lng: lngDecimal };
  }


  const handleSubmit = async e => {
    if (formData.latitude && formData.longitude){
      const ddRegex = /^-?\d+(?:[.,]\d+)?$/;
      const dmsRegex = /^-?\d{1,2}(?:°\d{1,2}'(?:\d{1,2}(?:[.,]\d+)?)?"?)?$/;

      var lat = formData.latitude
      var lng = formData.longitude
      lat = lat.replace(/\s+/g, '');
      lng = lng.replace(/\s+/g, '');
      var location;

      if (ddRegex.test(lat) && ddRegex.test(lng)) {
          // Decimal degrees format
          location = { lat: parseFloat(lat), lng: parseFloat(lng) };
          if (isMarkerAlreadyExists(location.lat, location.lng)) toast.error("Coordenada já existe")
          else setCoordenadas([...coordenadas, location])
      } else if (dmsRegex.test(lat) && dmsRegex.test(lng)) {
          // Degrees, minutes, seconds format
          location = convertDMSToDD(lat, lng);
          if (isMarkerAlreadyExists(location.lat, location.lng)) toast.error("Coordenada já existe")
          else setCoordenadas([...coordenadas, location])
      } else {
          toast.error("Formato Inválido de Coordenada")
      }
    }
    e.preventDefault();
  };

  const handleFieldchange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.value})
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
      <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
        <li className="breadcrumb-item fw-bold">
          <Link className="link-fx text-primary" to={'/services/tools'}>Ferramentas</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
          Inserir Coordenadas
        </li>    
      </ol>
      <div className='fs--2 mb-3' style={{marginTop: '-0.3rem'}}>
        Insira as coordenadas e baixe o KML dos pontos ou do polígono...
      </div>
      <Form className='row mb-1' encType='multipart/form-data'>
        <Form.Group className="mb-0" as={Col} xl={6}>
          <Form.Label className='fw-bold mb-1'>Latitude*</Form.Label>
          <Form.Control
            name="latitude"
            onChange={handleFieldchange}
            type="text"
          />
        </Form.Group>
        <Form.Group className="mb-0" as={Col} xl={6}>
          <Form.Label className='fw-bold mb-1'>Longitude*</Form.Label>
          <Form.Control
            name="longitude"
            onChange={handleFieldchange}
            type="text"
          />
        </Form.Group>  
      </Form>
      <div className="mb-2 d-flex justify-content-start mt-3">
        <Col xl='auto me-2'>
          <button type="submit" className="badge btn btn-sm btn-primary shadow-none fs-xs fw-normal" onClick={handleSubmit}>
            <FontAwesomeIcon icon={faFileExcel} className='me-1'/>Add Point
          </button>
        </Col>
        <Col xl='auto me-2'>
          <button type="submit" className="badge btn btn-sm btn-warning shadow-none fs-xs fw-normal" onClick={createPolygon}>
            Create Polygon
          </button>
        </Col>
        <Col xl='auto me-2'>
          <button type="submit" className="badge btn btn-sm btn-secondary shadow-none fs-xs fw-normal" onClick={() => handleApi('point')}>
            <FontAwesomeIcon icon={faLocationDot} className='me-1'/>KML Points
          </button>
        </Col>
        <Col xl='auto me-2'>
          <button type="submit" className="badge btn btn-sm btn-info shadow-none fs-xs fw-normal" onClick={() => handleApi('polygon')}>
            <FontAwesomeIcon icon={faVectorSquare} className='me-1'/>KML Polygon
          </button>
        </Col>
      </div>
      <Row xl={1} sm={1} style={{height: '66vh'}} className='gy-1 d-flex align-items-start mt-2'>
        <Col>
          {tokenmaps && 
          <GoogleMap
            initialCenter={{
              lat: coordenadas.length > 0 ? coordenadas[0].lat : -13.7910,
              lng: coordenadas.length > 0 ? coordenadas[0].lng : -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-0 google-maps-l container-map-l"
            token_api={tokenmaps}
            mapTypeId='satellite'
            coordenadas={[...coordenadas.map(c => ({latitude_gd:c.lat, longitude_gd:c.lng}))]}
            polygons={poligonos}
          >
            <MapInfo />
          </GoogleMap>} 
        </Col>
      </Row>
    </>
  );
};

export default InsertPoints;
