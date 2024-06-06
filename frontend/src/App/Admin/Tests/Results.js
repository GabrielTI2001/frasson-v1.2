import { useState, useEffect} from "react";
import React from 'react';
import {Placeholder} from 'react-bootstrap';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";

export const ResultPipe = () => {
    const [data, setData] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {id} = useParams()
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
   
    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', `administrator/tests/pipe/${id}`, (data) => setData(data))
            if (status === 401) navigate("/auth/login")
            if (status === 500) {return <div>Erro Interno</div>}
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
               {data && data.title}
            </li>  
        </ol>
        <h5 className="fw-bold mb-2">Resultados</h5>
        
        {data ? <>
            <h6 className="fw-bold">Registros Inexistentes</h6>
            {data.missings.map(m => 
                <div key={m}><label className="mb-0 fs--2 me-1">ID: </label><span className="fs--2">{m}</span></div>
            )}
            <h6 className="fw-bold mt-2">Registros Desatualizados</h6>
            {data.wrongs.map((w, index) => 
                <div key={index}>
                    <label className="mb-0 fs--2 me-1">ID: </label><span className="fs--2 me-2">{w.id}</span>
                    <label className="mb-0 fs--2 me-1">Campo Pipefy: </label><span className="fs--2">{w.campo}</span>
                </div>
            )}
            
        </>
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
  
export const ResultDatabase = () => {
    const [data, setData] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {id} = useParams()
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
   
    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', `administrator/tests/database/${id}`, (data) => setData(data))
            if (status === 401) navigate("/auth/login")
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
               {data && data.title}
            </li>  
        </ol>
        <h5 className="fw-bold mb-2">Resultados</h5>
        {data ? <>
            <h6 className="fw-bold">Registros Inexistentes</h6>
            {data.missings.map(m => 
                <div key={m}><label className="mb-0 fs--2">ID: </label><span className="fs--2">{m}</span></div>
            )}
            <h6 className="fw-bold mt-2">Registros Desatualizados</h6>
            {data.wrongs.map((w, index) => 
                <div key={index}>
                    <label className="mb-0 fs--2 me-1">ID: </label><span className="fs--2 me-2">{w.id}</span>
                    <label className="mb-0 fs--2 me-1">Campo Pipefy: </label><span className="fs--2">{w.campo}</span>
                </div>
            )}
            
        </>
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

  