import { faDownload, faInfoCircle, faMap, faMapLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { Button, CloseButton, Col, Modal, Nav, Placeholder, Row } from "react-bootstrap"
import AdvanceTableWrapper from "../../../components/common/advance-table/AdvanceTableWrapper"
import { columnsPontoAPPO } from "../Data"
import AdvanceTable from "../../../components/common/advance-table/AdvanceTable"
import AdvanceTableFooter from "../../../components/common/advance-table/AdvanceTableFooter"
import GoogleMap from "../../../components/map/GoogleMap"
import MapInfo from "../MapInfo"
import PontoForm from "./PontoForm"
import ModalDelete from "../../../components/Custom/ModalDelete"
import { AmbientalContext } from "../../../context/Context"
import { Link } from "react-router-dom"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>APPO
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
                <FontAwesomeIcon icon={faMapLocationDot} className="me-1"/>Poços
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export const CoordenadasMap = ({}) =>{
    const {ambientalState:{appo}, ambientalDispatch} = useContext(AmbientalContext)
    return (
        appo && appo.coordenadas && appo.coordenadas.length > 0 ?
        <>
        <div className='align-items-center justify-content-between p-2 py-1 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
            <span className="p-0 me-2 fw-bold">{appo.coordenadas.length} Poço(s)</span>
            <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/appo/kml/${appo.id}`} 
                className="ms-0 fs-0"
            >
              <FontAwesomeIcon icon={faDownload} />
            </Link>
        </div>
        <GoogleMap
            initialCenter={{
                lat: Number(appo.coordenadas[0].latitude_gd),
                lng: Number(appo.coordenadas[0].longitude_gd)
            }}
            mapStyle="Default"
            className="rounded-soft mt-0 google-maps container-map"
            token_api={appo.token_apimaps}
            mapTypeId='satellite'
            coordenadas={appo.coordenadas}
            infounlink
        >
        <MapInfo type='appo'/>
        </GoogleMap>
        </>  : <div className="msg-lg" style={{fontSize:'18px'}}>Nenhum Poço Cadastrado</div> 
    )
  }

export const TablePoints = ({}) =>{
    const {ambientalState:{appo}, ambientalDispatch} = useContext(AmbientalContext)
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
        ambientalDispatch({type:'REMOVE_PONTO_APPO',payload:{id:modal.data}})
    }
  
    return (
        appo &&
        <>
            <div className="mb-2">
                <Button onClick={() => onClickPoint(null, 'add')} className='btn-success py-0'>Adicionar Poço</Button>
            </div>
            {appo.coordenadas ? (appo.coordenadas.length > 0 ?
                <AdvanceTableWrapper
                    columns={columnsPontoAPPO}
                    data={appo.coordenadas}
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
                            rowCount={appo.coordenadas.length}
                            table
                            rowInfo
                            navButtons
                            rowsPerPageSelection
                        />
                    </div>
                </AdvanceTableWrapper> 
                : <div className="text-danger msg-lg" style={{fontSize:'18px'}}>Nenhum Poço Cadastrado! Necessário Adicionar</div>)
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
                size="lg"
                show={modal.show && (modal.type === 'edit' || modal.type === 'add')}
                onHide={() => {setModal({show:false})}}
                dialogClassName="mt-7"
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {modal.type === 'edit' ? "Editar " : "Adicionar "}Ponto
                </Modal.Title>
                    <CloseButton onClick={() => {setModal({show:false})}}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">
                        <PontoForm hasLabel data={modal.data} type={modal.type} update={update}></PontoForm>
                    </Row>
                </Modal.Body>
            </Modal>
            <ModalDelete show={modal.show && modal.type === 'delete'} close={() => {setModal({show:false})}} 
                update={posdelete} link={`${process.env.REACT_APP_API_URL}/environmental/inema/appo/coordenadas-detail/${modal.data}/`}
            />
        </>  
    )
  }