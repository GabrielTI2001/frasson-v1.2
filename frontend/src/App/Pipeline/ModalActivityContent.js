import React, { useEffect, useState } from 'react';
import Flex from '../../components/common/Flex';
import { Link } from 'react-router-dom';
import Avatar from '../../components/common/Avatar';
import { useAppContext } from '../../Main';
import { HandleSearch } from '../../helpers/Data';
import { mentionInputStyleDark, mentionInputStyleLight } from '../../components/Custom/mentionStyle';
import { Button, Form } from 'react-bootstrap';
import { Mention, MentionsInput } from 'react-mentions';
import { toast } from 'react-toastify';
import api from '../../context/data';
import { renderComment } from './ModalCommentContent';
import PaginationList from '../../components/Custom/PaginationList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPencil, faRightToBracket } from '@fortawesome/free-solid-svg-icons';

const ListActivities = ({item}) => {
  return (<>
    <Flex
      key={item.id}
      className='mb-2'
    >
      <div>
        <span className='rounded-circle bg-200 p-2'>
          {/* <Avatar size="l" src={`${process.env.REACT_APP_API_URL}/media/${item.user.avatar}`}/> */}
          {item.type === 'co' ? 
            <FontAwesomeIcon icon={faComment} className='text-primary'/>
          : item.type === 'ch' ? <FontAwesomeIcon icon={faPencil} className='text-secondary'/> 
          : <FontAwesomeIcon icon={faRightToBracket} className='text-primary'/>
          }
        </span>
      </div>
      <div className="flex-1 ms-2 fs--1">
        <div className="mb-0">
          <span className="fw-semi-bold fs--1">
            {item.user.name}{' '}
          </span>
          <span className='fs--1'>{item.type === 'ch' ? 'atualizou' : item.type === 'cf' ? 'moveu' : 'comentou'}</span>{' '}
          {item.type === 'co' ?
            <div className="flex-1 fs--1 border border-300 rounded-3 p-2">{renderComment(item.campo)}</div>
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
  const {config: {theme, isRTL}} = useAppContext();

  return (
    <>
      {atividades &&
        <PaginationList items={atividades} initialVisibleCount={20} incrementCount={10}>
          <ListActivities />
        </PaginationList>
      }
    </>
  );
};

export default ModalActivityContent;
