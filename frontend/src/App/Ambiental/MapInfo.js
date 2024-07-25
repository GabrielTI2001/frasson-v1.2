import React from 'react';
import { convertGDtoGMS } from '../../helpers/utils';
import SubtleBadge from '../../components/common/SubtleBadge';
import { Link } from 'react-router-dom';

const MapInfo = ({infoponto, type}) => {
  return (
    <>
    <div>
      {infoponto ? 
        <>
        {type === 'appo' ? <div><span className='fw-bold me-1'>N° Poço: </span><label className='mb-0'>{infoponto.numero_poco}</label></div> 
        : <div><span className='fw-bold me-1'>Ponto: </span><label className='mb-0'>{infoponto.descricao_ponto}</label></div>}
        <div><span className='fw-bold me-1'>Latitude: </span><label className='mb-0'>{convertGDtoGMS(infoponto.latitude_gd, 'lat')}</label></div>
        <div><span className='fw-bold me-1'>Longitude: </span><label className='mb-0'>{convertGDtoGMS(infoponto.longitude_gd, 'lng')}</label></div>  
        <div><span className='fw-bold me-1'>Vazão: </span><label className='mb-0'>{infoponto.vazao_m3_dia} m<sup>3</sup>/dia</label></div>
        <div><span className='fw-bold me-1'>Bombeamento: </span><label className='mb-0'>{infoponto.bombeamento_h} h</label></div>  
        </>
        : null
      } 
    </div>
   </>
  );
};

export default MapInfo;

export const MapInfoDetail = ({infoponto, type}) => {
  const processo = infoponto && infoponto.outorga ? infoponto.outorga : infoponto && infoponto.appo
  return (
    <>
    <div style={{width:'300px'}} className='info'>
      {infoponto ? 
        <>
        {type !== 'appo' && <>
          <div><strong className='fw-bold me-1'>Portaria: </strong><label className='mb-0'>{processo.portaria}</label></div>
        </>}

          <div><strong className='fw-bold me-1'>Requerente: </strong><label className='mb-0'>{processo.requerente}</label></div>
          <div><strong className='fw-bold me-1'>CPF/CNPJ: </strong><label className='mb-0'>{processo.cpf_cnpj}</label></div>
          <div><strong className='fw-bold me-1'>N° Processo: </strong><label className='mb-0'>{processo.processo}</label></div>
          <div><strong className='fw-bold me-1'>Localidade: </strong><label className='mb-0'>{processo.nome_fazenda}</label></div>
          <div><strong className='fw-bold me-1'>Municipio: </strong><label className='mb-0'>{processo.municipio}</label></div>

        {type === 'appo' ? 
          <div><strong className='fw-bold me-1'>Data APPO: </strong><label className='mb-0 me-1'>{processo.data_publicacao}</label></div>
        : <> 
          <div><strong className='fw-bold me-1'>Captação: </strong><label className='mb-0'>{processo.captacao}</label></div>
          <div><strong className='fw-bold me-1'>Bacia Hidrográfica: </strong><label className='mb-0'>{processo.bacia}</label></div>
          <div><strong className='fw-bold me-1'>Finalidade: </strong><label className='mb-0'>{processo.finalidade}</label></div>  
          <div><strong className='fw-bold me-1'>Ponto: </strong><label className='mb-0'>{infoponto.descricao_ponto}</label></div>      
        </>}

        <div><strong className='fw-bold me-1'>Data Validade: </strong>
          <label className='mb-0 me-1'>{processo.data_validade}</label>
          {new Date(processo.data_validade) < new Date()
            ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
            :<SubtleBadge bg='success' className='bg-gradient'>Vigente</SubtleBadge>
          }
        </div>
        <div><strong className='fw-bold me-1'>Latitude: </strong><label className='mb-0'>{convertGDtoGMS(infoponto.latitude_gd, 'lat')}</label></div>
        <div><strong className='fw-bold me-1'>Longitude: </strong><label className='mb-0'>{convertGDtoGMS(infoponto.longitude_gd, 'lng')}</label></div>  
        
        {type !== 'appo' ? <>
          <div><strong className='fw-bold me-1'>Vazão: </strong><label className='mb-0'>{infoponto.vazao_m3_dia} m<sup>3</sup>/dia</label></div>
          <div className='mb-2'><strong className='fw-bold me-1'>Bombeamento: </strong><label className='mb-0'>{infoponto.bombeamento_h} h</label></div>
          </> : <>
          <div><strong className='fw-bold me-1'>Nº Poço: </strong><label className='mb-0'>{infoponto.numero_poco}</label></div>
          <div><strong className='fw-bold me-1'>Expectativa de Vazão: </strong><label className='mb-0'>{infoponto.vazao_m3_dia} m<sup>3</sup>/dia</label></div>
          <div className='mb-2'><strong className='fw-bold me-1'>Finalidade: </strong><label className='mb-0'>{infoponto.str_finalidade}</label></div>
        </>}
        <div>
          {type !== 'appo' 
          ? <Link className='fw-bold me-1' to={`/ambiental/inema/outorgas/${processo.uuid}`}>Clique Aqui</Link> 
          : <Link className='fw-bold me-1' to={`/ambiental/inema/appos/${processo.uuid}`}>Clique Aqui</Link>}
          <label> Para Visualizar o Processo</label>
        </div>  
        </>
        : null
      } 
      </div>
   </>
  );
};