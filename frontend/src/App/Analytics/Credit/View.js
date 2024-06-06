import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Row, Modal, CloseButton, Placeholder } from 'react-bootstrap';
import KMLMap from '../../../components/map/KMLMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faEarthAmericas , faHashtag, faClipboard, faBuildingColumns, faSackDollar, faCalendar, faPercent, 
faLocationDot, faCircleDollarToSlot, faFileLines, faCircleCheck, faPenToSquare} from '@fortawesome/free-solid-svg-icons';
import FormAlongamento from '../../Alongamentos/Form';
import Edit from '../../Alongamentos/Edit';

const ViewCredit = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [operacao, setOperacao] = useState()
    const [modalform, setModalForm] = useState({show:false, id:null, type:null})

    const setter = (data) =>{
        setOperacao(data)
    }
    const update = (data) =>{
        setModalForm({show:false})
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'pipefy/operacoes-contratadas', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_operacoes_contratadas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!operacao){
            getdata()
        }
    },[])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/analytics/credit'}>Operações Contratadas</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {operacao && operacao.pipefy.nome+' ('+operacao.pipefy.n_da_opera_o+')'}
        </li>  
    </ol>
    {operacao ? <>
    <Row className='mt-2 mb-0 gy-1'>
    <   div className="d-flex py-0 mb-1">
            <a className="flex-shrink-0 me-3 ms-0 pt-2 overlay-container overlay-bottom" href={operacao.pipefy.url} target="_blank">
                <img className="rounded-circle" src={`${process.env.REACT_APP_API_URL}/media/avatars/clients/default-avatar.jpg`}
                 alt="Avatar User" style={{width:'65px'}}/>
            </a>
            <div className="flex-grow-1 mt-3" style={{color: 'rgb(12, 26, 53)'}}>
                <div className="fw-bold fs--1 mb-1">{operacao.str_beneficiario }</div>
                <div className="fw-bold fs--2 mb-1">{operacao.cpf_beneficiario }</div>
                <div className="fw-normal text-secondary fs-xs mb-2">{ operacao.rg_beneficiario ? operacao.rg_beneficiario : '-'}</div>
            </div>
        </div>
        <div style={{fontSize:'10px'}} className='mb-2'>
            <b style={{fontSize:'10px'}}>Criado por: </b>
            <span className='fw-bold text-info' style={{fontSize:'10px'}}>{operacao.pipefy.created_by}</span>
            em {operacao.pipefy.created_at}
        </div>
        <div>
            <FontAwesomeIcon icon={faHashtag} className='me-2' /><strong className='me-1'>Operação:</strong>
            <span className='my-1'>{operacao.pipefy.n_da_opera_o ? operacao.pipefy.n_da_opera_o : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faClipboard} className='me-2' /><strong className='me-1'>Item Financiado:</strong>
            <span className='my-1'>{operacao.pipefy.item_financiado ? operacao.pipefy.item_financiado : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faBuildingColumns} className='me-2' /><strong className='me-1'>Instituição:</strong>
            <span className='my-1'>{operacao.pipefy.institui_o_financeira ? operacao.pipefy.institui_o_financeira : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faSackDollar} className='me-2' /><strong className='me-1'>Valor Operação:</strong>
            <span className='my-1'>{operacao.pipefy.valor_da_opera_o ? operacao.pipefy.valor_da_opera_o : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Data Cédula:</strong>
            <span className='my-1'>{operacao.pipefy.data_da_emiss_o_da_c_dula ? operacao.pipefy.data_da_emiss_o_da_c_dula : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faPercent} className='me-2' /><strong className='me-1'>Taxa de Juros:</strong>
            <span className='my-1'>{operacao.pipefy.taxa_juros ? operacao.pipefy.taxa_juros+' %' : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faLocationDot} className='me-2' /><strong className='me-1'>Imóveis Beneficiados:</strong>
            <span className='my-1'>{operacao.pipefy.im_vel_ies ? operacao.pipefy.im_vel_ies : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faCircleDollarToSlot} className='me-2' /><strong className='me-1'>Garantia:</strong>
            <span className='my-1'>{operacao.pipefy.garantia ? operacao.pipefy.garantia : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Primeiro Vencimento:</strong>
            <span className='my-1'>{operacao.pipefy.data_do_primeiro_vencimento ? operacao.pipefy.data_do_primeiro_vencimento : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Vencimento:</strong>
            <span className='my-1'>{operacao.pipefy.data_do_vencimento ? operacao.pipefy.data_do_vencimento : '-'}</span>
        </div>
        <div>
            <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Safra:</strong>
            <span className='my-1'>{operacao.pipefy.safra ? operacao.pipefy.safra : '-'}</span>
        </div>
        <div className="mb-2">
            <span className="fs-xs fw-normal"><Link to={operacao.pipefy.url} target="_blank" className="fw-bold">Clique Aqui</Link> para visualizar o registro no Pipefy.</span>
        </div>
        
        <div className="mb-1">
          {operacao.pipefy.c_dula_digitalizada && operacao.pipefy.c_dula_digitalizada.map( pdf =>
            <Link to={pdf.url} key={pdf.url}>
                <button className="btn btn-sm btn-warning text-dark shadow-none badge" style={{fontSize: '10px', fontWeight: '500'}}>
                    <FontAwesomeIcon icon={faFilePdf} className='me-2' />{ pdf.file_name }
                </button>
            </Link>
          )}
        </div>
        
        <div>
            {operacao.pipefy.kml_files && operacao.pipefy.kml_files.map(kml =>
            <Link to={kml.url} key={kml.url}>
                <button className="btn btn-sm btn-info text-dark shadow-none badge" style={{fontSize: '10px', fontWeight: '500'}}>
                    <FontAwesomeIcon icon={faEarthAmericas} className='me-2' />{ kml.file_name }
                </button>
            </Link>
            )}
        </div>
        {/* operacao.alongamento.alongamento_permission !operacao.alongamento.along */}
        {operacao.alongamento.alongamento_permission && 
            <>
            <h6 className="fs-xs fw-bold text-info mb-1 mt-4">Alongamentos</h6>
            <hr className="mb-1 mt-1" />
            {!operacao.alongamento.along && <>
                <div className="mb-1"><span className="fw-normal fs-xs">Operação sem alongamento</span></div>
                <div className='mt-0'><Link onClick={() => setModalForm({show:true, type:'add'})}>
                    <button className="btn btn-sm btn-primary shadow-none fw-semibold mb-1" style={{fontSize: '10px'}}>
                        <FontAwesomeIcon icon={faFileLines} className='me-2' />Alongar Operação
                    </button>
                </Link></div>
            </>}
            <div className="mb-1 fs-xs fw-normal">
                <FontAwesomeIcon icon={faCircleCheck} className='me-2' />
                Operação de alongamento no valor de <span className="fw-bold">{ operacao.alongamento.alongamento_total }</span>
            </div>
            <div className='mb-2 mt-0'>
                <Link to={`${process.env.REACT_APP_API_URL}/alongamentos/pdf/${operacao.alongamento.alongamento_id}`}>
                    <button className="btn btn-sm btn-warning shadow-none fw-semibold me-1" style={{fontSize: '10px'}}>
                    <FontAwesomeIcon icon={faFilePdf} className='me-2' />Arquivo PDF</button>
                </Link>
                <Link onClick={() => setModalForm({show:true, type:'edit', id:operacao.alongamento.alongamento_id})}>
                    <button className="btn btn-sm btn-info shadow-none fw-semibold" style={{fontSize: '10px'}}>
                    <FontAwesomeIcon icon={faPenToSquare} className='me-2' />Editar Alongamento</button>
                </Link>
            </div>
           </>
        }
    </Row>
    <h6 className='fw-bold text-info' style={{fontSize:'12px'}}>Glebas Beneficiadas</h6>
    <KMLMap
        mapStyle="Default"
        className="rounded-soft mt-0 google-maps-l container-map-l"
        token_api={operacao.token_apimaps}
        initialCenter={{lat: -13.397, lng: -45.644}}
        mapTypeId='satellite'
        urls={operacao.pipefy.glebas_beneficiadas ? operacao.pipefy.glebas_beneficiadas : []}
    />
    </>
    :
    <div>
        <Placeholder animation="glow">
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
            <Placeholder xs={4} />
            <Placeholder xs={6} /> <Placeholder xs={8} />
        </Placeholder>    
    </div>   
    }
    <Modal
        size="xl"
        show={modalform.show}
        onHide={() => setModalForm({show:false})}
        dialogClassName="mt-1"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            {modalform && modalform.type == 'edit' 
                ? 'Editar Alongamento'
                : 'Adicionar Alongamento'
            }
        </Modal.Title>
            <CloseButton onClick={() => setModalForm({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <div className="w-100">
            {modalform && modalform.type == 'edit' 
                ? <Edit id={modalform.id} update={update}/>
                : <FormAlongamento hasLabel type={modalform.type} submit={update}/>
            }
            </div>
        </Modal.Body>
    </Modal>
    </>
    );
};
  
export default ViewCredit;
  

