import React from "react";
import { useAppContext } from "../../Main";
import { Link } from "react-router-dom";
import { faArrowUpRightFromSquare, faCalendar, faPencil, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, Dropdown, Nav } from "react-bootstrap";
import SubtleBadge from "../../components/common/SubtleBadge";
import { calcdif } from "./GAI/TaskCard";
import GroupMember from "./GroupMember";
import EditFormOthers from "./EditFormOthers";

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

const CardInfo = ({data, attr1, title2, attr2, url, pk, title, small}) =>{
    const {config: {theme}} = useAppContext();
    return (
        url ? (
          <Link className={`p-2 mb-1 text-body row mx-0 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}
            to={`/${url}/${pk ? data[pk] : data.uuid}`} target="__blank"
          >
            <div className="d-flex justify-content-between px-0">
              <label className={`fw-bold ${small ? 'fs--1': 'fs-0'}`}>{data[attr1] || title}</label>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </div>
            {title2 ? 
              <div className={`px-0 ${small ? 'fs--2': 'fs--1'}`}>{title2} {data[attr2]}</div>
            : <label className={`row ${small ? 'fs--2': 'fs--1'}`}>{data[attr2]}</label>
            }
          </Link>
        ) : (
          <div className={`p-2 mb-1 text-body row mx-0 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
            <div className="d-flex justify-content-between px-0">
              <label className={`fw-bold ${small ? 'fs--1': 'fs-0'}`}>{data[attr1] || title}</label>
            </div>
            {title2 ? 
              <div className={`px-0 ${small ? 'fs--2': 'fs--1'}`}>{title2} {data[attr2]}</div>
            : <label className={`row ${small ? 'fs--2': 'fs--1'}`}>{data[attr2]}</label>
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
              <span className='modal-editar bg-300 py-1 px-2 ms-2 fs--1' onClick={() => click(field)}>
                <FontAwesomeIcon icon={faPenToSquare} className='me-1'/>Editar
              </span>
            }
        </>
    )
}

export const DropdownModal = ({card, handleEdit, handleSubmit}) =>{
  return (
      <>
        <Dropdown className='mb-2'>
          <Dropdown.Toggle as={Nav}
            className='dropdown-caret-none p-0 ms-0 row gx-0' style={{width:'100% !important'}}
          >
              <Col className='cursor-pointer d-flex align-items-center' onClick={() => handleEdit('others')} xl='auto' sm='auto' xs='auto'>
                <GroupMember users={card.list_responsaveis} className='cursor-pointer col-auto px-0 d-inline-block' onClick={() => handleEdit('others')}/>
                <span 
                  className={`rounded-circle p-1 px-2 me-1 mb-1 ${calcdif(card.data_vencimento) > 0 ?'bg-success-subtle':'bg-danger-subtle'}`}
                >
                  <FontAwesomeIcon icon={faCalendar} className={`text-${calcdif(card.data_vencimento) > 0 ?'success':'danger'}`}/>
                </span>
                <SubtleBadge bg={calcdif(card.data_vencimento) > 0 ? 'secondary' : 'danger'} className='me-1 fw-normal fs--2 mb-1'>
                  Venc {new Date(card.data_vencimento).toLocaleDateString('pt-BR', options)}
                </SubtleBadge> 
              </Col>
              <Col xl='auto' sm='auto' xs='auto'>
                {calcdif(card.data_vencimento) > 0 
                  ? <span style={{fontSize:'0.7rem'}}>em {parseInt(calcdif(card.data_vencimento))} dias</span>
                  : <span style={{fontSize:'0.7rem'}}>{parseInt(calcdif(card.data_vencimento)) * -1} dias atrás</span>
                }
                <SubtleBadge bg={`${card.prioridade === 'Alta' ? 'danger' : card.prioridade === 'Média' ? 'warning' : 'success'}`} 
                  className='ms-2 fw-normal text-body fs--2'>{card.prioridade}
                </SubtleBadge>
              </Col>
          </Dropdown.Toggle>
          <Dropdown.Menu className='text-body px-3'  style={{ width: '400px' }}>
            <EditFormOthers 
              onSubmit={handleSubmit}
              data={{responsaveis:card.list_responsaveis, data_vencimento:card.data_vencimento, prioridade:card.prioridade}} 
            />
          </Dropdown.Menu>
        </Dropdown>
      </>
  )
}