
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

const InitData = {
    'columns':columnsAnalisesSolo, 'urlapilist':'register/analysis-soil', 
    'urlview':'/register/analysis/soil/', 'title': 'Análises Solo'
}

const IndexAnaliseSolo = () => {
    const [searchResults, setSearchResults] = useState();
    const [showmodal, setShowModal] = useState(false)
    const navigate = useNavigate();

    const onClick = (data, type) =>{
        if (type === 'view'){
            const url = `${InitData.urlview}${data.uuid}`
            navigate(url)
        }
    }

    const submit = (type, data) =>{
        if (type === 'add'){
            setSearchResults([...searchResults, data])
        }
        setShowModal(false)
    }

    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults)
            if (status === 401) navigate("/auth/login");
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
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                        style={{padding: '2px 5px'}} onClick={() =>{setShowModal(true)}}
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
            show={showmodal}
            onHide={() => setShowModal(false)}
            dialogClassName="mt-5"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    Adicionar Benfeitorias
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center w-100 sectionform">
                        <AnaliseSoloForm hasLabel type='add' submit={submit}/>
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
export default IndexAnaliseSolo;
  