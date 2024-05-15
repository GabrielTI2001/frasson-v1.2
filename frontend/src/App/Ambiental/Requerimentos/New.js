import React, {useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import RequerimentoAPPOForm from "./Form";

const NewRequerimento = () =>{
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    useEffect(() =>{
        if ((user.permissions && user.permissions.indexOf("add_requerimentos_appo") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    return (<>
    <ol className="breadcrumb breadcrumb-alt mb-3">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={`/ambiental/inema/requerimentos`}>Requerimentos Inema</Link>
        </li>
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={`/ambiental/inema/requerimentos/appo`}>APPO</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            Requerimentos INEMA
        </li>             
    </ol>
    <RequerimentoAPPOForm hasLabel type='add' submit={() =>{}} />
    </>)
}

export default NewRequerimento;