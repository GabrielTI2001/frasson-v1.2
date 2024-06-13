import React from 'react';
import { Link } from 'react-router-dom';

export const MapInfoDetailCAR = ({infoponto}) => {
  return (
    <>
    <div style={{width:'300px'}} className='info'>
      {infoponto ? 
        <>
          <div><strong className='fw-bold me-1'>Nome Imóvel: </strong><label className='mb-0'>{infoponto.str_imovel || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Proprietário: </strong><label className='mb-0'>{infoponto.str_proprietario || '-'}</label></div>
          <div><strong className='fw-bold me-1'>CPF/CNPJ: </strong><label className='mb-0'>{infoponto.str_cpf_cnpj || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Município: </strong><label className='mb-0'>{infoponto.endereco_municipio || '-'}</label></div>
          <div><strong className='fw-bold me-1'>Área Total: </strong>
            <label className='mb-0'>{ infoponto.area_imovel ? 
              Number(infoponto.area_imovel).toLocaleString('pt-BR', {minimumFractionDigits:2})
              : '-'
            }
            </label>
          </div>
          <div>
            <strong className='fw-bold me-1'>Área APP: </strong>
            <label className='mb-0'>{ infoponto.area_preservacao_permanente ? 
              Number(infoponto.area_preservacao_permanente).toLocaleString('pt-BR', {minimumFractionDigits:2})
              : '-'
            }
            </label>
          </div>
          <div><strong className='fw-bold me-1'>Área RL: </strong>
            <label className='mb-0 me-1'>{ infoponto.reserva_legal_declarada ? 
              Number(infoponto.reserva_legal_declarada).toLocaleString('pt-BR', {minimumFractionDigits:2})
              : '-'
            }
            </label>
            ({infoponto.reserva_situacao || '-'})
          </div>
          <div>
            <Link className='fw-bold me-1' to={`/analytics/farms/${infoponto.imovel}`}>Clique Aqui</Link>
            <label> Para Visualizar o Imóvel</label>
          </div>  
        </>
        : null
      } 
      </div>
   </>
  );
};