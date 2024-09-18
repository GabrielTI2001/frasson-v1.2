import React, { useState } from "react";
import { useAppContext } from "../../Main";
import { Link, useNavigate } from "react-router-dom";
import { faAnglesUp, faArrowUpRightFromSquare, faCalendar, faFile, faPencil, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Dropdown, Nav, Row, Spinner } from "react-bootstrap";
import SubtleBadge from "../../components/common/SubtleBadge";
import { calcdif } from "./GAI/TaskCard";
import GroupMember from "./GroupMember";
import EditFormOthers from "./EditFormOthers";
import { RetrieveRecord } from "../../helpers/Data";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import { fieldsPessoal } from "../Register/Data";
import { fieldsContrato } from "../Finances/Data";

const options = { month: "short", day: "numeric", timeZone: 'UTC'};

const fields = {'register/pessoal':fieldsPessoal, 'finances/contratos-ambiental':fieldsContrato,
  'finances/contratos-credito':fieldsContrato
}

const CardInfo = ({data, attr1, title2, attr2, url, pk, title, small}) =>{
    const {config: {theme}} = useAppContext();
    return (
        url && data ? (
          <Link className={`p-2 mb-1 text-body row mx-0 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}
            to={`/${url}/${pk ? data[pk] : data.uuid}`} target="__blank"
          >
            <div className="d-flex justify-content-between align-items-center px-0">
              <label className={`fw-bold my-1 ${small ? 'fs--1': 'fs--1'}`}>{data[attr1] || title}</label>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </div>
            {title2 ? 
              <div className={`px-0 mb-1 ${small ? 'fs--2': 'fs--1'}`}>{title2} {data[attr2]}</div>
            : attr2 ? <label className={`row ${small ? 'fs--2': 'fs--1'}`}>{data[attr2]}</label> : <></>
            }
          </Link>
        ) : data && (
          <div className={`p-2 mb-1 text-body row mx-0 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
            <div className="d-flex justify-content-between align-items-center px-0">
              <label className={`fw-bold my-1 ${small ? 'fs--1': 'fs--1'}`}>{data[attr1] || title}</label>
            </div>
            {title2 ? 
              <div className={`px-0 mb-1 ${small ? 'fs--2': 'fs--1'}`}>{title2} {data[attr2]}</div>
              : attr2 ? <label className={`row ${small ? 'fs--2': 'fs--1'}`}>{data[attr2]}</label> : <></>
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
          <Row className="gx-0">
            <Dropdown.Toggle as={Col} className='dropdown-caret-none cursor-pointer d-flex align-items-center p-0 ms-0 me-2 col-auto'>
              <GroupMember users={card.list_responsaveis} className='col-auto px-0 d-inline-block'/>
              <span 
                className={`rounded-circle p-1 px-2 me-1 mb-1 ${calcdif(card.data_vencimento) > 0 ?'bg-success-subtle':'bg-danger-subtle'}`}
              >
                <FontAwesomeIcon icon={faCalendar} className={`text-${calcdif(card.data_vencimento) > 0 ?'success':'danger'}`}/>
              </span>
              <SubtleBadge bg={calcdif(card.data_vencimento) > 0 ? 'secondary' : 'danger'} className='me-1 fw-normal fs--2 mb-1'>
                Venc {new Date(card.data_vencimento).toLocaleDateString('pt-BR', options)}
              </SubtleBadge> 
            </Dropdown.Toggle>
            <Col xl='auto' sm='auto' xs='auto'>
              {calcdif(card.data_vencimento) > 0 
                ? <span style={{fontSize:'0.7rem'}}>em {parseInt(calcdif(card.data_vencimento))} dias</span>
                : <span style={{fontSize:'0.7rem'}}>{parseInt(calcdif(card.data_vencimento)) * -1} dias atrás</span>
              }
              <SubtleBadge bg={`${card.str_prioridade === 'Alta' ? 'danger' : card.str_prioridade === 'Média' ? 'warning' : 'success'}`} 
                className='ms-2 fw-normal text-body fs--2'>{card.str_prioridade}
              </SubtleBadge>
            </Col>          
          </Row>

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

export const CardInfo2 = ({data, title2, attr2, url, pk, title, small, urlapi, footer, clickdelete}) =>{
  const {config: {theme}} = useAppContext();
  const [detail, setDetail] = useState()
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  const getData = async (pk) =>{
    if (urlapi){
      setIsExpanded(true)
      if (!detail){
        setLoading(true)
        const status = await RetrieveRecord(pk, urlapi, (d) => setDetail(d))
        if (status === 401) RedirectToLogin(navigate)
        setLoading(false)
      }
    }
  }

  return (
    data && (
      <div className={`mb-2 mt-1 row gx-0 shadow-none info-pipe px-2 py-2 fs--1 expandable-card ${isExpanded ? 'expanded' : ''} 
        ${theme === 'dark' ? 'info-pipe-dark' : ''}`}
      >
        <div onClick={() => getData(pk ? data[pk] : data.uuid)} className="col-auto cursor-pointer" style={{width:'95%'}}>
          <div className="d-flex justify-content-between align-items-center px-0">
            <label className={`fw-bold my-1 ${small ? 'fs--1': 'fs--1'}`}>{title}</label>
          </div>
          {title2 ? 
            <div className={`px-0 mb-1 ${small ? 'fs--2': 'fs--1'}`}>{title2}</div>
            : attr2 ? <label className={`row ${small ? 'fs--2': 'fs--1'}`}>{data[attr2]}</label> : <></>
          }
        </div>
        {url && 
          <Col className="text-end d-flex flex-column">
            <Link to={`/${url}/${pk ? data[pk] : data.uuid}`} target="__blank" className="text-secondary" onClick={() => {}}>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </Link>
          </Col>
        }
        {isExpanded && clickdelete &&
          <Button onClick={clickdelete} className='col toggle-button shadow-none py-0 px-1' variant="falcon-default">
            <FontAwesomeIcon icon={faTrashCan} className='fs--1' />
          </Button>
        }
        <div className='mt-0'><span className='fs--2 text-600'>{footer}</span></div>
        <div className="detailed-info">
          {loading ? <div className='text-center'><Spinner/></div> 
          : fields[urlapi].map(f => (
            <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
              <CardTitle title={f.label.replace('*','')} field={f.name}/>
              {f.type === 'select2' ? f.ismulti ? 
                  <div className="fs--1 row-10">{detail[f.list].map(l => l[f.string]).join(', ')}</div>
                : 
                f.string ?
                  <div className="fs--1 row-10">{detail[f.string] || '-'}</div>
                :
                  <div className="fs--1 row-10">{detail[f.data] && detail[f.data][f.attr_data]}</div>
              : f.type === 'select' ? (
                  f.boolean 
                    ? <div className="fs--1 row-10">{detail[f.name] === true ? 'Sim' : 'Não'}</div>
                    : <div className="fs--1 row-10">{detail[f.string]}</div>
                  )
              : f.type === 'date' ? 
                <div className="fs--1 row-10">{detail[f.name] ? new Date(detail[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
              : f.type === 'dropdown' ?
                <div className="fs--1 row-10">{f.icon && f.icon[detail[f.name]]} {detail[f.string] || '-'}</div>
              : f.type === 'file' ? (detail[f.name] ? 
                <div>
                  <Link to={`${detail[f.name]}`} className='btn btn-secondary py-0 px-2 me-2 fs--1'>
                    <FontAwesomeIcon icon={faFile} className='me-1'/>Arquivo 
                  </Link>
                </div> : <div>-</div>)
              : 
                <div className="fs--1 row-10">
                  {detail[f.name] ? (f.isnumber ? Number(detail[f.name]).toLocaleString('pt-br', {minimumFractionDigits:2}) : detail[f.name]) : '-'}
                </div>
              }
            </div>
          ))}
          <div onClick={() => setIsExpanded(false)} className="text-center">
            <span className="link-primary cursor-pointer"><FontAwesomeIcon icon={faAnglesUp} className="me-1"/>Mostrar Menos</span>
          </div>
        </div>

    </div>
    )
  )
}