import React from "react";
import { useAppContext } from "../../Main";
import { Link } from "react-router-dom";
import { faArrowUpRightFromSquare, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CardInfo = ({data, attr1, title2, attr2, url, pk}) =>{
    const {config: {theme}} = useAppContext();
    return (
        url ? (
            <Link className={`p-2 mb-1 text-body row mx-0 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}
                  to={`/${url}/${pk ? data[pk] : data.uuid}`} target="__blank">
              <div className="d-flex justify-content-between px-0">
                <label className='fw-bold fs-0'>{data[attr1]}</label>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </div>
              {title2 ? 
                <div className="px-0 fs--1">{title2} {data[attr2]}</div>
              : <label className='row fs--1'>{data[attr2]}</label>
              }
            </Link>
          ) : (
            <div className={`p-2 mb-1 text-body row mx-0 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
              <div className="d-flex justify-content-between px-0">
                <label className='fw-bold fs-0'>{data[attr1]}</label>
              </div>
              {title2 ? 
                <div className="px-0 fs--1">{title2} {data[attr2]}</div>
              : <label className='row fs--1'>{data[attr2]}</label>
              }
              
            </div>
          )
    )
}
export default CardInfo;

export const CardTitle = ({title, click, field, className}) =>{
    return (
        <>
            <span className='fw-bold fs--1'>{title}</span>
            {click && 
              <span className='modal-editar ms-2 fs--1' onClick={() => click(field)}>
                <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
              </span>
            }
        </>
    )
}