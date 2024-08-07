import React from 'react';
import { Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const ResultAnaliseSolo = ({record, field, click}) => {
    return (
    <div className="pt-2 pb-0 mb-2" style={{fontSize: '.78em'}} key={field.name}>
        <div className=''>
            <strong>{field.label || field.label_html}</strong>
            <span className='modal-editar bg-300 py-1 px-2 ms-2' onClick={() => click(field.name)}>
                <FontAwesomeIcon icon={faPenToSquare} className='me-1'/>Editar
            </span>
        </div>
        <div style={{width:'28%'}}>
            {record.results[field.name] && typeof(record.results[field.name]) === 'object' ? 
                <>
                <span className='me-2' style={{fontSize: '.78rem'}}>
                    {record.results[field.name].value ? Number(record.results[field.name].value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2}) : '-'}
                </span>
                <span className={`badge bg-${record.results[field.name].color} text-white fw-normal p-1`} style={{fontSize: '.70em'}}>
                    {record.results[field.name].level}
                </span>
                </> 
            : record.results[field.name] ? 
                <span className="text-start" style={{fontSize: '.78rem'}}>
                    {record.results[field.name] ? Number(record.results[field.name]).toLocaleString('pt-BR', {minimumFractionDigits:2}) : '-'}
                </span>
            : <span className="row-10">-</span>}
        </div>
    </div>
    );
};

export const OtherInfo = ({info}) =>{
    return (            
    <div className='row gy-1 gx-0 fs--1'>
        <h4 className='mb-1 fw-bold' style={{fontSize:'15px'}}>Outras Informações</h4>
        <Col xxl={12} lg={12}>
            <strong className='d-block'>CTC Total (cmolc/dm<sup>3</sup>)</strong>
            <span>{info.capacidade_troca_cations || '-'}</span>
        </Col>
        <Col xxl={12} lg={12}>
            <strong className='d-block'>Soma de Bases (cmolc/dm<sup>3</sup>)</strong>
            <span>{info.soma_bases}</span>
        </Col>
        <Col xxl={12} lg={12}>
            <strong className='d-block'>Saturação de Bases (V%)</strong>
            <span>{info.saturacao_bases}</span>
        </Col>
        <Col xxl={12} lg={12}>
            <strong className='d-block'>Relação Ca/Mg</strong>
            {info.rel_calcio_magnesio ? 
                <>
                <span className='me-2'>
                    {info.rel_calcio_magnesio.value}
                </span>
                <span className={`badge bg-${info.rel_calcio_magnesio.color} text-white fw-normal p-1`} style={{fontSize: '.70em'}}>
                    {info.rel_calcio_magnesio.level}
                </span>
                </> 
            : <span className='mx-2'>-</span>}  
        </Col>
        <Col xxl={12} lg={12}><strong className='d-block'>Relação Ca/K</strong>
            {info.rel_calcio_potassio ? 
                <>
                <span className='me-2'>
                    {info.rel_calcio_potassio.value}
                </span>
                <span className={`badge bg-${info.rel_calcio_potassio.color} text-white fw-normal p-1`} style={{fontSize: '.70em'}}>
                    {info.rel_calcio_potassio.level}
                </span>
                </> 
            : <span className='mx-2'>-</span>}  
        </Col>
        <Col xxl={12} lg={12}><strong className='d-block'>Relação Mg/K</strong>
        {info.rel_magnesio_potassio ? 
            <>
            <span className='me-2'>
                {info.rel_magnesio_potassio.value}
            </span>
            <span className={`badge bg-${info.rel_magnesio_potassio.color} text-white fw-normal p-1`} style={{fontSize: '.70em'}}>
                {info.rel_magnesio_potassio.level}
            </span>
            </> 
        : <span className='mx-2 fw-bold'>-</span>}  
        </Col>
        <Col xxl={12} lg={12}><strong className='d-block'>Necessidade de Calagem (ton/ha):</strong>
            <span className='me-2'>{info.calagem}</span>
        </Col>
        <div className="mt-3 fw-normal" style={{fontSize: '11px'}}>
            <span>* Níveis ideais de nutrientes no solo conforme interpretação da Embrapa Cerrados.</span>
        </div>
    </div>
    )
}  

export default ResultAnaliseSolo;
  