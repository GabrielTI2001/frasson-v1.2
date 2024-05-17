import React, { useEffect, useState} from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { Button, Form, Col, Row, Table} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import GoogleMap from '../../../components/map/GoogleMap';
import MapInfo from './MapInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

const KMLToCoordinate = () => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formKML, setFormKML] = useState({})
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const [dados, setDados] = useState({coordinates:[]})
  const [tokenmaps, setTokenMaps] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/services/tools/kml/coordenadas`

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
  };


  const handleKMLsubmit = async e => {
    setMessage(null)
    e.preventDefault();
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
          Extrair Coordenadas
        </li>    
      </ol>
      <div className='fs--2 mb-3' style={{marginTop: '-0.3rem'}}>
        Esta ferramenta executa a extração das coordenadas de um arquivo KML, podendo ser Polígono, Caminho ou Pontos.
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
          <Button
            className="w-40"
            type="submit"
            style={{marginTop: '0px'}}
          >
            Extrair Coordenadas
          </Button>
        </Form.Group>    
      </Form>
      <div class="mb-2 d-flex justify-content-start" style={{marginTop: '-0.5rem'}}>
        <form action={`${process.env.REACT_APP_API_URL}/services/tools/convert/kmlToxlsx`} method="POST" class="col-auto me-2">
            <input type="hidden" id="html_content" name="html_content" value="" />
            <button type="submit" class="badge btn btn-sm btn-success shadow-none fs-xs fw-normal">
              <FontAwesomeIcon icon={faFileExcel} className='me-1'/>Download Excel
            </button>
        </form>
        <form action={`${process.env.REACT_APP_API_URL}/services/tools/convert/toxlsbnb`} method="POST">
            <input type="hidden" id="html_content2" name="html_content" value="" />
            <button type="submit" class="badge btn btn-sm btn-success shadow-none fs-xs fw-normal">
              <FontAwesomeIcon icon={faFileExcel} className='me-1'/>Download Formato BNB
            </button>
        </form>
    </div>
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
    </>
  );
};

export default KMLToCoordinate;
