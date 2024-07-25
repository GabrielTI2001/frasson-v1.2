import React from 'react';
import { Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faVial } from '@fortawesome/free-solid-svg-icons';

const ResultAnaliseSolo = ({record, field, click}) => {
    return (
    <div className="pt-1 pb-0 mb-1 d-flex justify-content-between hover-children" style={{fontSize: '.80em'}} key={field.name}>
        <div className='d-inline'>
        <FontAwesomeIcon icon={faVial} className='me-2' /><strong>{field.label || field.label_html}</strong>
        <span className='modal-editar ms-2 fs--1' onClick={() => click(field.name)}>
            <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
        </span>
        </div>
        <div className='d-inline text-center' style={{width:'28%'}}>
        {record.results[field.name] ? 
            <>
            <span className='mx-2 fw-bold'>{Number(record.results[field.name].value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
            <span className={`badge bg-${record.results[field.name].color} text-white fw-normal px-2`}>{record.results[field.name].level}</span>
            </> 
            : <span className="fs--1 row-10">-</span>
        }
        </div>
    </div>
    );
};

export const OtherInfo = ({info}) =>{
    return (            
    <div className='row gy-1 gx-0 fs--1'>
        <h4 className='mb-1 fw-bold' style={{fontSize:'15px'}}>Outras Informações</h4>
        <Col xxl={12} lg={12}><strong>CTC Total (cmolc/dm<sup>3</sup>):</strong>
            <span className='mx-2 fw-bold'>{info.capacidade_troca_cations || '-'}</span>
        </Col>
        <Col xxl={12} lg={12}><strong>Soma de Bases (cmolc/dm<sup>3</sup>):</strong>
            <span className='mx-2 fw-bold'>{info.soma_bases}</span>
        </Col>
        <Col xxl={12} lg={12}><strong>Saturação de Bases (V%):</strong>
            <span className='mx-2 fw-bold'>{info.saturacao_bases}</span>
        </Col>
        <Col xxl={12} lg={12}><strong>Relação Ca/Mg:</strong>
        {info.rel_calcio_magnesio ? 
            <>
            <span className='mx-2 fw-bold'>
                {info.rel_calcio_magnesio.value}
            </span>
            <span className={`badge bg-${info.rel_calcio_magnesio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>
                {info.rel_calcio_magnesio.level}
            </span>
            </> 
        : <span className='mx-2 fw-bold'>-</span>}  
        </Col>
        <Col xxl={12} lg={12}><strong>Relação Ca/K:</strong>
        {info.rel_calcio_potassio ? 
            <>
            <span className='mx-2 fw-bold'>
                {info.rel_calcio_potassio.value}
            </span>
            <span className={`badge bg-${info.rel_calcio_potassio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>
                {info.rel_calcio_potassio.level}
            </span>
            </> 
        : <span className='mx-2 fw-bold'>-</span>}  
        </Col>
        <Col xxl={12} lg={12}><strong>Relação Mg/K:</strong>
        {info.rel_magnesio_potassio ? 
            <>
            <span className='mx-2 fw-bold'>
                {info.rel_magnesio_potassio.value}
            </span>
            <span className={`badge bg-${info.rel_magnesio_potassio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>
                {info.rel_magnesio_potassio.level}
            </span>
            </> 
        : <span className='mx-2 fw-bold'>-</span>}  
        </Col>
        <Col xxl={12} lg={12}><strong>Necessidade de Calagem (ton/ha):</strong>
            <span className='mx-2 fw-bold'>{info.calagem}</span>
        </Col>
        <div className="mt-3 fw-normal" style={{fontSize: '11px'}}>
            <span>* Níveis ideais de nutrientes no solo conforme interpretação da Embrapa Cerrados.</span>
        </div>
    </div>
    )
}  

export default ResultAnaliseSolo;
  