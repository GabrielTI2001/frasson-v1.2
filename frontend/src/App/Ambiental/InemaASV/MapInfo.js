import React from 'react';
import { Link } from 'react-router-dom';

export const MapInfoDetailASV = ({infoponto}) => {
  const processo = infoponto.info_processo
  return (
    <>
    <div style={{width:'300px'}} className='info'>
      {infoponto ? 
        <>
          <div><strong className='fw-bold me-2'>Requerente: </strong><label className='mb-0'>{processo.requerente || '-'}</label></div>
          <div><strong className='fw-bold me-2'>CPF/CNPJ: </strong><label className='mb-0'>{processo.cpf_cnpj || '-'}</label></div>
          <div><strong className='fw-bold me-2'>Portaria: </strong><label className='mb-0'>{processo.portaria || '-'}</label></div>
          <div><strong className='fw-bold me-2'>Processo: </strong><label className='mb-0'>{processo.processo || '-'}</label></div>
          <div><strong className='fw-bold me-2'>Município: </strong><label className='mb-0'>{processo.str_municipio}</label></div>
          <div><strong className='fw-bold me-2'>Área Autorizada na Portaria: </strong><label className='mb-0'>{processo.area_total || '-'}</label></div>
          <div><strong className='fw-bold me-2'>Gleba ASV: </strong><label className='mb-0'>{infoponto.identificacao_area}</label></div>
          <div><strong className='fw-bold me-2'>Área Gleba: </strong><label className='mb-0'>{infoponto.area_total}</label></div>
          <div>
            <Link className='fw-bold me-1' to={`/ambiental/inema/asv/${processo.uuid}`}>Clique Aqui</Link>
            <label> Para Visualizar o Processo</label>
          </div>  
        </>
        : null
      } 
      </div>
   </>
  );
};