import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import {Spinner} from 'react-bootstrap';
import { format } from 'date-fns';

const ResultAnaliseSolo = ({dados}) => {
    return (
    <>
    {dados &&
        <Col>
            <div className='row gy-1'>
                <h4 className='mb-1' style={{fontSize:'14px'}}>Resultados</h4>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Ca<sup>2+</sup> (cmolc/dm<sup>3</sup>):</strong>
                {dados.calcio ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.calcio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.calcio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.calcio.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Mg<sup>2+</sup> (cmolc/dm<sup>3</sup>):</strong>
                {dados.magnesio ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.magnesio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.magnesio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.magnesio.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Al<sup>3+</sup> (cmolc/dm<sup>3</sup>):</strong>
                    {dados.aluminio ? <span className='mx-2 fw-bold'>{dados.aluminio}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Na<sup>+</sup> (cmolc/dm<sup>3</sup>):</strong>
                    {dados.sodio ? <span className='mx-2 fw-bold'>{dados.sodio}</span> : <span className='mx-2 fw-bold'>-</span>}        
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>K (cmolc/dm<sup>3</sup>):</strong>
                {dados.potassio ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.potassio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.potassio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.potassio.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>P (mg/dm<sup>3</sup>):</strong>
                {dados.fosforo ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.fosforo.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.fosforo.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.fosforo.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}                
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>P-rem. (mg/dm<sup>3</sup>):</strong>
                {dados.fosforo_rem ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.fosforo_rem.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.fosforo_rem.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.fosforo_rem.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}    
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>S (cmolc/dm<sup>3</sup>):</strong>
                {dados.enxofre ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.enxofre.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.enxofre.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.enxofre.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Zn (cmolc/dm<sup>3</sup>):</strong>
                {dados.zinco ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.zinco.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.zinco.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.zinco.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}          
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Fe (cmolc/dm<sup>3</sup>):</strong>
                {dados.ferro ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.ferro.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.ferro.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.ferro.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Cu (cmolc/dm<sup>3</sup>):</strong>
                {dados.cobre ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.cobre.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.cobre.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.cobre.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Mn (cmolc/dm<sup>3</sup>):</strong>
                {dados.manganes ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.manganes.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.manganes.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.manganes.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>B (cmolc/dm<sup>3</sup>):</strong>
                {dados.boro ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.boro.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.boro.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.boro.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>H+Al:</strong>
                    {dados.h_mais_al ? <span className='mx-2 fw-bold'>{dados.h_mais_al}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>pH H<sub>2</sub>O:</strong>
                {dados.ph_h20 ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.ph_h20.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.ph_h20.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.ph_h20.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>pH CaCl<sub>2</sub>:</strong>
                {dados.ph_cacl2 ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.ph_cacl2.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.ph_cacl2.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.ph_cacl2.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Matéria Orgânica (dag/dm<sup>3</sup>):</strong>
                {dados.mat_org ? 
                <>
                    <span className='mx-2 fw-bold'>{Number(dados.mat_org.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                    <span class={`badge bg-${dados.mat_org.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>{dados.mat_org.level}</span>
                </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Areia (%):</strong>
                    {dados.areia_percentual ? <span className='mx-2 fw-bold'>{dados.areia_percentual}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Silte (%):</strong>
                    {dados.silte_percentual ? <span className='mx-2 fw-bold'>{dados.silte_percentual}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
                <Col xxl={6} lg={6}><FontAwesomeIcon icon={faVial} className='me-2' /><strong>Argila (%):</strong>
                    {dados.argila_percentual ? <span className='mx-2 fw-bold'>{dados.argila_percentual}</span> : <span className='mx-2 fw-bold'>-</span>}
                </Col>
            </div>
            <hr className="mb-1 mt-2" style={{color: 'black', opacity: '.2'}}></hr>
        </Col>}
    </>
    );
};
  
export default ResultAnaliseSolo;
  

