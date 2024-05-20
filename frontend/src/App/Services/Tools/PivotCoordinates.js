import React, { useEffect, useState} from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { Button, Form, Col, Row, Table, Spinner, Placeholder} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import GoogleMap from '../../../components/map/GoogleMap';
import MapInfo from './MapInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';

const PivotCoordinates = () => {
  const {config: {theme}} = useAppContext();
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const [dados, setDados] = useState({coordinates:[]})
  const [tokenmaps, setTokenMaps] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/services/tools/pivot`

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
          navigate("/auth/login");
        }
        else if (response.status === 201 || response.status === 200){
          setDados({...data})
        }
    } catch (error) {
        console.error('Erro:', error);
    }
    setIsLoading(false)
  };


  const handleSubmit = async e => {
    setMessage(null)
    setIsLoading(true)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    await handleApi(formDataToSend);
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
    const table = document.querySelector("table").outerHTML;
    document.getElementById("html_content").value = table;
    document.getElementById("html_content2").value = table;
  },[dados])

  return (
    <>
      <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
        <li className="breadcrumb-item fw-bold">
          <Link className="link-fx text-primary" to={'/services/tools'}>Ferramentas</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
          Gerar Coordenadas Pivot
        </li>    
      </ol>
      <div className='fs--2 mb-3' style={{marginTop: '-0.3rem'}}>
        Esta ferramenta gera uma quantidade específica de coordenadas no limite da área do pivô.
      </div>
      <Form onSubmit={handleSubmit} className='row mb-2' encType='multipart/form-data'>
        <Form.Group className="mb-0" as={Col} xl={2}>
          <Form.Label className='fw-bold mb-1'>Latitude Centro (GD)*</Form.Label>
          <Form.Control
            name="latitude_gd"
            onChange={handleFieldchange}
            type="text"
          />
          <label className='text-danger'>{message ? message.latitude_gd : ''}</label>
        </Form.Group>
        <Form.Group className="mb-0" as={Col} xl={2}>
          <Form.Label className='fw-bold mb-1'>Longitude Centro (GD)*</Form.Label>
          <Form.Control
            name="longitude_gd"
            onChange={handleFieldchange}
            type="text"
          />
          <label className='text-danger'>{message ? message.longitude_gd : ''}</label>
        </Form.Group>
        <Form.Group className="mb-0" as={Col} xl={2}>
          <Form.Label className='fw-bold mb-1'>Área (GD)*</Form.Label>
          <Form.Control
            name="area_ha"
            onChange={handleFieldchange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_ha : ''}</label>
        </Form.Group>
        <Form.Group className="mb-0" as={Col} xl={2}>
          <Form.Label className='fw-bold mb-1'>Quantidade Pontos*</Form.Label>
          <Form.Control
            name="quantidade"
            onChange={handleFieldchange}
            type="number"
          />
          <label className='text-danger'>{message ? message.quantidade : ''}</label>
        </Form.Group>
        <Form.Group className={`d-flex align-items-center`} as={Col} xl={2}>
          {!isLoading ?
          <Button
            className="w-40"
            type="submit"
          >
            Gerar Coordenadas
          </Button>
          : <div className="text-center"><Spinner></Spinner></div>}
        </Form.Group>    
      </Form>
      <div className="mb-2 d-flex justify-content-start mt-1">
        <form action={`${process.env.REACT_APP_API_URL}/services/tools/convert/kmlToxlsx`} method="POST" className="col-auto me-2">
            <input type="hidden" id="html_content" name="html_content" value="" />
            <button type="submit" className="badge btn btn-sm btn-success shadow-none fs-xs fw-normal"
              disabled={dados.coordinates.length === 0}
            >
              <FontAwesomeIcon icon={faFileExcel} className='me-1'/>Download Excel
            </button>
        </form>
        <form action={`${process.env.REACT_APP_API_URL}/services/tools/pivot/downloadKML`} method="POST">
            <input type="hidden" id="html_content2" name="html_content" value="" />
            <button type="submit" className="badge btn btn-sm btn-primary shadow-none fs-xs fw-normal"
              disabled={dados.coordinates.length === 0}
            >
              <FontAwesomeIcon icon={faCloudArrowDown} className='me-1'/>Download KML
            </button>
        </form>
      </div>
      {!isLoading ? 
      <Row xl={2} sm={1} style={{height: '66vh'}} className='gy-1 d-flex align-items-start mt-2'>
        <Col>
          <Table responsive>
              <thead className="bg-300">
                  <tr>
                      <th scope="col" className='fs--2'>Ponto</th>
                      <th scope="col" className='fs--2'>Latitude GD</th>
                      <th scope="col" className='fs--2'>Longitude GD</th>
                      <th scope="col" className='fs--2'>Latitude GMS</th>
                      <th scope="col" className='fs--2'>Longitude GMS</th>
                      <th scope="col" className='fs--2'>Latitude UTM</th>
                      <th scope="col" className='fs--2'>Longitude UTM</th>
                      <th scope="col" className='fs--2'>Altitude</th>
                  </tr>
              </thead>
              <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
              {dados.coordinates.map(c =>(
                <tr key={c.number} style={{cursor:'auto'}}>
                  <td className='fs--2'>{c.number}</td>
                  <td className='fs--2'>{c.lat_gd}</td>
                  <td className='fs--2'>{c.lng_gd}</td>
                  <td className='fs--2'>{c.lat_gms}</td>
                  <td className='fs--2'>{c.lng_gms}</td>
                  <td className='fs--2'>{c.lat_utm}</td>
                  <td className='fs--2'>{c.lng_utm}</td>
                  <td className='fs--2'>{c.elevation}</td>
                </tr>
              ))} 
              </tbody>
          </Table>    
        </Col>
        <Col>
          {tokenmaps && 
          <GoogleMap
            initialCenter={{
              lat: dados.coordinates.length > 0 ? dados.coordinates[0].lat_gd : -13.7910,
              lng: dados.coordinates.length > 0 ? dados.coordinates[0].lng_gd : -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-0 google-maps-s container-map-s"
            token_api={tokenmaps}
            mapTypeId='satellite'
            coordenadas={[...dados.coordinates.map(c => ({latitude_gd:c.lat_gd, longitude_gd:c.lng_gd, id:c.number, ...c}))]}
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

export default PivotCoordinates;
