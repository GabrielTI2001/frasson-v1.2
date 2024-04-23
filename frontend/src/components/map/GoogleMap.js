import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import googleMapStyles from '../../helpers/googleMapStyles';
import {
  GoogleMap as ReactGoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';
import { useAppContext } from '../../Main';
import { useNavigate } from 'react-router-dom';

const GoogleMap = ({
  mapStyle,
  initialCenter,
  darkStyle,
  className,
  children,
  token_api,
  coordenadas,
  link,
  urlparams,
  colorpoint
}) => {

  const mapMarker = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'

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

  const [activeMarker, setActiveMarker] = useState(null);

  const [infoPonto, setInfoPonto] = useState()

  const token = localStorage.getItem("token")
  const navigate = useNavigate();

  useEffect(() => {
    if (darkStyle && isDark) setMapStyles(darkStyle);
    else setMapStyles(mapStyle);
  }, [isDark]);

  useEffect(() => {
    setMapOptions(prevOptions => ({
      ...prevOptions,
      center: initialCenter
    }));
  }, [initialCenter]);

  const handleMarkerClick = coordId => {
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
          }
      } catch (error){
          console.error("Erro: ",error)
      }
    }

    setActiveMarker(prevActiveMarker => (
      prevActiveMarker === coordId ? null : coordId
    ));

    getInfo(coordId);
  };

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
        {coordenadas.map(coord => (
          <Marker
            onClick={() => handleMarkerClick(coord.id)}
            position={{
              lat: Number(coord.latitude_gd),
              lng: Number(coord.longitude_gd)
            }}
            icon={{url: colorpoint ? `https://maps.google.com/mapfiles/ms/icons/${coord[colorpoint.acessor] == 'Vencido' ? 'yellow' : 'blue'}-dot.png` 
            : mapMarker, scaledSize: {height:32,width:32}}}
            key={coord.id}
          >
            {activeMarker === coord.id && (
              <InfoWindow
                onCloseClick={() => setActiveMarker(null)}
                className='bg-info'
                style={{maxHeight: '300px'}}
              >
                {React.cloneElement(children, { infoponto:infoPonto })}
              </InfoWindow>
            )}
          </Marker>
        ))}
      </ReactGoogleMap>
    </div>
  );
};

GoogleMap.propTypes = {
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

export default GoogleMap;
