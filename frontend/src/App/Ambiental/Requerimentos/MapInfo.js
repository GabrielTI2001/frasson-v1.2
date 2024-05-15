import React from 'react';
import { Link } from 'react-router-dom';
import { convertGDtoGMS } from '../../../helpers/utils';

export const MapInfoDetail = ({infoponto}) => {
  const processo = infoponto ? infoponto.info_processo : null
  return (
    <>
    <div style={{width:'300px'}} className='info'>
      {infoponto ? 
        <>
          <div><strong className='fw-bold me-1'>N° Requerimento: </strong><label className='mb-0'>{processo.numero_requerimento || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Data Requerimento: </strong>
            <label className='mb-0'>{processo.data_requerimento ? new Date(processo.data_requerimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</label>
          </div>
          <div><strong className='fw-bold me-1'>Requerente: </strong><label className='mb-0'>{processo.requerente || '-'}</label></div>
          <div><strong className='fw-bold me-1'>CPF/CNPJ: </strong><label className='mb-0'>{processo.cpf_cnpj || '-'}</label></div>
          <div><strong className='fw-bold me-1'>N° Processo: </strong><label className='mb-0'>{processo.processo || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Data Formação: </strong>
            <label className='mb-0'>{processo.data_formacao ? new Date(processo.data_formacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</label>
          </div>
          <div><strong className='fw-bold me-1'>Município: </strong><label className='mb-0'>{processo.str_municipio}</label></div>
          <div><strong className='fw-bold me-1'>Email: </strong><label className='mb-0'>{processo.email || '-'}</label></div>
          <div>
            <span className='fw-bold me-1'>Coordenadas: </span>
            <label className='mb-0'>{convertGDtoGMS(infoponto.latitude_gd, 'lat')} {convertGDtoGMS(infoponto.longitude_gd, 'lng')}</label>
          </div>
          <div>
            <Link className='fw-bold me-1' to={`/ambiental/inema/requerimentos/appo/${processo.uuid}`}>Clique Aqui</Link>
            <label> Para Visualizar o Processo</label>
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