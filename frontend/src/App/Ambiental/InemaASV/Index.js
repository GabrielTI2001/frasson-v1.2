import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsASV } from "../Data";
import ASVForm from "./Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocation } from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../../helpers/Data";
import ModalRecord from "./Modal";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb, { FloatButton, ModalForm } from "../../../components/Custom/Commom";
import { SkeletBig } from "../../../components/Custom/Skelet";

const IndexASV = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [isloading, setIsLoading] = useState(false)
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false})

    const onClick = (id, uuid) =>{
        const url = `/ambiental/inema/asv/${uuid}`
        navigate(url)
    }

    const setter = (data) =>{
        setSearchResults(data)
        setIsLoading(false)
    }

    const reducer = (type, data) =>{
        if (type == 'add'){
            setSearchResults([data, ...searchResults])
            setShowModal(false)
        }
        else if (type === 'edit' && searchResults){
            setSearchResults([...searchResults.map(reg =>
                reg.uuid === data.uuid ? data : reg
            )])
        }
        else if (type === 'delete' && searchResults){
            setSearchResults(searchResults.filter(r => r.uuid !== data))
        }
    }

    const handleChange = async (value) => {
        setIsLoading(true)
        const status = await HandleSearch(value, 'environmental/inema/asvs', setter)
        if (status === 401){ RedirectToLogin(navigate)}
    };


    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_processos_asv") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])

    useEffect(() => {
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            if (!searchResults){
                handleChange('')
            }
        }
    },[uuid])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Portarias ASV
            </span>
        </CustomBreadcrumb>
        {searchResults ? 
            <AdvanceTableWrapper
                columns={columnsASV}
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
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                    style={{padding: '2px 5px'}} to={'../asv/map'}>
                        <FontAwesomeIcon icon={faMapLocation} className="me-1" />Mapa ASV
                        </Link>
                </Col>
            </Row>
            {isloading ? <SkeletBig />  :
                <AdvanceTable
                    table
                    headerClassName="text-nowrap align-middle fs-xs"
                    rowClassName='align-middle white-space-nowrap fs-xs'
                    tableProps={{
                        bordered: true,
                        striped: false,
                        className: 'fs-xs mb-0 overflow-hidden',
                        index_status: 7
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
        </AdvanceTableWrapper> : <SkeletBig />}
        <ModalRecord show={modal.show} reducer={reducer}/>

        <FloatButton title='Nova Portaria' onClick={() =>{setShowModal(true)}}/>
        <ModalForm show={showmodal} onClose={() => setShowModal(false)} title={'Adicionar Portaria ASV'}>
            <ASVForm hasLabel type='add' reducer={reducer}/>
        </ModalForm>
        </>
    );
  };
  
  export default IndexASV;
  