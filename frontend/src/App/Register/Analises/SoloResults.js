import React from 'react';
import { Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVial } from '@fortawesome/free-solid-svg-icons';

const ResultAnaliseSolo = ({dados}) => {
    return (
    <>
    {dados &&
        <div xl={12} style={{fontSize: '.80em'}}>
            <div className='row mx-0 px-0 gx-0 gy-2'>
                <h4 className='mb-1 col-10 fw-bold' style={{fontSize:'15px'}}>Resultados</h4>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Ca<sup>2+</sup> (cmolc/dm<sup>3</sup>):</strong>
                {dados.calcio ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.calcio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.calcio.color} text-white fw-normal px-2`}>{dados.calcio.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Mg<sup>2+</sup> (cmolc/dm<sup>3</sup>):</strong>
                {dados.magnesio ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.magnesio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.magnesio.color} text-white fw-normal px-2`}>{dados.magnesio.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Al<sup>3+</sup> (cmolc/dm<sup>3</sup>):</strong>
                    {dados.aluminio ? <span className='mx-2 fw-bold'>{dados.aluminio}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Na<sup>+</sup> (cmolc/dm<sup>3</sup>):</strong>
                    {dados.sodio ? <span className='mx-2 fw-bold'>{dados.sodio}</span> : <span className='mx-2 fw-bold'>-</span>}        
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>K (cmolc/dm<sup>3</sup>):</strong>
                {dados.potassio ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.potassio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.potassio.color} text-white fw-normal px-2`}>{dados.potassio.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>P (mg/dm<sup>3</sup>):</strong>
                {dados.fosforo ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.fosforo.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.fosforo.color} text-white fw-normal px-2`}>{dados.fosforo.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}                
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>P-rem. (mg/dm<sup>3</sup>):</strong>
                {dados.fosforo_rem ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.fosforo_rem.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.fosforo_rem.color} text-white fw-normal px-2`}>{dados.fosforo_rem.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}    
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>S (cmolc/dm<sup>3</sup>):</strong>
                {dados.enxofre ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.enxofre.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.enxofre.color} text-white fw-normal px-2`}>{dados.enxofre.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Zn (cmolc/dm<sup>3</sup>):</strong>
                {dados.zinco ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.zinco.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.zinco.color} text-white fw-normal px-2`}>{dados.zinco.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}          
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Fe (cmolc/dm<sup>3</sup>):</strong>
                {dados.ferro ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.ferro.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.ferro.color} text-white fw-normal px-2`}>{dados.ferro.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Cu (cmolc/dm<sup>3</sup>):</strong>
                {dados.cobre ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.cobre.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.cobre.color} text-white fw-normal px-2`}>{dados.cobre.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Mn (cmolc/dm<sup>3</sup>):</strong>
                {dados.manganes ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.manganes.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.manganes.color} text-white fw-normal px-2`}>{dados.manganes.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>B (cmolc/dm<sup>3</sup>):</strong>
                {dados.boro ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.boro.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.boro.color} text-white fw-normal px-2`}>{dados.boro.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>H+Al:</strong>
                    {dados.h_mais_al ? <span className='mx-2 fw-bold'>{dados.h_mais_al}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>pH H<sub>2</sub>O:</strong>
                {dados.ph_h20 ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.ph_h20.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.ph_h20.color} text-white fw-normal px-2`}>{dados.ph_h20.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>pH CaCl<sub>2</sub>:</strong>
                {dados.ph_cacl2 ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.ph_cacl2.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.ph_cacl2.color} text-white fw-normal px-2`}>{dados.ph_cacl2.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Matéria Orgânica (dag/dm<sup>3</sup>):</strong>
                {dados.mat_org ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.mat_org.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span className={`badge bg-${dados.mat_org.color} text-white fw-normal px-2`}>{dados.mat_org.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Areia (%):</strong>
                    {dados.areia_percentual ? <span className='mx-2 fw-bold'>{dados.areia_percentual}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Silte (%):</strong>
                    {dados.silte_percentual ? <span className='mx-2 fw-bold'>{dados.silte_percentual}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={11}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Argila (%):</strong>
                    {dados.argila_percentual ? <span className='mx-2 fw-bold'>{dados.argila_percentual}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
            </div>
        </div>}
    </>
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
  