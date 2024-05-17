
import { useState, useEffect } from "react";
import { columnsAnalisesSolo} from "../Data";
import { Link, useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Spinner, Row, Col } from "react-bootstrap";
import { HandleSearch } from "../../../helpers/Data";
import AnaliseSoloForm from "./SoloForm";
import { Modal, CloseButton } from "react-bootstrap";
import { RetrieveRecord } from "../../../helpers/Data";
import ModalDelete from "../../../components/Custom/ModalDelete";

const InitData = {
    'columns':columnsAnalisesSolo, 'urlapilist':'register/analysis-soil', 
    'urlview':'/register/analysis/soil/', 'title': 'Análises Solo'
}

const IndexAnaliseSolo = () => {
    const user = JSON.parse(localStorage.getItem("user"))
    const [searchResults, setSearchResults] = useState();
    const [analise, setAnalise] = useState();
    const [modaldelete, setModalDelete] = useState({show:false, link:''})
    const [showmodal, setShowModal] = useState({show:false, type:''})
    const navigate = useNavigate();

    const onClick = (data, type) =>{
        if (type === 'view'){
            const url = `${InitData.urlview}${data.uuid}`
            navigate(url)
        }
        if (type === 'edit'){
            const edit = async () => {
                const status = await RetrieveRecord(data.uuid, InitData.urlapilist, setter)
                if (status === 401){
                    navigate("/auth/login")
                }
                setShowModal({show:true, type:'edit'})
            }
            edit()
        }
        if (type === 'delete'){
            setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/register/analysis-soil/${data.uuid}/`})
        }
    }

    const setter = (data) =>{
        setAnalise(data)
    }

    const submit = (type, data) =>{
        if (type === 'add'){
            setSearchResults([...searchResults, data])
        }
        if (type === 'edit'){
            setSearchResults([...searchResults.map( analise =>
                analise.id === data.id
                ? data
                : analise
              )])
        }
        if (type === 'delete'){
            setSearchResults([...searchResults.filter( analise => analise.uuid !== data)])
        }
        
        setShowModal({...showmodal, show:false})
    }

    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults)
            if (status === 401) navigate("/auth/login");
        }
        if ((user.permissions && user.permissions.indexOf("view_analise_solo") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!searchResults){
            getdata()
        }
    },[searchResults])

    const handleChange = async (value) => {
        const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
        if (status === 401) navigate("/auth/login");
    };

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/register'}>Cadastros Gerais</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={InitData.columns}
            data={searchResults}
            sortable
            pagination
            perPage={5}
        >
            <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
                <Col xl={4} sm={6} xs={12}>
                    <AdvanceTableSearchBox table onSearch={handleChange}/>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                        style={{padding: '2px 5px'}} onClick={() =>{setShowModal({show:true, type:'add'})}}
                    >Novo Cadastro</Link>
                </Col>
            </Row>     
            <AdvanceTable
                table
                headerClassName="text-nowrap align-middle fs-xs"
                rowClassName='align-middle white-space-nowrap fs-xs'
                tableProps={{
                    bordered: true,
                    striped: false,
                    className: 'fs-xs mb-0 overflow-hidden',
                    showactions: 'true',
                    showview: 'true',
                    index_status: 3
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
            </div>
        </AdvanceTableWrapper> : <div className="text-center"><Spinner></Spinner></div>}
        <Modal
            size="xl"
            show={showmodal.show}
            onHide={() => setShowModal(false)}
            dialogClassName="mt-5"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    
                    {showmodal.type === 'add' 
                        ? 'Adicionar Análise de Solo'
                        : 'Editar Análise de Solo'
                    }  
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center w-100 sectionform">
                    {showmodal.type === 'add' 
                        ? <AnaliseSoloForm hasLabel type='add' submit={submit}/>
                        : <AnaliseSoloForm hasLabel type='edit' submit={submit} data={analise}/>
                    }  
                    </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modaldelete.show} link={modaldelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
        </>
    );
  };
  
export default IndexAnaliseSolo;
  