import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import { HandleSearch } from '../../../helpers/Data';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { Link } from 'react-router-dom';
import ExpandableCard from '../../../components/Custom/ExpandableCard';
import { Anexos } from './Anexos';
import FormAcomp from './Form';

const IndexAcompGAI = ({card, updatedactivity, currentacomp, setter}) => {
  const {config: {theme, isRTL}} = useAppContext();
  const [showmodal, setShowModal] = useState({show:false})
  const [modaldel, setModaldel] = useState({show:false})

  const submit = (type, data) => {
    let proxima_consulta;
    if (currentacomp.acompanhamentos.lenght > 0){
      const mostRecentDate = currentacomp.acompanhamentos
        .map(item => new Date(item.data)) // Converte as datas para objetos Date
        .reduce((latest, current) => current > latest ? current : latest);
        proxima_consulta = mostRecentDate.toISOString().split('T')[0]
    }
    else{
      proxima_consulta = data.proxima_consulta
    }
    if (type === 'add'){
      setter({...currentacomp, inema:{proxima_consulta:proxima_consulta}, acompanhamentos: [data, ...currentacomp.acompanhamentos]})
    } 
    setShowModal({show:false})
    updatedactivity({type:'ch', campo:'Acompanhamentos', created_at:data.created_at, user:{name:data.user_name}})
  }

  const handledelete = (type, data) =>{
    const mostRecentDate = currentacomp.acompanhamentos
      .map(item => new Date(item.data)) // Converte as datas para objetos Date
      .reduce((latest, current) => current > latest ? current : latest);
    const proxima_consulta = currentacomp.acompanhamentos.lenght > 1 ? mostRecentDate.toISOString().split('T')[0] : null
    setter({...currentacomp, inema:{proxima_consulta:proxima_consulta}, acompanhamentos:currentacomp.acompanhamentos.filter(c => c.id !== parseInt(data))})
  }

  return (
    <>
    <div className='row mx-0 mb-0 gx-0'>
      <h5 className="col-auto mb-0 fs-0 fw-bold p-2 ps-0">Atualizações de Acompanhamento</h5>
      <Link className="text-decoration-none nav nav-link shadow-none fs--1 p-2 col-auto rounded-1" onClick={() =>{setShowModal({show:true})}}>
        <FontAwesomeIcon icon={faPlus} />Novo Cadastro
      </Link>
    </div>
    {showmodal.show &&
      <ExpandableCard title='Nova Atualização' auto close={() => setShowModal({show:false})}>
        <FormAcomp type='add' hasLabel submit={submit} card={card}/>
      </ExpandableCard>
    }
    {currentacomp ? currentacomp.acompanhamentos && currentacomp.acompanhamentos.map(p =>
      <ExpandableCard data={p} key={p.id}
        header={<div className='d-flex justify-content-between align-items-center' style={{width:'87%'}}>
          <OverlayTrigger
            overlay={<Tooltip id="overlay-trigger-example">{`${p.user_name && p.user_name.split(' ')[0]}`}</Tooltip>}
          >
            <img className='p-0 rounded-circle me-2' style={{width: '42px', height: '38px'}} 
              src={`${process.env.REACT_APP_API_URL}/${p.user_avatar}`}
            />
          </OverlayTrigger>
          <span className='badge bg-info col-auto'>{p.status}</span>
          <strong className='fs--1 col-auto'>{p.data}</strong>
        </div>}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/processes/acompanhamentos/${p.id}/`})}}
      >
        <div className='my-2'>{p.description ? p.description : 'Sem Detalhamentos'}</div>
        <div className='my-2'><strong>Próxima Consulta: </strong>
          {p.proxima_consulta ? new Date(p.proxima_consulta).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
        </div>
        <div><Anexos param={'acompgai'} value={p.id} readonly/></div>
      </ExpandableCard>
    ) : 
    <div className='text-center mb-4'>
      <Spinner />
    </div> 
    }
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default IndexAcompGAI;
