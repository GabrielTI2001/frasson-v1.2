import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table, Form} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AsyncSelect from 'react-select/async';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from "../../../Main";
import { fetchPessoal, fetchInstituicoesRazaoSocial } from "../../Pipefy/Data";


const InitData = {
    'urlapilist':'analytics/regime', 
    'urlview':'/analytics/regime', 'title': 'Regimes de Exploração'
}

const IndexRegimes = () => {
    const [searchResults, setSearchResults] = useState();
    const [formData, setFormData] = useState({});
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();

    const Search = async (urlapi, cliente, instituicao) => {
        const token = localStorage.getItem("token")
        const params = cliente && instituicao ? `?cliente=${cliente}&instituicao=${instituicao}` : '';
        const url = `${process.env.REACT_APP_API_URL}/${urlapi}/${params}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();
            if (response.status === 401) {
                localStorage.setItem("login", JSON.stringify(false));
                localStorage.setItem('token', "");
            } else if (response.status === 200) {
                setSearchResults(data)
            }
            return response.status
        } catch (error) {
            console.error('Erro:', error);
        }
      };
   
    useEffect(()=>{
        const getdata = async () =>{
            Search(InitData.urlapilist)
        }
        if (!searchResults){
            getdata()
        }
    },[])

    const handleChange = async (value) => {
        console.log("teste")
        if(formData.cliente && formData.instituicao){
            console.log("teste")
        }
    };

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <Row>
            <Form.Group className="mb-2" as={Col} lg={4}>
                <Form.Label className='fw-bold mb-1'>Nome cliente</Form.Label>
                <AsyncSelect loadOptions={fetchPessoal} name='cliente' 
                    styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                    onChange={(selected) => {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        cliente: selected.value
                    }));
                    handleChange(selected)
                }} />
            </Form.Group>
        </Row>
        {searchResults ? 
        <Table responsive>
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center">Código Imóvel</th>
                    <th scope="col" className="text-center">Matrícula</th>
                    <th scope="col" className="text-center">Nome Propriedade</th>
                    <th scope="col" className="text-center">Regime Exploração</th>
                    <th scope="col" className="text-center">Atividade Explorada</th>
                    <th scope="col" className="text-center">Data Início</th>
                    <th scope="col" className="text-center">Data Término</th>
                    <th scope="col" className="text-center">Área Cedida (ha)</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {searchResults.map(regime =>(
            <tr key={regime.id} style={{cursor:'auto'}}>
                <td className="text-center">{regime.imovel}</td>
                <td className="text-center">{regime.matricula_imovel}</td>
                <td className="text-center">{regime.nome_imovel}</td>
                <td className="text-center">{regime.regime}</td>
                <td className="text-center">{regime.atividades_exploradas}</td>
                <td className="text-center">
                    {regime.data_inicio ? new Date(regime.data_inicio).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </td>
                <td className="text-center">
                    {regime.data_termino ? new Date(regime.data_termino).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </td>
                <td className="text-center"> 
                    {regime.area_explorada ? Number(regime.area_explorada).toLocaleString('pt-BR', 
                        {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                </td> 
            </tr>
            ))} 
            </tbody>
        </Table>
        : <div className="text-center"><Spinner /></div>
        }
        </>
    );
  };
  
  export default IndexRegimes;
  