import React from 'react';

const MapInfo = ({infoponto}) => {
  return (
    <>
    <div>
      {infoponto ? 
        <>
        <div><span className='fw-bold me-1'>Ponto: </span><label className='mb-0'>{infoponto.number}</label></div>
        <div><span className='fw-bold me-1'>Latitude: </span><label className='mb-0'>{infoponto.lat_gms}</label></div>
        <div><span className='fw-bold me-1'>Longitude: </span><label className='mb-0'>{infoponto.lng_gms}</label></div>   
        <div><span className='fw-bold me-1'>Altitude: </span><label className='mb-0'>{infoponto.elevation} m</label></div>   
        </>
        : null
      } 
    </div>
   </>
  );
};

export default MapInfo;