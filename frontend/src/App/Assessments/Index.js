import { useState, useEffect} from "react";
import React from 'react';
import {Row, Table, Modal, CloseButton, Button, Placeholder} from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../Main";
import { GetRecord, HandleSearch } from "../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faSquarePollVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import AdvanceTable from "../../components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "../../components/common/advance-table/AdvanceTableFooter";
import AdvanceTableWrapper from "../../components/common/advance-table/AdvanceTableWrapper";
import ModalDelete from "../../components/Custom/ModalDelete";
import FormAvaliacao from "./FormAva";
import FormQuestion from "./Form";
import { RedirectToLogin } from "../../Routes/PrivateRoute";

const InitData = {
    'title': 'Assessments'
}

const columsQuestions = [
    {
        accessor: 'tipo_display',
        Header: 'Tipo',
        headerProps: { className: 'text-900 p-1' }
    },
    {
        accessor: 'text',
        Header: 'Texto',
        headerProps: { className: 'text-900 p-1' }
    },
    {
        accessor: 'str_category',
        Header: 'Categoria',
        headerProps: { className: 'text-900 p-1' }
    },
]

const IndexAssessments = () => {
    const [avaliacoes, setAvaliacoes] = useState();
    const [perguntas, setPerguntas] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const [showmodal, setShowModal] = useState({show:false,})
    const [modalDelete, setModalDelete] = useState({show:false, link:''})
    const navigate = useNavigate();

    const click = async (type, uuid) =>{
        if (type === 'view'){
            navigate('/assessments/results/'+uuid)
        }
        if (type === 'edit'){
            const record = await GetRecord(uuid, 'assessments/data')
            if (!record){
                RedirectToLogin(navigate)
            }
            setShowModal({show:true, data:record, type:'avaliacao'})
        }
        if (type === 'delete'){
            setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/assessments/data/${uuid}/`})
        }
    }
    const clickquestions = async (data, type) =>{
        if (type === 'edit'){
            const record = await GetRecord(data.uuid, 'assessments/questions')
            if (!record){
                RedirectToLogin(navigate)
            }
            setShowModal({show:true, data:record, type:'question'})
        }
        if (type === 'delete'){
            setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/assessments/questions/${data.uuid}/`, question:true})
        }
    }

    const submit = (type, data) =>{
        if (type !== 'delete'){
            setAvaliacoes(null)
            setShowModal({show:false})
        }
        else{
            setAvaliacoes(avaliacoes.filter(a => a.uuid !== data))
            setModalDelete({show:false})
        }
    }

    const submit_question = (type, data) =>{
        if (type === 'delete'){
            setPerguntas(perguntas.filter(p => p.uuid !== data))
            setModalDelete({show:false})
        }
        if (type === 'add'){
            setPerguntas([...perguntas, data])
            setShowModal({show:false})
        }
        if (type === 'edit'){
            setPerguntas(perguntas.map( reg => reg.id === data.id ? data : reg))
            setShowModal({show:false})
        }
    }
   
   
    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', 'assessments/index', (data) => setAvaliacoes(data.avaliacoes))
            if (status === 401) RedirectToLogin(navigate)
            const status2 = await HandleSearch('', 'assessments/questions', (data) => setPerguntas(data))
        }
        if ((user.permissions && user.permissions.indexOf("add_avaliacao_colaboradores") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!avaliacoes){
            getdata()
        }
    },[avaliacoes])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <h5 className="fs-0 fw-bold mb-3">Avaliações</h5>
        <div><Button className="btn-success btn-sm fs--1" onClick={() => setShowModal({show:true})}>Adicionar Avaliação</Button></div>
        {avaliacoes ? 
            <Table responsive className="mt-3">
                <thead className="bg-300">
                    <tr>
                        <th scope="col" className="text-center text-middle">Descrição</th>
                        <th scope="col" className="text-center text-middle">Data Referência</th>
                        <th scope="col" className="text-center text-middle">Status</th>
                        <th scope="col" className="text-center text-middle">Ações</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {avaliacoes.map(registro =>
                <tr key={registro.id} style={{cursor:'pointer'}} 
                    className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
                >
                    <td className="text-center text-middle fs--2">{registro.descricao}</td>
                    <td className="text-center text-middle fs--2">
                        {registro.data || '-'}
                    </td>
                    <td className="text-center text-middle fs--2">{registro.status}</td>
                    <td className="text-center text-middle fs--2">
                        <FontAwesomeIcon icon={faSquarePollVertical} className="me-2" onClick={() => click('view', registro.uuid)}/>
                        <FontAwesomeIcon icon={faPenSquare} className="me-2" onClick={() => click('edit', registro.uuid)}/>
                        <FontAwesomeIcon icon={faTrash} onClick={() => click('delete', registro.uuid)}/>
                    </td>
                </tr>
                )} 
                </tbody>
            </Table>
        : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        }
        <h5 className="fs-0 fw-bold mb-2">Perguntas do Questionário</h5>
        <div className="mb-3">
            <Button className="btn-success btn-sm fs--1" onClick={() => setShowModal({show:true, type:'question'})}>Adicionar Pergunta</Button>
        </div>
        {perguntas ? 
        <AdvanceTableWrapper
            columns={columsQuestions}
            data={perguntas}
            sortable
            pagination
            perPage={10}
        >
            <AdvanceTable
                table
                headerClassName="text-nowrap align-middle fs-xs"
                rowClassName='align-middle white-space-nowrap fs-xs'
                tableProps={{
                    bordered: true,
                    striped: false,
                    className: 'fs-xs mb-0 overflow-hidden',
                    showactions: 'true'
                }}
                Click={clickquestions}
            />     
            <div className="mt-3">
                <AdvanceTableFooter
                    rowCount={perguntas.length}
                    table
                    rowInfo
                    navButtons
                    rowsPerPageSelection
                />
            </div>
        </AdvanceTableWrapper>
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
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            scrollable
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                   {showmodal.data ? 'Editar': 'Adicionar'} {showmodal.type === 'question' ? 'Pergunta' : 'Avaliação'}
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body className="pb-0">
                    <Row className="flex-center sectionform">
                        {showmodal.type === 'question'
                        ? showmodal.data 
                            ? <FormQuestion  type='edit' hasLabel submit={submit_question} data={showmodal.data}/> 
                            : <FormQuestion type='add' hasLabel submit={submit_question} />                
                        : showmodal.data 
                            ? <FormAvaliacao  type='edit' hasLabel submit={submit} data={showmodal.data}/> 
                            : <FormAvaliacao type='add' hasLabel submit={submit} />
                        }
                    </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} 
            update={modalDelete.question ? submit_question : submit}/>
        </>
    );
  };
  
  export default IndexAssessments;
  