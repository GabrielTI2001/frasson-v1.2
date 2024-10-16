import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Placeholder} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsOutorga } from "../Data";
import OutorgaForm from "./OutorgaForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocation } from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../../helpers/Data";
import ModalRecord from "./Modal";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb, { FloatButton, ModalForm } from "../../../components/Custom/Commom";

const IndexOutorgas = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [isloading, setIsLoading] = useState(false)
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false})

    const onClick = (id, uuid) =>{
        const url = `/ambiental/inema/outorgas/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
        setIsLoading(false)
    }
    const handleChange = async (value) => {
        setIsLoading(true)
        HandleSearch(value, 'licenses/index', setter)
    };
    const reducer = (type, data) =>{
        if (type == 'add'){
            setSearchResults([data, ...searchResults])
            setShowModal(false)
            navigate(`/ambiental/inema/outorgas/${data.uuid}`);
        }
        else if (type === 'edit' && searchResults){
            setSearchResults([...searchResults.map(reg =>
                parseInt(reg.id) === parseInt(data.id) ? data : reg
            )])
        }
        else if (type === 'delete' && searchResults){
            setSearchResults(searchResults.filter(r => r.uuid !== data))
        }
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_processos_outorga") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', 'environmental/inema/outorgas', setSearchResults)
            if (status === 401) RedirectToLogin(navigate);
        }
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            if (!searchResults){
                search()
            }
        }
    },[uuid])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/home'}>Home</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Processos Outorga
            </span>  
        </CustomBreadcrumb>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsOutorga}
            data={searchResults}
            sortable
            pagination
            perPage={15}
        >
        <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
            <Col xl={4} sm={6} xs={12}>
                <AdvanceTableSearchBox table onSearch={handleChange}/>
            </Col>
            <Col xl={'auto'} sm='auto' xs={'auto'}>
                <Link className="text-decoration-none btn btn-info shadow-none fs--2"
                style={{padding: '2px 5px'}} to={'../outorga/map'}>
                    <FontAwesomeIcon icon={faMapLocation} className="me-1" />Mapa
                    </Link>
            </Col>
        </Row>
        {isloading ? 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        :
            <AdvanceTable
                table
                headerClassName="text-nowrap align-middle fs-xs"
                rowClassName='align-middle white-space-nowrap fs-xs'
                tableProps={{
                    bordered: true,
                    striped: false,
                    className: 'fs-xs mb-0 overflow-hidden',
                    index_status: 6
                }}
                Click={onClick}
            />
        }       

        <div className="mt-3">
            <AdvanceTableFooter
            rowCount={searchResults.length}
            table
            rowInfo
            navButtons
            rowsPerPageSelection
            />
        </div>
        </AdvanceTableWrapper> : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        }
        <ModalRecord show={modal.show} reducer={reducer}/>
        <FloatButton title='Nova Portaria' onClick={() =>{setShowModal(true)}}/>
        <ModalForm show={showmodal} onClose={() => setShowModal(false)} title={'Nova Portaria de Outorga - INEMA'}>
            <OutorgaForm hasLabel type='add' submit={reducer} />
        </ModalForm>
        </>
    );
  };
  
  export default IndexOutorgas;
  