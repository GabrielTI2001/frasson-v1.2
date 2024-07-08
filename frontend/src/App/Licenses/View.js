import { useEffect, useState } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Modal, CloseButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashCan, faDownload } from "@fortawesome/free-solid-svg-icons";
import ModalDelete from "../../components/Custom/ModalDelete";
import Info from "../../components/Custom/Info";
import { RetrieveRecord } from "../../helpers/Data";
import FormLicenca from "./Form";

const ViewLicenca = () => {
    const {uuid} = useParams()
    const [licenca, setLicenca] = useState()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [modal, setModal] = useState({show:false, type:null})
    const navigate = useNavigate();
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/`

    const del = () =>{
        navigate('/licenses')
    }

    const setter = (data) =>{
        setLicenca(data)
        setModal({show:false})
    }

    useEffect(() =>{
        const getData = async () => {
            const status = await RetrieveRecord(uuid, 'licenses/index', setter)
            if (status === 401) navigate("/auth/login")
        }
        if ((user.permissions && user.permissions.indexOf("view_cadastro_licencas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!licenca){
            getData()
        }
    }, [])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/licenses'}>Cadastro Licenças</Link>
            </li>
            {licenca && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    {licenca.str_beneficiario}
               </li>             
            )}
        </ol>
        { licenca ? (
            <Row className="mb-2">
                <Col xl={6} sm={4}>
                    <Info title="Requerente" description={licenca.str_beneficiario || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="CPF/CNPJ" description={licenca.cpf_cnpj || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="Instituição Ambiental" description={licenca.str_instituicao || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="Tipo de Licença" description={licenca.str_tipo_licenca || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="Detalhamento da Licença" description={licenca.detalhe_licenca || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="N° Requerimento" description={licenca.numero_requerimento || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="N° Processo" description={licenca.numero_processo || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="N° Licença" description={licenca.numero_licenca || '-'} />
                </Col>
                <Col xl={6} sm={12}>
                    <Info title="Propriedades Beneficiadas" 
                    description={licenca.list_propriedades ? licenca.list_propriedades.map(l => l.label).join(", ") : '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="Área Beneficiada (ha)" description={licenca.area_beneficiada || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="Data Emissão" description={licenca.data_emissao 
                        ? new Date(licenca.data_emissao).toLocaleDateString('pt-BR', {timeZone:'UTC'}) 
                    : '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <strong className="d-block text-dark mb-1">Data Validade</strong>
                    <span>{licenca.data_validade
                        ? new Date(licenca.data_validade).toLocaleDateString('pt-BR', {timeZone:'UTC'}) 
                    : '-'}</span>
                    <span className={`ms-2 badge fs--2 bg-${licenca.status.color}`}>{licenca.status.text}</span>
                </Col>
                <Col xl={6} sm={4}>
                    <Info title="Descrição" description={licenca.descricao || '-'} />
                </Col>
                <Col xl={6} sm={4}>
                    <strong className="d-block text-dark mb-1">Data Limite Renovação</strong>
                    <span>{licenca.data_renovacao
                        ? new Date(licenca.data_renovacao).toLocaleDateString('pt-BR', {timeZone:'UTC'}) 
                    : '-'}</span>
                    <span className={`ms-2 badge fs--2 bg-${licenca.status.color}`}>{licenca.status.text}</span>
                </Col>
                <Col xl={12} sm={12}>
                    <div><strong>Criado Por:</strong></div>
                    <span>
                        <strong className="text-primary">{licenca.info_user.first_name} {licenca.info_user.last_name}</strong>
                        {" em " + 
                            new Date(licenca.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})+" às "+
                            new Date(licenca.created_at).toLocaleTimeString('pt-BR')}
                        </span>
                </Col>
                <hr className="mb-2 mt-1 ms-3" style={{width: '98%'}}></hr>
                <div className="d-flex ps-3">
                    <Col lg={'auto'} xxl={'auto'} className="me-1 mb-1">
                        <Link className="btn btn-primary py-0 px-2 ms-0" onClick={() => {setModal({show:true, type:'edit'})}}>
                            <FontAwesomeIcon icon={faPen} className="me-2"></FontAwesomeIcon>Editar Licença
                        </Link>
                    </Col>
                    <Col lg={'auto'} xxl={'auto'} className="">
                        <Link className="btn btn-danger py-0 px-2" onClick={() => {setModal({show:true, type:'delete'})}}>
                            <FontAwesomeIcon icon={faTrashCan} className="me-2"></FontAwesomeIcon>Excluir Licença
                        </Link>
                    </Col>
                </div>
            </Row>
        ) : (
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
      )}
    <Modal
        size="xl"
        show={modal.show && modal.type === 'edit'}
        onHide={() => setModal(false)}
        dialogClassName="mt-7"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Editar Licença
            </Modal.Title>
                <CloseButton onClick={() => setModal({...modal, show:false})}/>
            </Modal.Header>
            <Modal.Body>
                <Row className="flex-center sectionform">
                    <FormLicenca hasLabel type='edit' data={licenca} submit={setter}/>
                </Row>
        </Modal.Body>
    </Modal>
    <ModalDelete show={modal.show && modal.type === 'delete'} link={`${process.env.REACT_APP_API_URL}/licenses/index/${uuid}`} 
        close={() => setModal(false)} update={del}
    />
    </>
    );
  };
  
  export default ViewLicenca;
  