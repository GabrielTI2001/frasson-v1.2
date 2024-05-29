import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table, Card, Modal, CloseButton} from 'react-bootstrap';
import { useNavigate, useParams, Link } from "react-router-dom";
import { RetrieveRecord } from "../../helpers/Data";
import { useAppContext } from "../../Main";
import { ColumnLineChart } from "../../components/Custom/Charts";
import IndicatorForm from "./Form";

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const ViewIndicator = () => {
    const [register, setRegister] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {uuid} = useParams()
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
    const [total, setTotal] = useState()
    const [showmodal, setShowModal] = useState(false);

    if (register && !total){
        let totalrealizado = 0, totalmeta = 0;
        Object.keys(register).forEach((key, index) => {
            if (index > 5 && index % 2 === 0 && index < 30) {
                totalmeta += Number(register[key] || 0);
            }
            if (index > 5 && index % 2 !== 0 && index < 30) {
                totalrealizado += Number(register[key] || 0);
            }
        });
        setTotal({meta:totalmeta, realizado:totalrealizado})
    }

    const onClick = () =>{
        setShowModal(true)
    }
    const calcpercentual = (numerador, denominador) =>{
       if (numerador && denominador && denominador > 0){
            if((numerador/denominador) * 100 < 100){
                return (numerador/denominador) * 100
            }
            else{
                return 100
            }
       } 
       else {
            return null
       }
    }
    const setter = (data) => {
        setRegister(data)
    }
    const submit = (type, data) => {
        // setRegister(data)
        if (type === 'edit') setRegister(data)
        setShowModal(false)
    }


    useEffect(()=>{
        const Search = async () => {
            const status = await RetrieveRecord(uuid, 'kpi/metas', setter) 
            if (status === 401) navigate("/auth/login");
        }
        if (!register){
            Search()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/kpi/indicators'}>Key Performance Indicators</Link>
            </li>
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/kpi/myindicators'}>Meus Indicadores</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                {register && register.str_indicator+' '+register.year}
            </li>  
        </ol>
        {register && total ?
        <Row xl={1} xs={1} className="mt-3">
            <Table responsive className="table-sm">
                <thead className="bg-300">
                    <tr>
                        <th scope="col">Mês</th>
                        <th scope="col">Meta</th>
                        <th scope="col">Realizado</th>
                        <th scope="col">% Realizado</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {months.map((month, index) =>
                    <tr style={{cursor:'pointer'}} onClick={() => onClick()} key={index}>
                        <td className="align-middle fw-bold text-primary">{meses[index].toLocaleUpperCase()}</td>
                        <td className="align-middle fw-bold text-primary">{register[`target_${month}`] || '-'}</td>
                        <td className="align-middle fw-bold text-primary">{register[`actual_${month}`] || '-'}</td>
                        <td className={`align-middle fw-bold 
                            text-${calcpercentual(register[`actual_${month}`], register[`target_${month}`]) < 30 ?
                            'warning' : calcpercentual(register[`actual_${month}`], register[`target_${month}`]) >= 80 ? 'success' : 'primary'}`}
                        >
                            {calcpercentual(register[`actual_${month}`], register[`target_${month}`]) ? 
                            calcpercentual(register[`actual_${month}`], register[`target_${month}`]).toLocaleString('pt-BR', {maximumFractionDigits:2})+'%' 
                            : '-'}
                        </td>
                    </tr>
                )}
                <tr style={{cursor:'pointer'}} onClick={() => onClick(register.uuid)}>
                    <td className="align-middle fw-bold text-dark">TOTAL</td>
                    <td className="align-middle fw-bold text-dark">{total.meta || '-'}</td>
                    <td className="align-middle fw-bold text-dark">{total.realizado || '-'}</td>
                    <td className="align-middle fw-bold text-dark">
                        {total.meta > 0 
                        ? ((total.realizado/total.meta) * 100) <= 100 
                            ? Number((total.realizado/total.meta) * 100).toLocaleString('pt-BR', {maximumFractionDigits:2}) + '%' : 100+'%'
                        : '-'}
                    </td>
                </tr>
                </tbody>
            </Table>
            {register && 
            <Col>
                <Card.Body className="card mb-2">
                    <ColumnLineChart
                        valuescolumn={months.map(m => register[`actual_${m}`])} 
                        valuesline={months.map(m => register[`target_${m}`])} 
                        columns={meses.map(m => m.substr(0,3).toUpperCase())}
                        names={['Realizado', 'Meta']}
                        title={`Meta/Realizado ${new Date().getFullYear()}`}
                        height={480}
                    />
                </Card.Body>
            </Col>
            }
            <div className="fs--1 fw-bold mb-2 text-info-emphasis">
                Atualizado em {new Date(register.updated_at).toLocaleDateString('pt-BR', {timeZone:'UTC'})} {new Date(register.updated_at).toLocaleTimeString('pt-BR', {timeZone:'UTC'})}
            </div>
        </Row>
        : <div className="text-center"><Spinner></Spinner></div>}
        <Modal
            size="xl"
            show={showmodal}
            onHide={() => setShowModal(false)}
            dialogClassName="mt-10"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    Editar Metas
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center w-100 sectionform">
                        <IndicatorForm hasLabel data={register} type='edit' submit={submit}/>
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default ViewIndicator;
  