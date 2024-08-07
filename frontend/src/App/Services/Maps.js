import React, { useEffect, useState} from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { Col, Row} from 'react-bootstrap';
import { useAppContext } from '../../Main';
import GoogleMap from '../../components/map/GoogleMap';
import CustomBreadcrumb from '../../components/Custom/Commom';

const ServicesMaps = () => {
  const {config: {theme}} = useAppContext();
  const [tokenmaps, setTokenMaps] = useState()

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
      <CustomBreadcrumb >
        <span className="breadcrumb-item fw-bold" aria-current="page">
          Mapas
        </span>    
      </CustomBreadcrumb>
      <Row xl={1} sm={1} style={{height: '66vh'}} className='gy-1 d-flex align-items-start mt-2'>
        <Col>
          {tokenmaps && 
          <GoogleMap
            initialCenter={{
              lat: -13.7910,
              lng: -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-0 google-maps-l container-map-l"
            token_api={tokenmaps}
            mapTypeId='satellite'
          >
          </GoogleMap>} 
        </Col>
      </Row>
    </>
  );
};

export default ServicesMaps;
