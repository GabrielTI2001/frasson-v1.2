import React from "react";
import { useAppContext } from "../../Main";
import { Link } from "react-router-dom";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CardInfo = ({data, attr1, title2, attr2}) =>{
    const {config: {theme}} = useAppContext();
    return (
        <Link className={`p-1 mb-1 text-body row ms-2 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
            <label className='row fw-bold fs--1'>{data[attr1]}</label>
            <label className='row fs--2'>{data[attr2]}</label>
        </Link>
    )
}
export default CardInfo;

export const CardTitle = ({title, click, icon, field}) =>{
    return (
        <>
            <span className='fw-bold fs--1'>{title}</span>
            <span className='modal-editar ms-2 fs--1' onClick={() => click(field)}>
                <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
            </span>
        </>
    )
}