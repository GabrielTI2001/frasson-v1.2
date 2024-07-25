import { faDownload, faInfoCircle, faMap, faMapLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { Button, CloseButton, Col, Modal, Nav, Placeholder, Row } from "react-bootstrap"
import AdvanceTableWrapper from "../../../components/common/advance-table/AdvanceTableWrapper"
import { columnsPontoOutorga } from "../Data"
import AdvanceTable from "../../../components/common/advance-table/AdvanceTable"
import AdvanceTableFooter from "../../../components/common/advance-table/AdvanceTableFooter"
import GoogleMap from "../../../components/map/GoogleMap"
import MapInfo from "../MapInfo"
import ModalDelete from "../../../components/Custom/ModalDelete"
import { AmbientalContext } from "../../../context/Context"
import { Link } from "react-router-dom"
import AreaForm from "./AreaForm"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Outorga
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
                <FontAwesomeIcon icon={faMapLocationDot} className="me-1"/>Pontos
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export const CoordenadasMap = ({}) =>{
    const {ambientalState:{outorga}, ambientalDispatch} = useContext(AmbientalContext)
    return (
        outorga && outorga.coordenadas && outorga.coordenadas.length > 0 ?
        <>
            <div>
                <span className="p-0 me-2">{outorga.coordenadas.length} Pontos(s)</span>
                <Link to={`${process.env.REACT_APP_API_URL}/environmental/inema/outorga/kml/${outorga.id}`} 
                    className="btn btn-info py-0 px-2 ms-0 fs--1"
                >
                    <FontAwesomeIcon icon={faDownload} className="me-2" />KML
                </Link>
            </div>
            <GoogleMap
              initialCenter={{
                  lat: Number(outorga.coordenadas[0].latitude_gd),
                  lng: Number(outorga.coordenadas[0].longitude_gd)
              }}
              mapStyle="Default"
              className="rounded-soft mt-2 google-maps container-map"
              token_api={outorga.token_apimaps}
              mapTypeId='satellite'
              coordenadas={outorga.coordenadas}
              infounlink
          >
            <MapInfo/>
          </GoogleMap>
        </>  : <div className="msg-lg" style={{fontSize:'18px'}}>Nenhum Ponto Cadastrado</div> 
    )
  }

export const TablePoints = ({}) =>{
    const {ambientalState:{outorga}, ambientalDispatch} = useContext(AmbientalContext)
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
        ambientalDispatch({type:'REMOVE_PONTO',payload:{id:modal.data}})
    }
  
    return (
        outorga &&
        <>
            <div className="mb-2">
                <Button onClick={() => onClickPoint(null, 'add')} className='btn-success py-0'>Adicionar Ponto</Button>
            </div>
            {outorga.coordenadas ? (outorga.coordenadas.length > 0 ?
                <AdvanceTableWrapper
                    columns={columnsPontoOutorga}
                    data={outorga.coordenadas}
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
                            rowCount={outorga.coordenadas.length}
                            table
                            rowInfo
                            navButtons
                            rowsPerPageSelection
                        />
                    </div>
                </AdvanceTableWrapper> 
                : <div className="text-danger msg-lg" style={{fontSize:'18px'}}>Nenhum Ponto Cadastrado! Necessário Adicionar</div>)
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
                        <AreaForm hasLabel data={modal.data} type={modal.type} update={update}></AreaForm>
                    </Row>
                </Modal.Body>
            </Modal>
            <ModalDelete show={modal.show && modal.type === 'delete'} close={() => {setModal({show:false})}} 
                update={posdelete} link={`${process.env.REACT_APP_API_URL}/environmental/inema/outorga/coordenadas-detail/${modal.data}/`}
            />
        </>  
    )
  }