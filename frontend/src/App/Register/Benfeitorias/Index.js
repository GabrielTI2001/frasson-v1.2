import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsBenfeitorias} from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import BenfeitoriaForm from "./Form";
import ModalDelete from "../../../components/Custom/ModalDelete";
import ModalBenfeitoria from "./Modal";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb, { FloatButton, ModalForm } from "../../../components/Custom/Commom";

const InitData = {
    'columns':columnsBenfeitorias, 'urlapilist':'register/farm-assets', 
    'urlview':'/databases/farm-assets/', 'title': 'Benfeitorias Fazendas'
}

const IndexBenfeitorias = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [modalDelete, setModalDelete] = useState({show:false, link:''})
    const [modal, setModal] = useState({show:false})
    const {uuid} = useParams()

    const onClick = (id, uuid) =>{
        if ((user.permissions && user.permissions.indexOf("view_benfeitorias_fazendas") === -1) && !user.is_superuser){
           navigate("/error/403")
        }
        const url = `${InitData.urlview}${uuid}`
        navigate(url)
    }

    const submit = (type, data, id) => {
        if (type == 'add'){
            setShowModal(false)
        }
        setSearchResults(null)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_benfeitorias_fazendas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults)
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

    const handleChange = async (value) => {
        const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
        if (status === 401) RedirectToLogin(navigate);
        const getdata = async () =>{
            const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
            if (status === 401) RedirectToLogin(navigate);
        }
        getdata()
    };

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/databases'}>Cadastros Gerais</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">{InitData.title}</span>  
        </CustomBreadcrumb>
        {searchResults ? 
            <AdvanceTableWrapper columns={InitData.columns} data={searchResults} sortable pagination perPage={15}>
                <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
                    <Col xl={4} sm={6} xs={12}>
                        <AdvanceTableSearchBox table onSearch={handleChange}/>
                    </Col>
                </Row>     
                <AdvanceTable
                    table headerClassName="text-nowrap align-middle fs-xs" rowClassName='align-middle white-space-nowrap fs-xs'
                    tableProps={{bordered: true, striped: false, className: 'fs-xs mb-0 overflow-hidden'}} Click={onClick}
                />
                <div className="mt-3">
                    <AdvanceTableFooter rowCount={searchResults.length} table rowInfo navButtons rowsPerPageSelection/>
                </div>
            </AdvanceTableWrapper> 
        : <div className="text-center"><Spinner></Spinner></div>}

        <ModalBenfeitoria show={modal.show} reducer={submit}/>

        <FloatButton title='Novo Cadastro' onClick={() =>setShowModal(true)}/>
        <ModalForm show={showmodal} onClose={() => setShowModal(false)} title={'Adicionar Benfeitoria'}>
            <BenfeitoriaForm hasLabel type='add' submit={submit}/>
        </ModalForm>

        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
        </>
    );
  };
  
  export default IndexBenfeitorias;
  