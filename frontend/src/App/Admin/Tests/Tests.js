import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Table, Placeholder} from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const InitData = {
    'title': 'Assessments'
}

const TestsIndex = () => {
    const [data, setData] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
   
    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', 'administrator/tests', (data) => setData(data.pipes))
            if (status === 401) RedirectToLogin(navigate)
        }
        if ((user.permissions && user.permissions.indexOf("ver_administrator") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            getdata()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/administrator'}>Administrator Panel</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        {data ? 
            <Table responsive className="mt-3">
                <thead className="bg-300">
                    <tr>
                        <th scope="col" className="text-center text-middle">PIPE/DATABASE</th>
                        <th scope="col" className="text-center text-middle">LAST TEST</th>
                        <th scope="col" className="text-center text-middle">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {data.map(registro =>
                <tr key={registro.url} style={{cursor:'pointer'}} 
                    className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
                >
                    <td className="text-center text-middle fs--2">{registro.nome}</td>
                    <td className="text-center text-middle fs--2">
                        {registro.last_test || '-'}
                    </td>
                    <td className="text-center text-middle fs--2">
                        <Link to={`${registro.url}`} className="btn btn-sm btn-success py-0 fs--2">
                            Run Test
                        </Link>
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
        </>
    );
  };
  
  export default TestsIndex;
  