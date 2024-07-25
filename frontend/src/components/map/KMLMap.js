import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import googleMapStyles from '../../helpers/googleMapStyles';
import {
  GoogleMap as ReactGoogleMap,
  KmlLayer,
  useJsApiLoader
} from '@react-google-maps/api';
import { useAppContext } from '../../Main';

const KMLMap = ({
  mapStyle,
  initialCenter,
  darkStyle,
  className,
  children,
  token_api,
  urls
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
