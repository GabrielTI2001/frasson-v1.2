import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { HandleSearch } from "../../helpers/Data";
import { useAppContext } from "../../Main";

const IndexMyIndicators = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();

    const onClick = (uuid) =>{
        const url = `/kpi/indicators/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
    }

    useEffect(()=>{
        const Search = async () => {
            const status = await HandleSearch('', 'kpi/metas', setter, `?user=${user.id}`) 
            if (status === 401) navigate("/auth/login");
        }
        if (!searchResults){
            Search()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Meus Indicadores
            </li>  
        </ol>
        <span className="fs--1">Você Possui {searchResults && searchResults.length} Indicador</span>
        {searchResults ?
        <Row xl={2} xs={1} className="mt-3">
            <Table responsive className="table-sm">
                <thead className="bg-300">
                    <tr>
                        <th scope="col">INDICADOR</th>
                        <th scope="col">ANO</th>
                        <th scope="col">RESPONSÁVEL</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {searchResults && searchResults.map(reg =>(
                <tr key={reg.uuid} style={{cursor:'pointer'}} onClick={() => onClick(reg.uuid)}>
                    <td className="align-middle fw-bold text-primary">{reg.str_indicator}</td>
                    <td className="align-middle fw-bold text-primary">{reg.year}</td>
                    <td className="py-0">
                        <img className="rounded-circle p-1" src={`${process.env.REACT_APP_API_URL}/media/${reg.user_avatar}`} 
                            alt="Header Avatar" style={{width: '35px'}}
                        />
                        <span className="col-xl-auto col-lg-auto fw-bold text-primary ps-1">{reg.str_responsavel}</span>
                    </td>
                </tr>
                ))} 
                </tbody>
            </Table>
        </Row>
        : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default IndexMyIndicators;
  