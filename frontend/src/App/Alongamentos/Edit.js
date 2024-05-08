import { useEffect, useState } from "react";
import React from 'react';
import { RetrieveRecord } from "../../helpers/Data";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { Placeholder } from "react-bootstrap";
import FormAlongamento from "./Form";

const Edit = ({id}) => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [alongamento, setAlongamento] = useState()
    const navigate = useNavigate();

    const setter = (data) =>{
        setAlongamento(data)
    }

    useEffect(() =>{
        const getData = async () => {
            const status = await RetrieveRecord(id, 'alongamentos/index', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("change_operacoes_credito") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!alongamento){
            getData()
        }
    }, [])

    return (
    <>
        {alongamento && (
            <FormAlongamento hasLabel type={'edit'} data={alongamento}/>
        )}
        <hr></hr>
    </>
    );
  };
  
  export default Edit;
  