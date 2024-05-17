import { useEffect, useState } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Modal, CloseButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashCan, faDownload } from "@fortawesome/free-solid-svg-icons";
import ModalDelete from "../../../components/Custom/ModalDelete";
import Info from "../../../components/Custom/Info";
import { RetrieveRecord } from "../../../helpers/Data";
import CircleMap from "../../../components/map/CircleMap";
import PivotForm from "./Form";

const ViewPivot = () => {
    const {uuid} = useParams()
    const [registro, setRegistro] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const [modal, setModal] = useState({show:false, type:null})
    const navigate = useNavigate();

    const del = () =>{
        navigate('/irrigation/pivots')
    }
    const setter = (data) =>{
        setRegistro(data)
    }
    const submit = (type, data) => {
        if (type === 'edit') setRegistro({...data})
        setModal({show:false})
    }

    useEffect(() =>{
        const getData = async () => {
            const status = await RetrieveRecord(uuid, 'irrigation/pivots', setter)
            if (status === 401) navigate("auth/login")
        }
        if ((user.permissions && user.permissions.indexOf("view_cadastro_pivots") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!registro){
            getData()
        }
    }, [registro])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-2">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/irrigation/pivots'}>Processos ASV</Link>
            </li>
            {registro && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    {registro.str_proprietario}
               </li>             
            )}
        </ol>
        { registro ? (
            <Row className="mb-2 gy-1" xl={6} sm={4} xs={1}>
                <Col>
                    <Info title="Nome Proprietário" description={registro.str_proprietario} />
                </Col>
                <Col>
                    <Info title="Propriedade Localização" description={registro.propriedade_localizacao || '-'} />
                </Col>
                <Col>
                    <Info title="Identificação Pivot" description={registro.identificacao_pivot || '-'} />
                </Col>
                <Col>
                    <Info title="Área (ha)" description={registro.area_circular_ha 
                            ? Number(registro.area_circular_ha).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:4})
                            : '-'
                        } 
                    />
                </Col>
                <Col>
                    <h6 className="fs-0 mb-1">
                        <span className="fw-bold" style={{fontSize: '12px'}}>Vazão Total (m<sup>3</sup>/h)</span>
                    </h6>
                    <span className="mb-1 mt-1" style={{fontSize: '12px'}}>{registro.vazao_total_m3_h 
                            ? Number(registro.vazao_total_m3_h).toLocaleString('pt-BR', {minimumFractionDigits:2})
                            : '-'
                        } 
                    </span>
                </Col>
                <Col>
                    <Info title="L. Bruta (mm/21h)" description={registro.lamina_bruta_21_h 
                            ? Number(registro.lamina_bruta_21_h).toLocaleString('pt-BR', {minimumFractionDigits:2})
                            : '-'
                        }
                    />
                </Col>
                <Col>
                    <Info title="Município" description={registro.str_municipio || '-'} />
                </Col>
                <Col>
                    <Info title="Fabricante Pivot" description={registro.str_fabricante || '-'} />
                </Col>
                <Col>
                    <Info title="Raio Irrigado (m)" description={registro.raio_irrigado_m 
                            ? Number(registro.raio_irrigado_m).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:4})
                            : '-'
                        }
                    />
                </Col>
                <Col>
                    <Info title="Comp. Adutora (m)" description={registro.comprimento_adutora_m 
                            ? Number(registro.comprimento_adutora_m).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:4})
                            : '-'
                        }
                    />
                </Col>
                <Col>
                    <Info title="Diâm. Adutora (mm)" description={registro.diametro_adutora_mm 
                            ? Number(registro.diametro_adutora_mm).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:4})
                            : '-'
                        }
                    />
                </Col>
                <Col>
                    <Info title="Modelo Bomba" description={registro.modelo_bomba || '-'} />
                </Col>
                <Col>
                    <Info title="Fabricante Bomba" description={registro.str_fabricante || '-'} />
                </Col>
                <Col>
                    <Info title="Pot. Motor (cv)" description={registro.pot_motor_cv 
                            ? Number(registro.pot_motor_cv).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:4})
                            : '-'
                        }
                    />
                </Col>
                <Col>
                    <Info title="Fabricante Bomba" description={registro.fabricante_motor || '-'} />
                </Col>
                <Col>
                    <Info title="Início Operação" description={registro.data_montagem_pivot 
                            ? new Date(registro.pot_motor_cv).toLocaleDateString('pt-BR', {timeZone:'UTC'})
                            : '-'
                        }
                    />
                </Col>
                <Col>
                    <Info title="Fabricante Bomba" description={`${registro.lat_center_gd} | ${registro.long_center_gd}`} />
                </Col>
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
        <Row className="d-flex gy-1 gx-1">
          {registro &&
            <Col lg={'auto'} xxl={'auto'} className="">
                <Link to={`${process.env.REACT_APP_API_URL}/irrigation/pivot/kml/${registro.id}`} 
                 className="btn btn-info py-0 ms-0">
                    <FontAwesomeIcon icon={faDownload} className="me-2"></FontAwesomeIcon>KML
                </Link>
             </Col>        
          }
            <Col lg={'auto'} xxl={'auto'} className="">
                <Link onClick={() => {setModal({show:true, type:'edit'})}} className="btn btn-primary py-0 px-2 ms-0">
                    <FontAwesomeIcon icon={faPen} className="me-2"></FontAwesomeIcon>Editar Pivot
                </Link>
            </Col>
            <Col lg={'auto'} xxl={'auto'} className="">
                <a className="btn btn-danger py-0 px-2" onClick={() => setModal({show:true, type:'delete'})}>
                    <FontAwesomeIcon icon={faTrashCan} className="me-2"></FontAwesomeIcon>Excluir Pivot
                </a>
            </Col>
        </Row>
      {registro ? 
        <CircleMap
            initialCenter={{
                lat: Number(registro.lat_center_gd) || -13.7910,
                lng: Number(registro.long_center_gd) || -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-2 google-maps container-map"
            token_api={registro.token_apimaps}
            mapTypeId='satellite'
            circles={[{center:{lat:Number(registro.lat_center_gd), lng:Number(registro.long_center_gd)}, 
                radius:Number(registro.raio_irrigado_m)}]}
        >
        </CircleMap>
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
        show={modal.show && modal.type === 'edit'}
        onHide={() => setModal({show:false})}
        dialogClassName="mt-10"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Editar Pivot
            </Modal.Title>
                <CloseButton onClick={() => setModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                <Row className="flex-center w-100 sectionform">
                    <PivotForm hasLabel type='edit' data={registro} submit={submit} />
                </Row>
        </Modal.Body>
    </Modal>
      {registro && (
        <ModalDelete show={modal.show && modal.type === 'delete'} 
            link={`${process.env.REACT_APP_API_URL}/irrigation/pivots/${registro.uuid}/`} 
            close={() => setModal({show:false})} update={del}
        />
      )}

    </>
    );
  };
  
  export default ViewPivot;
  