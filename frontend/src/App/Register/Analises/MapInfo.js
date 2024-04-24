import React from 'react';
import { convertGDtoGMS } from '../../../helpers/utils';

const MapInfo = ({infoponto, type}) => {
  return (
    <>
    <div>
      {infoponto ? 
        <>
          <div><span className='fw-bold me-2'>Latitude: </span><label className='mb-0'>{convertGDtoGMS(infoponto.latitude_gd, 'lat')}</label></div>
          <div><span className='fw-bold me-2'>Longitude: </span><label className='mb-0'>{convertGDtoGMS(infoponto.longitude_gd, 'lng')}</label></div>  
        </>
        : null
      } 
    </div>
   </>
  );
};

export default MapInfo;

