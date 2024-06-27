import React,{useEffect, useState} from 'react';
import { useParams, useNavigate} from "react-router-dom";
import { RetrieveRecord } from '../../helpers/Data';
import { Link } from 'react-router-dom';
import { Row, Modal, CloseButton, Placeholder, Button, Form, Col } from 'react-bootstrap';
import KMLMap from '../../components/map/KMLMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faEarthAmericas , faHashtag, faClipboard, faBuildingColumns, faSackDollar, faCalendar, faPercent, 
faLocationDot, faCircleDollarToSlot, faFileLines, faCircleCheck, faPenToSquare,
faTrash,
faPencil} from '@fortawesome/free-solid-svg-icons';
import FormAlongamento from '../Alongamentos/Form';
import Edit from '../Alongamentos/Edit';
import PolygonMap from '../../components/map/PolygonMap';
import OperacoesForm from './Form';
import ModalDelete from '../../components/Custom/ModalDelete';
import { ApiCedula } from './Data';
import { toast } from 'react-toastify';

const ViewCredit = () => {
    const {uuid} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [operacao, setOperacao] = useState()
    const [modalform, setModalForm] = useState({show:false, id:null, type:null})
    const [modaloperacao, setModalOperacao] = useState({show:false, id:null, type:null})
    const [modaldelete, setModalDelete] = useState({show:false, link:null})
    const [newimg, setNewImg] = useState()

    const setter = (data) =>{
        setOperacao(data)
    }
    const update = (type, data, id) =>{
        if (type === 'edit'){
            setOperacao(data)
        }
        if (type === 'delete'){
            navigate("/credit")
        }
        setModalForm({show:false})
        setModalOperacao({show:false})
    }

    const action = async (type, data) =>{
        if (type === 'edit'){
            const formDataToSend = new FormData();
            formDataToSend.append('file', data.file);
            formDataToSend.append('operacao', operacao.id);
            const response = await ApiCedula(formDataToSend, data.id, 'edit')
            const dataapi = await response.json()
            if (response.status === 200 || response.status === 201){
                toast.success("Arquivo Atualizado com Sucesso!")
                setOperacao(
                    {...operacao, cedulas:operacao.cedulas.map(cedula => cedula.id === dataapi.id ? {...cedula, url:'/media/'+dataapi.path}:cedula)}
                )
            }
            else{
                toast.error(data.error)
            }
        }
        if (type === 'add'){
            const formDataToSend = new FormData();
            for (let i = 0; i < newimg.file.length; i++) {
                formDataToSend.append('file', newimg.file[i]);
            }
            formDataToSend.append('operacao', operacao.id);
            const response = await ApiCedula(formDataToSend, null, 'add')
            const data = await response.json()
            console.log(data)
            if (response.status === 200 || response.status === 201){
                toast.success("Arquivo Adicionado com Sucesso!")
                setOperacao({...operacao, cedulas:[...operacao.cedulas, ...data.map(d => ({id:d.id, url:d.url, name:`Cédula ${d.id}`}))]})
            }
            else{
                toast.error(data.error)
            }
        }
        else if (type === 'delete'){
            setOperacao({...operacao, cedulas:operacao.cedulas.filter(c => c.id !== parseInt(data))})
        }
    }

    const mudaarquivo = (e) =>{
        action('edit', {id:e.target.id, file:e.target.files[0]})
    }


    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(uuid, 'credit/operacoes-contratadas', setter)
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
            <Link className="link-fx text-primary" to={'/credit'}>Operações Contratadas</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {operacao && operacao.str_beneficiario+' ('+operacao.numero_operacao+')'}
        </li>  
    </ol>
    {operacao ? <>
    <Row className='mt-2 mb-0 gy-2' xl={2} sm={1}>
        <Col>
            <div className="d-flex py-0 mb-1">
                <a className="flex-shrink-0 me-3 ms-0 pt-2 overlay-container overlay-bottom" href={operacao.url} target="_blank">
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
                <span className='fw-bold text-info me-1' style={{fontSize:'10px'}}>{operacao.str_created_by}</span>
                em {new Date(operacao.created_at).toLocaleDateString('pt-BR', {timeZone:'UTC'})+' às '}
                {new Date(operacao.created_at).toLocaleTimeString('pt-BR')+' '}
            </div>
            <div>
                <FontAwesomeIcon icon={faHashtag} className='me-2' /><strong className='me-1'>Operação:</strong>
                <span className='my-1'>{operacao.numero_operacao ? operacao.numero_operacao : '-'}</span>
            </div>
            <div>
                <FontAwesomeIcon icon={faClipboard} className='me-2' /><strong className='me-1'>Item Financiado:</strong>
                <span className='my-1'>{operacao.str_item_financiado ? operacao.str_item_financiado : '-'}</span>
            </div>
            <div>
                <FontAwesomeIcon icon={faBuildingColumns} className='me-2' /><strong className='me-1'>Instituição:</strong>
                <span className='my-1'>{operacao.str_instituicao ? operacao.str_instituicao : '-'}</span>
            </div>
            <div>
                <FontAwesomeIcon icon={faSackDollar} className='me-2' /><strong className='me-1'>Valor Operação:</strong>
                <span className='my-1'>
                    {operacao.valor_operacao ? Number(operacao.valor_operacao).toLocaleString('pt-BR',{style:'currency', currency:'BRL'}) : '-'}
                </span>
            </div>
            <div>
                <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Data Cédula:</strong>
                <span className='my-1'>
                    {operacao.data_emissao_cedula ? new Date(operacao.data_emissao_cedula).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </span>
            </div>
            <div>
                <FontAwesomeIcon icon={faPercent} className='me-2' /><strong className='me-1'>Taxa de Juros:</strong>
                <span className='my-1'>{operacao.taxa_juros ? Number(operacao.taxa_juros).toLocaleString('pt-BR')+' %' : '-'}</span>
            </div>
            <div>
                <FontAwesomeIcon icon={faLocationDot} className='me-2' /><strong className='me-1'>Imóveis Beneficiados:</strong>
                <span className='my-1'>{operacao.list_imoveis ? operacao.list_imoveis.map(i => i.nome).join(', ') : '-'}</span>
            </div>
            <div>
                <FontAwesomeIcon icon={faCircleDollarToSlot} className='me-2' /><strong className='me-1'>Garantia:</strong>
                <span className='my-1'>{operacao.garantia ? operacao.garantia : '-'}</span>
            </div>
            <div>
                <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Data Prod. Armazenado:</strong>
                <span className='my-1'>{operacao.data_prod_armazenado 
                    ? new Date(operacao.data_prod_armazenado).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </span>
            </div>
            <div>
                <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Primeiro Vencimento:</strong>
                <span className='my-1'>{operacao.data_primeiro_vencimento 
                    ? new Date(operacao.data_primeiro_vencimento).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </span>
            </div>
            <div>
                <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Vencimento:</strong>
                <span className='my-1'>{operacao.data_vencimento 
                    ? new Date(operacao.data_vencimento).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </span>
            </div>
            <div>
                <FontAwesomeIcon icon={faCalendar} className='me-2' /><strong className='me-1'>Safra:</strong>
                <span className='my-1'>{operacao.safra ? operacao.safra : '-'}</span>
            </div>
        </Col>
        <Col>
            <h5 className='fw-bold'>Cédulas: </h5>
            <div className="mb-1 d-flex">
                {operacao.cedulas && operacao.cedulas.map( pdf => 
                    <React.Fragment key={pdf.id}>
                    <Link to={`${process.env.REACT_APP_API_URL}${pdf.url}`} className='me-0'>
                        <button className="btn btn-sm btn-warning text-dark shadow-none badge py-1" style={{fontSize: '10px', fontWeight: '500'}}>
                            <FontAwesomeIcon icon={faFilePdf} className='me-2' />{ pdf.name }
                        </button>
                    </Link>
                    <div className='justify-content-center me-4 d-flex align-items-center'>
                        <FontAwesomeIcon icon={faTrash} style={{maxWidth: '12px', cursor: 'pointer', marginTop:'0px'}} 
                            onClick={() => setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/credit/operacoes-cedulas/${pdf.id}/`})} 
                            className='px-1 py-0 mx-1 fa-2x'
                        />
                        <label className='cursor-pointer px-0 mb-0 w-auto h-auto' htmlFor={pdf.id}>
                        <FontAwesomeIcon icon={faPencil} style={{maxWidth: '15px'}} className='fa-2x' />
                        </label>
                        <input type="hidden" name="id" value={pdf.id} />
                        <input type="file" name="file" className="d-none" id={pdf.id} onChange={mudaarquivo}></input>
                    </div>
                    </React.Fragment>
                )}
            </div>
            <div className='mt-2'>
                <strong>Adicionar Cédula</strong>
                <Form onSubmit={(e) =>{e.preventDefault();action('add')}} className='row'>
                    <Form.Group className="mb-3" as={Col} xl={3}>
                        <Form.Control name="file" type="file" onChange={(e) => setNewImg({file: e.target.files})} multiple
                        className='text-center ps-2'/>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Button type="submit">Enviar</Button>
                    </Form.Group>
                </Form>
            </div>
            <h6 className='fw-bold'>Opções</h6>
            <div className="mb-1 mt-2">
                {operacao.coordenadas.length > 0 && 
                    <Link to={`${process.env.REACT_APP_API_URL}/credit/kml/operacoes/${operacao.uuid}`} className='me-2'>
                        <button className="btn btn-sm btn-info text-dark shadow-none badge" style={{fontSize: '10px', fontWeight: '500'}}>
                            <FontAwesomeIcon icon={faEarthAmericas} className='me-2' />KML
                        </button>
                    </Link>
                }
                <Link className='me-2'>
                    <button className="btn btn-sm btn-primary shadow-none badge" style={{fontSize: '10px', fontWeight: '500'}}
                        onClick={() => setModalOperacao({show:true, data:operacao})}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} className='me-2' />Editar
                    </button>
                </Link>
                <Link className='me-2'>
                    <button className="btn btn-sm btn-danger shadow-none badge" style={{fontSize: '10px', fontWeight: '500'}}
                        onClick={() =>{setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/credit/operacoes-contratadas/${operacao.uuid}/`})}}
                    >
                        <FontAwesomeIcon icon={faTrash} className='me-2' />Excluir
                    </button>
                </Link>
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
                {operacao.alongamento.alongamento_id && <>
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
                    </div></>
                }
            </>
            }
        </Col>
    </Row>
    <h6 className='fw-bold text-info mt-3' style={{fontSize:'12px'}}>Glebas Beneficiadas</h6>
    <PolygonMap
        initialCenter={{
            lat: operacao.coordenadas.length > 0 ? Number(operacao.coordenadas[0]['lat']) : -13.7910,
            lng: operacao.coordenadas.length > 0 ? Number(operacao.coordenadas[0]['lng']) : -45.6814
        }}
        mapStyle="Default"
        className="rounded-soft mt-2 google-maps-l container-map"
        token_api={operacao.token_apimaps}
        mapTypeId='satellite'
        polygons={[{path:operacao.coordenadas}]}
        zoom={13}
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
        aria-labelledby="example-modal-sizes-title-lg"
        scrollable
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
            <div className="">
            {modalform && modalform.type == 'edit' 
                ? <Edit id={modalform.id} update={update} operacao={operacao}/>
                : <FormAlongamento hasLabel type={modalform.type} submit={update} operacao={operacao}/>
            }
            </div>
        </Modal.Body>
    </Modal>

    <Modal
        size="xl"
        show={modaloperacao.show}
        onHide={() => setModalOperacao({show:false})}
        aria-labelledby="example-modal-sizes-title-lg"
        scrollable
    >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            {modaloperacao.data ? 'Editar' : 'Adicionar'} Operação
        </Modal.Title>
            <CloseButton onClick={() => setModalOperacao({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <OperacoesForm type='edit' data={modaloperacao.data} hasLabel  submit={update}/>
        </Modal.Body>
    </Modal>
    <ModalDelete show={modaldelete.show} link={modaldelete.link} close={() => setModalDelete({...modaldelete, show:false})} 
        update={modaldelete.link && modaldelete.link.includes('cedulas') ? action : update} 
    />
    </>
    );
};
  
export default ViewCredit;
  

