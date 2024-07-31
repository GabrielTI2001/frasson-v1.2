import { useEffect, useState } from "react"
import { Col, Placeholder, Row, Spinner, Tab, Tabs } from "react-bootstrap"
import { columnsPVTEC } from "../Data"
import AdvanceTableWrapper from "../../../components/common/advance-table/AdvanceTableWrapper"
import AdvanceTableSearchBox from "../../../components/common/advance-table/AdvanceTableSearchBox"
import AdvanceTable from "../../../components/common/advance-table/AdvanceTable"
import AdvanceTableFooter from "../../../components/common/advance-table/AdvanceTableFooter"
import { Link, useNavigate, useParams } from "react-router-dom"
import { HandleSearch } from "../../../helpers/Data"
import PVTECModal from "./Modal"
import { RedirectToLogin } from "../../../Routes/PrivateRoute"

const IndexPVTEC = () =>{
    const [searchResults, setSearchResults] = useState()
    const [searchResultsall, setSearchResultsall] = useState()
    const [activeTab, setActiveTab] = useState("my")
    const user = JSON.parse(localStorage.getItem('user'))
    const [modal, setModal] = useState({})
    const navigate = useNavigate();
    const {uuid} = useParams()

    const onClick = (id, uuid) =>{
        const url = `/comercial/pvtec/${uuid}`
        navigate(url)
    }
    const reducer = () => {}
    const handleChange = async (value) => {
        setSearchResults(null)
        const status = await HandleSearch(value, 'pipeline/pvtec', (data) => setSearchResults(data), `?resp=${user.id}`)
        if (status === 401) RedirectToLogin(navigate)
    };
    const handleChange2 = async (value) => {
        setSearchResultsall(null)
        const status = await HandleSearch(value, 'pipeline/pvtec', (data) => setSearchResultsall(data))
        if (status === 401) RedirectToLogin(navigate)
    };
    const handleTabSelect = async (key) => {
        setActiveTab(key)
        if (key  === "all"){
            handleChange2('')
        }
        if (key  === "my"){
            handleChange('')
        }
    }

    useEffect(() => {
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            if (activeTab  === "all"){
                handleChange2('')
            }
            if (activeTab  === "my"){
                handleChange('')
            }
        }
    },[uuid])
    
    return (<>
    <ol className="breadcrumb breadcrumb-alt fs-xs mb-0">
        <li className="breadcrumb-item fw-bold" aria-current="page">
            PVTEC
        </li>  
    </ol>
    <Tabs defaultActiveKey="my" id="uncontrolled-tab-example" onSelect={handleTabSelect}>
        <Tab eventKey="my" title="Minhas PVTECs" className='p-3'>
            <AdvanceTableWrapper
                columns={columnsPVTEC}
                data={searchResults || []}
                sortable
                pagination
                perPage={15}
            >
                <Row className="flex-end-center justify-content-start mb-3 gy-2">
                    <Col xs="auto" sm={6} lg={4}>
                        <AdvanceTableSearchBox table onSearch={handleChange}/>
                    </Col>
                </Row>
                {searchResults ? <>
                    <AdvanceTable
                        table
                        headerClassName="text-nowrap align-middle fs-xs"
                        rowClassName='align-middle white-space-nowrap fs-xs'
                        tableProps={{
                            bordered: true,
                            striped: false,
                            className: 'fs-xs mb-0 overflow-hidden',
                            index_status: 5
                        }}
                        Click={onClick}
                    />
                    <div className="mt-3">
                        <AdvanceTableFooter
                            rowCount={searchResults.length}
                            table
                            rowInfo
                            navButtons
                            rowsPerPageSelection
                        />
                    </div></>
                    : 
                    <div>
                        <Placeholder animation="glow">
                            <Placeholder xs={7} /> <Placeholder xs={4} /> 
                            <Placeholder xs={4} />
                            <Placeholder xs={6} /> <Placeholder xs={8} />
                            <Placeholder xs={7} /> <Placeholder xs={4} /> 
                        </Placeholder>  
                    </div>
                }
            </AdvanceTableWrapper> 
        </Tab>
        <Tab eventKey="all" title="Todas" className='p-3'>
            <AdvanceTableWrapper
                columns={columnsPVTEC}
                data={searchResultsall || []}
                sortable
                pagination
                perPage={15}
            >
                <Row className="flex-end-center justify-content-start mb-3 gy-2">
                    <Col xs="auto" sm={6} lg={4}>
                        <AdvanceTableSearchBox table onSearch={handleChange2}/>
                    </Col>
                </Row>
                {searchResultsall ? <>
                    <AdvanceTable
                        table
                        headerClassName="text-nowrap align-middle fs-xs"
                        rowClassName='align-middle white-space-nowrap fs-xs'
                        tableProps={{
                            bordered: true,
                            striped: false,
                            className: 'fs-xs mb-0 overflow-hidden',
                            index_status: 5
                        }}
                        Click={onClick}
                    />
                    <div className="mt-3">
                        <AdvanceTableFooter
                            rowCount={searchResultsall.length}
                            table
                            rowInfo
                            navButtons
                            rowsPerPageSelection
                        />
                    </div></>
                    : 
                    <div>
                        <Placeholder animation="glow">
                            <Placeholder xs={7} /> <Placeholder xs={4} /> 
                            <Placeholder xs={4} />
                            <Placeholder xs={6} /> <Placeholder xs={8} />
                            <Placeholder xs={7} /> <Placeholder xs={4} /> 
                        </Placeholder>  
                    </div>
                }
            </AdvanceTableWrapper> 
        </Tab>
    </Tabs>
    <PVTECModal show={modal.show} reducer={reducer} />
    </>)
}

export default IndexPVTEC