import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import googleMapStyles from '../../helpers/googleMapStyles';
import {
  GoogleMap as ReactGoogleMap,
  KmlLayer,
  useJsApiLoader
} from '@react-google-maps/api';
import { useAppContext } from '../../Main';
import { useNavigate } from 'react-router-dom';

const KMLMap = ({
  mapStyle,
  initialCenter,
  darkStyle,
  className,
  children,
  token_api,
  urls
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

  const [path, setPath] = useState([
    { lat: 52.52549080781086, lng: 13.398118538856465 },
    { lat: 52.48578559055679, lng: 13.36653284549709 },
    { lat: 52.48871246221608, lng: 13.44618372440334 }
  ]);

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
        {urls.map((url,index) => <KmlLayer key={index} url={url} options={{ preserveViewport: false, suppressInfoWindows:true }}/>)}
      </ReactGoogleMap>
    </div>
  );
};

KMLMap.propTypes = {
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

export default KMLMap;
