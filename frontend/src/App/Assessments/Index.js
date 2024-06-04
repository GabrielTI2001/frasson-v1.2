import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table} from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../Main";
import { HandleSearch } from "../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faSquarePollVertical, faTrash } from "@fortawesome/free-solid-svg-icons";

const InitData = {
    'title': 'Assessments'
}

const IndexAssessments = () => {
    const [avaliacoes, setAvaliacoes] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();

    const setter = (responsedata) => {
        setAvaliacoes(responsedata.avaliacoes)
    }
    const click = (uuid) =>{
        navigate('/assessments/'+uuid)
    }
   
    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', 'assessments/index', setter)
            if (status === 401) navigate("/auth/login")
        }
        if ((user.permissions && user.permissions.indexOf("add_avaliacao_colaboradores") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!avaliacoes){
            getdata()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <h5 className="fs-0 fw-bold">Avaliações</h5>
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
                    <FontAwesomeIcon icon={faSquarePollVertical} className="me-2" onClick={() => click(registro.uuid)}/>
                    <FontAwesomeIcon icon={faPenSquare} className="me-2"/>
                    <FontAwesomeIcon icon={faTrash}/>
                </td>
            </tr>
            )} 
            </tbody>
        </Table>
        : <div className="text-center"><Spinner /></div>
        }
        </>
    );
  };
  
  export default IndexAssessments;
  