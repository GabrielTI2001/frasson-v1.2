import { faDownload, faInfoCircle, faMap, faMapLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { Button, CloseButton, Col, Modal, Nav, Placeholder, Row } from "react-bootstrap"
import AdvanceTableWrapper from "../../../components/common/advance-table/AdvanceTableWrapper"
import { columnsPontoASV } from "../Data"
import AdvanceTable from "../../../components/common/advance-table/AdvanceTable"
import AdvanceTableFooter from "../../../components/common/advance-table/AdvanceTableFooter"
import ModalDelete from "../../../components/Custom/ModalDelete"
import { AmbientalContext } from "../../../context/Context"
import { Link } from "react-router-dom"
import AreaForm from "./AreaForm"
import PolygonMap from "../../../components/map/PolygonMap"
import { MapInfoDetailASV } from "./MapInfo"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>ASV
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}
export default NavModal;

export const NavModal2 = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="mapa">
                <FontAwesomeIcon icon={faMap} className="me-1"/>Mapa
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="points">
                <FontAwesomeIcon icon={faMapLocationDot} className="me-1"/>Áreas
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export const CoordenadasMap = ({}) =>{
    const {ambientalState:{asv}, ambientalDispatch} = useContext(AmbientalContext)
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/`;
    return (
        asv && asv.areas && asv.areas.length > 0 ?
        <>
            <div className='align-items-center justify-content-between p-2 py-1 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
                <span className="p-0 me-2 fw-bold">{asv.areas.length} Área(s)</span>
                <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/asv/kml/${asv.id}`}
                    className="ms-0 fs-0"
                >
                    <FontAwesomeIcon icon={faDownload} />
                </Link>
            </div>
            <PolygonMap
                initialCenter={{
                    lat: asv.areas.length > 0 && asv.areas[0].kml.length > 0 ? Number(asv.areas[0].kml[0]['lat']) : -13.7910,
                    lng: asv.areas.length > 0 && asv.areas[0].kml.length > 0 ? Number(asv.areas[0].kml[0]['lng']) : -45.6814
                }}
                mapStyle="Default"
                className="rounded-soft google-maps container-map"
                token_api={asv.token_apimaps}
                mapTypeId='satellite'
                polygons={asv.areas.map(a => ({...a, path:a.kml}))}
                link={link}
            >
                <MapInfoDetailASV />
            </PolygonMap>
        </>  : <div className="msg-lg" style={{fontSize:'18px'}}>Nenhuma Área Cadastrada</div> 
    )
  }

export const TablePoints = ({}) =>{
    const {ambientalState:{asv}, ambientalDispatch} = useContext(AmbientalContext)
    const [modal, setModal] = useState({show:false})
    
    const onClickPoint = (dados, type) =>{
        if (type === 'delete'){
            setModal({show:true, type:'delete', data:dados.id})
        }
        else if (type === 'add'){
            setModal({show:true, type:'add'})
        }
        else{
            setModal({show:true, type:'edit', data:dados})
        }
    }
    const update = () =>{
        setModal({show:false})
    }
    const posdelete = () =>{
        ambientalDispatch({type:'REMOVE_PONTO_ASV',payload:{id:modal.data}})
    }
  
    return (
        asv &&
        <>
            <div className="mb-2">
                <Button onClick={() => onClickPoint(null, 'add')} className='btn-success py-0'>Adicionar Área</Button>
            </div>
            {asv.areas ? (asv.areas.length > 0 ?
                <AdvanceTableWrapper
                    columns={columnsPontoASV}
                    data={asv.areas}
                    sortable
                    pagination
                    perPage={15}
                >
                    <AdvanceTable
                        table
                        headerClassName="text-nowrap align-middle fs-xs"
                        rowClassName='align-middle white-space-nowrap'
                        tableProps={{
                            bordered: true,
                            striped: false,
                            className: 'fs-xs mb-0 overflow-hidden',
                            showactions: 'true',
                        }}
                        Click={onClickPoint}
                    />
                    <div className="mt-3">
                        <AdvanceTableFooter
                            rowCount={asv.areas.length}
                            table
                            rowInfo
                            navButtons
                            rowsPerPageSelection
                        />
                    </div>
                </AdvanceTableWrapper> 
                : <div className="text-danger msg-lg" style={{fontSize:'18px'}}>Nenhuma Área Cadastrada! Necessário Adicionar</div>)
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
                size="md"
                show={modal.show && (modal.type === 'edit' || modal.type === 'add')}
                onHide={() => {setModal({show:false})}}
                dialogClassName="mt-7"
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {modal.type === 'edit' ? "Editar " : "Adicionar "}Área
                </Modal.Title>
                    <CloseButton onClick={() => {setModal({show:false})}}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">
                        <AreaForm hasLabel data={modal.data} type={modal.type} update={update}></AreaForm>
                    </Row>
                </Modal.Body>
            </Modal>
            <ModalDelete show={modal.show && modal.type === 'delete'} close={() => {setModal({show:false})}} 
                update={posdelete} link={`${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/${modal.data}/`}
            />
        </>  
    )
  }