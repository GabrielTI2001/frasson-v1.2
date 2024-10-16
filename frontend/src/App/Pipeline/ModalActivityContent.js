import React from 'react';
import Flex from '../../components/common/Flex';
import { renderComment } from './ModalCommentContent';
import PaginationList from '../../components/Custom/PaginationList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faComment, faPencil, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'react-bootstrap';

const ListActivities = ({item}) => {
  return (<>
    <Flex
      key={item.id}
      className='mb-2'
    >
      <div>
        <span className='rounded-circle bg-200 p-2'>
          {/* <Avatar size="l" src={`${process.env.REACT_APP_API_URL}/media/${item.user.avatar}`}/> */}
          {item.type === 'co' ? <FontAwesomeIcon icon={faComment} className='text-primary'/>
          : item.type === 'ch' ? <FontAwesomeIcon icon={faPencil} className='text-primary'/> 
          : item.type === 'c' ? <FontAwesomeIcon icon={faCheck} className='text-primary'/> 
          : item.type === 'cr' ? <FontAwesomeIcon icon={faPlus} className='text-primary'/>
          : <FontAwesomeIcon icon={faRightToBracket} className='text-primary'/>
          }
        </span>
      </div>
      <div className="flex-1 ms-2 fs--1">
        <div className="mb-0">
          <span className="fw-semi-bold fs--1">
            {item.user && item.user.name}{' '}
          </span>
          <span className='fs--1'>{item.type === 'ch' ? 'atualizou' : item.type === 'cf' ? 'moveu' : item.type === 'c' ? 'concluiu'
            : item.type === 'cr' ? 'criou' : 'comentou'}</span>{' '}
          {item.type === 'co' ?
            <div className="flex-1 text-justify fs--1 border border-300 rounded-3 p-2">{renderComment(item.campo)}</div>
            : item.campo
          }
        </div>
        <div className="fs--2">              
          {new Date(item.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone:'UTC'})}
          {' às '+new Date(item.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}</div>
      </div>
    </Flex>
  </>)
}

const ModalActivityContent = ({card, atividades}) => {
  return (
    <>
      {atividades ?
        <PaginationList items={atividades} initialVisibleCount={20} incrementCount={10}>
          <ListActivities />
        </PaginationList>
      :
      <div className='text-center'>
          <Spinner />
      </div>  
      }
    </>
  );
};

export default ModalActivityContent;
