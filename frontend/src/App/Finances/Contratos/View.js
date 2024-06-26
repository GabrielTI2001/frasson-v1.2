import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Modal, CloseButton, Table } from 'react-bootstrap';
import {Placeholder} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil, faBolt } from '@fortawesome/free-solid-svg-icons';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { useAppContext } from '../../../Main';
import FormEtapa from './Form';
import ContratoForm from './FormContrato';
// import FormAcomp from './FormAcomp';
// import FormProcesso from './FormProcesso';

const ViewContrato = () => {
    const {id} = useParams()
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [card, setCard] = useState();
    const [etapas, setEtapas] = useState();
    const [modal, setModal] = useState({show:false, link:''});
    const [modalform, setModalform] = useState({show:false, type:''});
    const [formData, setformData] = useState({created_by:user.id});

    const setter = (data) =>{
        setCard(data)
        setformData({...formData, contrato:data.id})
        setEtapas(data.etapas)
    }
    const submit = (type, data) =>{
        if (type === 'delete'){ 
            setModal({show:false})
        }
        setModalform({show:false})
        setCard(null)
    }
    const posdelete = (type, data) =>{
        if (type === 'delete'){ 
            setModal({show:false})
            navigate("/finances/contracts")
        }
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'finances/contratos-servicos', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_contratos_servicos") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!card){
            getdata()
        }

    },[card])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/finances/contracts'}>Contratos</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            Processo {card && card.processo}
        </li>  
    </ol>
    {card ? <>
    <Row className='mt-3 mb-2' xl={2} sm={2} xs={1}>
        <Col className='d-flex flex-column'>
            <Row className='mb-2 gx-3'>
                <Col xl='auto' xs='auto' sm='auto'> 
                    <img className='p-0 rounded-circle me-0' style={{width: '70px', height: '70px'}} 
                        src={`${process.env.REACT_APP_API_URL}/media/avatars/clients/default-avatar.jpg`}
                    />
                </Col>
                <Col>
                    <strong className='fs--1 fw-bold d-block'>{card.str_contratante}</strong>
                    <strong className='fs--2 fw-bold d-block mb-2'>{card.str_cpf}</strong>
                    {card.str_produtos.split(', ').map(p =>
                        <span className='fs--2 badge bg-primary' key={p}>{p}</span>
                    )}
                    
                </Col>
            </Row>

            <strong className='mt-2 mb-1'>Serviços Contratados</strong>
            <Row className='mb-2'>
                <Col>
                    {card.str_servicos.map(s =>
                        <span className='fs--2 badge bg-secondary fw-normal' key={s.value}>{s.label}</span>
                    )}
                </Col>
            </Row>

            <Row className='gy-1'>
                <Col className='mt-0' xl={6} xs={12}>
                    <strong className='me-1'>Data da Assinatura:</strong>
                    <span className='my-1'>
                        {card.data_assinatura ? new Date(card.data_assinatura).toLocaleDateString('pt-br', {timeZone:'UTC'}) : '-'}
                    </span>
                </Col>
                {card.valor &&
                <Col className='mt-0' xl={6} xs={12}>
                    <strong className='me-1'>Valor do Contrato:</strong>
                    <span className='my-1'>
                        {card.valor ? Number(card.valor).toLocaleString('pt-br', {style:'currency', currency:'BRL'}) : '-'}
                    </span>
                </Col>
                }
                {card.percentual &&
                    <Col className='mt-0' xl={6} xs={12}>
                        <strong className='me-1'>Percentual do Contrato:</strong>
                        <span className='my-1'>
                            {card.percentual_gc ? Number(card.percentual).toLocaleString('pt-br', {maximumFractionDigits:2}) : '-'}
                        </span>
                    </Col>
                }
                <Col xl={12} xs={12}> 
                    <strong className='me-1 d-block'>Detalhes Negociação:</strong>
                    <span className='my-1'>
                        {card.detalhes || '-'}
                    </span>
                </Col>
                {card.etapas.length > 0 && card.pdf && (card.valor || card.valor) &&
                    <div><Link className='btn btn-sm btn-warning py-0 fs--2' to={card.pdf_contrato}>PDF Contrato</Link></div>
                }
                <Col xl={'auto'} sm='auto' xs={'auto'} className='pe-0'>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                        style={{padding: '2px 8px'}} onClick={() =>{setModalform({show:true, type:'c', data:card})}}
                    >
                        <FontAwesomeIcon icon={faPencil} className='me-1'/> Editar
                    </Link>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-danger shadow-none fs--2"
                        style={{padding: '2px 8px'}} 
                        onClick={() => setModal({show:true, link:`${process.env.REACT_APP_API_URL}/finances/contratos-servicos/${card.uuid}/`})}
                    >
                        <FontAwesomeIcon icon={faTrash}/> Excluir
                    </Link>
                </Col>
                <hr className='my-1 ms-3' style={{width:'95%'}}></hr>
            </Row>
            <div>
                <Button className='col-auto btn-success btn-sm px-2' style={{fontSize:'10px'}} onClick={() => setModalform({show:true, type:'add'})}>
                    Adicionar Etapa
                </Button>
            </div>
        </Col>
        <Col className='d-flex flex-column'>
            <h6 style={{fontSize: '12px'}} className='fw-bold mb-1'>Etapas de Pagamento do Contrato</h6>
            <Table responsive className="mt-1">
                <thead className="bg-300">
                    <tr>
                        <th scope="col" className="text-center text-middle">Etapa</th>
                        <th scope="col" className="text-center text-middle">Valor (R$)</th>
                        <th scope="col" className="text-center text-middle">Perc. (%)</th>
                        <th scope="col" className="text-center text-middle">Cobrança Aberta</th>
                        <th scope="col" className="text-center text-middle">Status Cobrança</th>
                        <th scope="col" className="text-center text-middle">Ações</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {etapas && etapas.map(e => 
                    <tr key={e.id} style={{cursor:'pointer'}} 
                        className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
                    >
                        <td className="text-center text-middle fs--2">{e.etapa}</td>
                        <td className="text-center text-middle fs--2">{e.valor || '-'}</td>
                        <td className="text-center text-middle fs--2">{e.percentual || '-'}</td>
                        <td className="text-center text-middle fs--2">
                            <span className={`badge bg-${e.color}`}>{e.aberta}</span>
                        </td>
                        <td className="text-center text-middle fs--2">
                            <span className={`badge bg-${e.color_status}`}>{e.status}</span>
                        </td>
                        <td className="text-center text-middle fs--2">
                            <FontAwesomeIcon icon={faPencil} className='me-2' onClick={() => setModalform({show:true, data:e})}/>
                            <FontAwesomeIcon icon={faTrash} 
                                onClick={() => setModal({show:true, link:`${process.env.REACT_APP_API_URL}/finances/contratos-pagamentos/${e.id}/`})}
                            />
                        </td>
                    </tr>
                )} 
                </tbody>
            </Table>
            <h6 style={{fontSize: '12px'}} className='fw-bold mb-1'>Processos vinculados a este contrato 
                <span className='text-info ms-1'>({card && card.list_processos.length} card(s) em produtos)</span>
            </h6>
            <Table responsive className="mt-1">
                <thead className="bg-300">
                    <tr>
                        <th scope="col" className="text-center text-middle">Processo</th>
                        <th scope="col" className="text-center text-middle">Detalhamento</th>
                        <th scope="col" className="text-center text-middle">Card</th>
                        <th scope="col" className="text-center text-middle">Fase</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {card && card.list_processos.map(p => 
                    <tr key={p.id} style={{cursor:'pointer'}} onClick={() => window.open('/pipeline/'+p.url,'_blank') } 
                        className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
                    >
                        <td className="text-center text-middle fs--2">{p.id}</td>
                        <td className="text-center text-middle fs--2">{p.detalhamento || '-'}</td>
                        <td className="text-center text-middle fs--2">{p.card || '-'}</td>
                        <td className="text-center text-middle fs--2">{p.phase || '-'}</td>
                    </tr>
                )} 
                </tbody>
            </Table>
            <div>
                <strong>Outras Ações</strong>
                {card.etapas.length > 0 && (card.valor || card.percentual) ?
                    <div className='mt-1'>
                        <Link className='btn btn-sm btn-success py-0 fs--2' 
                            to={`${process.env.REACT_APP_API_URL}/finances/contracts-pdf/${card.uuid}`}
                        ><FontAwesomeIcon icon={faBolt} className='me-1' />Gerar Contrato</Link>
                    </div>
                : <div className='text-primary mt-1'>Nenhuma Ação disponível</div>
                }
            </div>
        </Col>
    </Row>
    </>
    :
    <div>
        <Placeholder animation="glow">
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
            <Placeholder xs={4} />
            <Placeholder xs={6} /> <Placeholder xs={8} />
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
        </Placeholder>    
    </div>}
    <ModalDelete show={modal.show} link={modal.link} close={() => setModal({...modal, show:false})} 
        update={modal.link && modal.link.includes('servicos') ? posdelete : submit} 
    />
    <Modal
        size="xl"
        show={modalform.show}
        onHide={() => setModalform({show:false})}
        dialogClassName="mt-7"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            {modalform.type !== 'c' && (!modalform.data ? 'Adicionar Etapa' : 'Atualizar Etapa')}
            {modalform.type === 'c' && 'Atualizar Contrato'}
        </Modal.Title>
            <CloseButton onClick={() => setModalform({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <Row className="flex-center sectionform">
            {(card && modalform.type !== 'c') && (!modalform.data 
                ? <FormEtapa type='add' contrato={card} submit={submit}/> 
                : <FormEtapa type='edit' contrato={card} data={modalform.data} submit={submit}/>
            )}
            {card && modalform.type === 'c' &&
                <ContratoForm type='edit' hasLabel data={card} />
            }
            </Row>
        </Modal.Body>
    </Modal>
    </>
    );
};
  
export default ViewContrato;
  

