import { useState, useEffect} from "react";
import React from 'react';
import {Spinner, Table} from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const MovContas = ({id}) => {
    const [movimentacoes, setMovimentacoes] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();

    const setter = (responsedata) => {
        setMovimentacoes(responsedata.movimentacoes)
    }
   
    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', `finances/accounts/${id}`, setter)
            if (status === 401) RedirectToLogin(navigate)
            if (status === 404) setMovimentacoes([])
        }
        if ((user.permissions && user.permissions.indexOf("ver_saldos_bancarios") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!movimentacoes && (id)){
            getdata()
        }
    },[])

    return (
        <>
        <CustomBreadcrumb>  
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/finances/accounts'}>Saldos</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
               Movimentações {movimentacoes && movimentacoes.nome_caixa}
            </span> 
        </CustomBreadcrumb>
        <div className="fs--2">Registros de movimentações nos últimos 120 dias</div>
        {movimentacoes ? 
        <Table responsive className="mt-3">
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center text-middle">Data</th>
                    <th scope="col" className="text-center text-middle">Descrição</th>
                    <th scope="col" className="text-center text-middle">Detalhe</th>
                    <th scope="col" className="text-center text-middle">Valor (R$)</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {movimentacoes.map((registro, index) =>
            <tr key={index}
                className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
            >
                <td className="text-center text-middle fs--2">
                    {registro.data || '-'}
                </td>
                <td className="text-center text-middle fs--2">{registro.descricao || '-'}</td>
                <td className="text-center text-middle fs--2">{registro.detalhe || '-'}</td>
                <td className="text-center text-middle"> 
                    {registro.valor || ''}
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
  
  export default MovContas;
  