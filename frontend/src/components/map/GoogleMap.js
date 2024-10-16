import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import googleMapStyles from '../../helpers/googleMapStyles';
import {
  GoogleMap as ReactGoogleMap,
  Marker, Polygon,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';
import { useAppContext } from '../../Main';
import { useNavigate } from 'react-router-dom';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const GoogleMap = ({
  mapStyle,
  initialCenter,
  darkStyle,
  className,
  children,
  token_api,
  coordenadas,
  polygons,
  link,
  urlparams,
  colorpoint,
  infounlink
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
              RedirectToLogin(navigate);
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
    if (link){
      getInfo(coordId);
    }
    else{
      if (infounlink) setInfoPonto(coordenadas.filter(c => c.id === coordId)[0])
    }
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
        {coordenadas && coordenadas.map((coord, index) => (
          <Marker
            onClick={() => handleMarkerClick(coord.id)}
            position={{
              lat: Number(coord.latitude_gd),
              lng: Number(coord.longitude_gd)
            }}
            icon={{url: colorpoint ? `https://maps.google.com/mapfiles/ms/icons/${coord[colorpoint.acessor] === 'Vencido' ? 'yellow' : 'blue'}-dot.png` 
            : mapMarker, scaledSize: {height:32,width:32}}}
            key={index}
          >
            {activeMarker === coord.id && (link || infounlink) &&(
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
        {polygons && polygons.map((p, index) =>
          <Polygon 
            key={index}
            path={p.points}
            options={{
              strokeColor: '#0c4106',
              strokeWeight: 1,
              fillColor: '#6be95d'
            }}
          >
          </Polygon>
        )}
      </ReactGoogleMap>
    </div>
  );
};

//Sempre passar os atributos latitude_gd, longitude_gd e id para as coordenadas
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
