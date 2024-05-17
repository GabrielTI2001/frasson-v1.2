import React from 'react';
import { Link } from 'react-router-dom';
import { convertGDtoGMS } from '../../../helpers/utils';

export const MapInfoDetail = ({infoponto}) => {
  return (
    <>
    <div style={{width:'300px'}} className='info'>
      {infoponto ? 
        <>
          <div><strong className='fw-bold me-1'>Proprietário: </strong><label className='mb-0'>{infoponto.str_proprietario || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Município: </strong><label className='mb-0'>{infoponto.str_municipio || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Identificação Pivot: </strong><label className='mb-0'>{infoponto.identificacao_pivot || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Identificação Pivot: </strong>
            <label className='mb-0'>{infoponto.identificacao_pivot ? Number(infoponto.raio_irrigado_m).toLocaleString('pt-BR')+' m' : '-'}</label>
          </div>
          <div><strong className='fw-bold me-1'>Área Total: </strong>
            <label className='mb-0'>{infoponto.area_circular_ha ? Number(infoponto.area_circular_ha).toLocaleString('pt-BR')+' ha' : '-'}</label>
          </div>
          <div><strong className='fw-bold me-1'>Lâmina 21h: </strong>
            <label className='mb-0'>{infoponto.lamina_bruta_21_h ? Number(infoponto.lamina_bruta_21_h).toLocaleString('pt-BR')+' mm' : '-'}</label>
          </div>
          <div><strong className='fw-bold me-1'>Vazão: </strong>
            <label className='mb-0'>{infoponto.vazao_total_m3_h ? <>{Number(infoponto.vazao_total_m3_h).toLocaleString('pt-BR')}m<sup>3</sup>/h</>: '-'}</label>
          </div>
          <div>
            <span className='fw-bold me-1'>Coordenadas: </span>
            <label className='mb-0'>{convertGDtoGMS(infoponto.lat_center_gd, 'lat')} {convertGDtoGMS(infoponto.long_center_gd, 'lng')}</label>
          </div>
          <div>
            <Link className='fw-bold me-1' to={`/irrigaton/pivots/${infoponto.uuid}`}>Clique Aqui</Link>
            <label> Para Visualizar o Registro</label>
          </div>  
        </>
        : null
      } 
      </div>
   </>
  );
};

const MapInfo = ({infoponto, type}) => {
  return (
    <>
    <div>
      {infoponto ? 
        <>
        {type === 'appo' ? <div><span className='fw-bold me-1'>Poço: </span><span className='mb-0'>{infoponto.numero_poco}</span></div> 
        : <div><span className='fw-bold me-1'>Ponto: </span><span className='mb-0'>{infoponto.descricao_ponto}</span></div>}
        <div><span className='fw-bold me-1'>Latitude: </span><span className='mb-0'>{convertGDtoGMS(infoponto.latitude_gd, 'lat')}</span></div>
        <div><span className='fw-bold me-1'>Longitude: </span><span className='mb-0'>{convertGDtoGMS(infoponto.longitude_gd, 'lng')}</span></div>  
        </>
        : null
      } 
    </div>
   </>
  );
};

export default MapInfo;