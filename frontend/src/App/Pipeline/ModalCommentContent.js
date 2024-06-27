import React, { useEffect, useState } from 'react';
import Flex from '../../components/common/Flex';
import Avatar from '../../components/common/Avatar';
import { Form, Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPaperclip, faAt, faImage, faEllipsisV, faTrash} from '@fortawesome/free-solid-svg-icons';
import { MentionsInput, Mention } from 'react-mentions';
import mentionStyle, { mentionInputStyleDark, mentionInputStyleLight } from '../../components/Custom/mentionStyle';
import { useAppContext } from '../../Main';
import { GetRecord } from '../../helpers/Data';
import api from '../../context/data';
import { toast } from 'react-toastify';
import ModalDelete from '../../components/Custom/ModalDelete';
library.add(faPaperclip, faAt, faImage );

const ModalCommentContent = ({card}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({created_by:user.id, card_produto:card.id});
  const [users, setUsers] = useState([]);
  const [comentarios, setComentarios] = useState();
  const {config: {theme, isRTL}} = useAppContext();
  const token = localStorage.getItem("token")
  const [modaldel, setModaldel] = useState({show:false})
  const handlesubmit = (e) => {
    e.preventDefault(); 
    api.post('pipeline/cards-produtos/comments/', formData, {headers: {Authorization: `bearer ${token}`}})
    .then((response) => {
      setComentarios([...comentarios, response.data])
      toast.success("Comentário adicionado com sucesso!")
    })
  }

  const handledelete = (type, data) =>{
    setComentarios(comentarios.filter(c => c.id !== parseInt(data)))
  }

  const renderComment = (comment) => {
    const parts = comment.split(/(\@\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
      const mentionMatch = part.match(/\@\[(.+?)\]\((.+?)\)/);
      if (mentionMatch) {
        const [_, display, id] = mentionMatch;
        return (
          <strong key={index} style={{ color: 'blue' }}>
            @{display}
          </strong>
        );
      }
      return part;
    });
  };

  useEffect(() =>{
    setComentarios(card.comments)
    const getusers = async () =>{
      const user_data = await GetRecord('', 'users/users')
      setUsers(user_data.map(r => ({'id':r.id, 'display':r.first_name+' '+r.last_name})))
    }
    getusers()
  },[])

  return (
    <>
      <Flex className='mb-4'>
        <Avatar src="" className="me-2" size="l" />
        <div className="flex-1 fs--1">
            <Form onSubmit={handlesubmit}>
              <div className="comment-box m-0 mb-2">
                <MentionsInput
                  value={formData.text || ''}
                  style={theme !== 'dark' ? mentionInputStyleLight : mentionInputStyleDark}
                  className="fs--1 border-1"
                  onChange={(event, newValue) => setFormData({...formData, text:newValue})}
                >
                  <Mention
                    trigger="@"
                    data={users}
                    appendSpaceOnAdd={true}
                    renderSuggestion={(suggestion, search, highlightedDisplay) => (
                      <div>{`${suggestion.display}`}</div>
                    )}
                    displayTransform={(id, display) => `@${display}`}
                  />
                </MentionsInput>
              </div>
              <div>
                <Button type='submit'>Enviar</Button>
              </div>
            </Form>
          </div>
      </Flex>

      {comentarios && (comentarios.map(comment => (
        <Flex key={comment.id} className="mb-3">
          <div>
            <Avatar src={`${process.env.REACT_APP_API_URL}/media/${comment.user.avatar}`} size="l" />
          </div>
          <div className="flex-1 ms-2 fs--1 bg-200 rounded-3 p-2">
            <p className="mb-1 rounded-3 d-flex justify-content-between">
              <span to="/user/profile" className="fw-semi-bold">
                {comment.user.name}
              </span>
              {parseInt(comment.user.id) === parseInt(user.id) &&
              <Button 
                className='py-0 px-1'
                variant='falcon-default'
                onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/cards-produtos/comments/${comment.id}/`})}}
              >
                <FontAwesomeIcon icon={faTrash} transform="shrink-2" className='fs--1'/>
              </Button>
              }
              <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
            </p>
            <p className='mb-2'>
              {comment.text && renderComment(comment.text)}
            </p>
            <div className='text-secondary fs--2'>
              {new Date(comment.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone:'UTC'})}
              {' às '+new Date(comment.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
            </div>
          </div>
        </Flex>
      )))}
    </>
  );
};

export default ModalCommentContent;
