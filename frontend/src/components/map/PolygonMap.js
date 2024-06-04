import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import googleMapStyles from '../../helpers/googleMapStyles';
import {
  GoogleMap as ReactGoogleMap,
  Polygon,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';
import { useAppContext } from '../../Main';
import { useNavigate } from 'react-router-dom';

const PolygonMap = ({
  mapStyle,
  initialCenter,
  darkStyle,
  className,
  children,
  token_api,
  polygons,
  link,
  urlparams
}) => {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: token_api
  });

  const {
    config: { isDark }
  } = useAppContext();

  const [mapStyles, setMapStyles] = useState(mapStyle);
  const [mapOptions, setMapOptions] = useState({
    mapTypeControl: true,
    mapTypeId: 'satellite',
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    zoom: 8,
    center: initialCenter,
    styles: googleMapStyles[mapStyles]
  });

  const [infoPonto, setInfoPonto] = useState()
  const token = localStorage.getItem("token")
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkStyle && isDark) setMapStyles(darkStyle);
    else setMapStyles(mapStyle);
  }, [isDark]);

  const handlePolygonClick = (event, coordId) => {
    const getInfo = async (id) => {
      try{
          const response = await fetch(`${link}${id}${urlparams ? urlparams : ''}`, {
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
              setInfoPonto(data)
              setInfoWindowPosition(event.latLng); // Defina a posição do InfoWindow para a posição do clique
          }
      } catch (error){
          console.error("Erro: ",error)
      }
    }
    if (link){
      getInfo(coordId);
    }
    else{

    }
  };

  useEffect(() => {
    setMapOptions(prevOptions => ({
      ...prevOptions,
      center: initialCenter
    }));
  }, [initialCenter]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className={`${className} row-12`}>
      <ReactGoogleMap
        options={mapOptions}
        mapContainerStyle={{
          width: '100%',
          height: '100%',
          display: 'inline-block'
        }}
        className='col'
      >
        {polygons && polygons.map((c, index) =>
          <Polygon 
            key={index}
            path={c.path}
            options={{
              strokeColor: '#0c4106',
              strokeWeight: 1,
              fillColor: '#6be95d'
            }}
            onClick={(event) => handlePolygonClick(event, c.id)}
          >
          </Polygon>
        )}
        {infoPonto && link && children &&(
          <InfoWindow
            position={infoWindowPosition} 
            onCloseClick={() => setInfoPonto(null)}
          >
            {React.cloneElement(children, { infoponto:infoPonto })}
          </InfoWindow>
        )}
      </ReactGoogleMap>
    </div>
  );
};

PolygonMap.propTypes = {
  mapStyle: PropTypes.oneOf([
    'Default',
    'Gray',
    'Midnight',
    'Hopper',
    'Beard',
    'AssassianCreed',
    'SubtleGray',
    'Tripitty',
    'Cobalt'
  ]),
  darkStyle: PropTypes.oneOf([
    'Default',
    'Gray',
    'Midnight',
    'Hopper',
    'Beard',
    'AssassianCreed',
    'SubtleGray',
    'Tripitty',
    'Cobalt'
  ]),
  className: PropTypes.string,
  children: PropTypes.node,
  initialCenter: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  })
};

export default PolygonMap;
