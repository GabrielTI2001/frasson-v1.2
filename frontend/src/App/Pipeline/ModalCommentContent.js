import React, { useContext, useEffect, useState } from 'react';
import Flex from '../../components/common/Flex';
import Avatar from '../../components/common/Avatar';
import { Form, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark} from '@fortawesome/free-solid-svg-icons';
import { MentionsInput, Mention } from 'react-mentions';
import { mentionInputStyleDark, mentionInputStyleLight } from '../../components/Custom/mentionStyle';
import { useAppContext } from '../../Main';
import { HandleSearch } from '../../helpers/Data';
import api from '../../context/data';
import { toast } from 'react-toastify';
import ModalDelete from '../../components/Custom/ModalDelete';
import { useNavigate } from 'react-router-dom';
import { RedirectToLogin } from '../../Routes/PrivateRoute';
import { ProfileContext } from '../../context/Context';

export const renderComment = (comment) => {
  const parts = comment ? comment.split(/(\@\[[^\]]+\]\([^)]+\))/g) : [];
  return parts.map((part, index) => {
    const mentionMatch = part.match(/\@\[(.+?)\]\((.+?)\)/);
    if (mentionMatch) {
      const [_, display, id] = mentionMatch;
      return (
        <strong key={index} style={{ color: 'blue' }} className='fs--1'>
          @{display}
        </strong>
      );
    }
    return part;
  });
};


const ModalCommentContent = ({card, updatedactivity, link, param}) => {
  const {profileState, profileDispatch} = useContext(ProfileContext)
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({created_by:user.id, [param]:card.id});
  const [users, setUsers] = useState([]);
  const [comentarios, setComentarios] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const {config: {theme, isRTL}} = useAppContext();
  const token = localStorage.getItem("token")
  const [modaldel, setModaldel] = useState({show:false})

  const handlesubmit = (e) => {
    setLoading(true)
    e.preventDefault(); 
    const filteredData = Object.entries(formData).filter(([key, value]) => value !== null).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    if (formData.text !== '' && formData.text !== null){
      api.post(`${link}/`, filteredData, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        setFormData({...formData, text:''})
        setComentarios([response.data, ...comentarios])
        updatedactivity({type:'co', campo:response.data.text, created_at:response.data.created_at, user:response.data.user})
        toast.success("Comentário adicionado com sucesso!")
      })
    }
    setLoading(false)
  }

  const handledelete = (type, data) =>{
    setComentarios(comentarios.filter(c => c.id !== parseInt(data)))
  }

  useEffect(() =>{
    const getusers = async () =>{
      if (!comentarios){
        const status = await HandleSearch('', link,(data) => {setComentarios(data)}, `?${param}=${card.id}`)
        if (status === 401){
          RedirectToLogin(navigate)
        }
      }
      const status = await HandleSearch('', 'users/users',
        (data) => {setUsers(data.map(r => ({'id':r.id, 'display':r.first_name+' '+r.last_name})))}, 
        `${card.pipe_code ? '?pipe='+card.pipe_code : ''}`
      )
      if (status === 401){
        RedirectToLogin(navigate)
      }
    }
    getusers()
  },[])

  const mentionStyle = {
    color: '#0a7cf5', // Text color for the mention
  };

  return (
    <>
      <Flex className='mb-4'>
        <Avatar src={profileState.perfil.avatar} className="me-2" size="l" />
        <div className="flex-1 fs--1 pe-3 ps-0">
          <Form onSubmit={handlesubmit}>
            <div className="comment-box m-0 mb-2">
              <MentionsInput
                value={formData.text || ''}
                style={theme !== 'dark' ? mentionInputStyleLight : mentionInputStyleDark}
                className="fs--1"
                onChange={(event, newValue) => setFormData({...formData, text:newValue})}
              >
                <Mention
                  trigger="@"
                  data={users} style={mentionStyle}
                  appendSpaceOnAdd={true}
                  renderSuggestion={(suggestion, search, highlightedDisplay) => (
                    <div>{`${suggestion.display}`}</div>
                  )}
                  displayTransform={(id, display) => `@${display}`}
                />
              </MentionsInput>
            </div>
            <div>
              <Button type='submit' disabled={!formData.text || loading} className={`${loading && 'py-0'}`}>
                {loading ? <Spinner size='sm' className='mx-3 mt-1' style={{height:'15px', width:'15px'}}/> : 'Enviar'}
              </Button>
            </div>
          </Form>
        </div>
      </Flex>

      {comentarios ? (comentarios.map(comment => (
        <Flex key={comment.id} className="mb-3 pe-3">
          <div>
            <Avatar src={`${process.env.REACT_APP_API_URL}/media/${comment.user.avatar}`} size="l" />
          </div>
          <div className="flex-1 ms-2 fs--1 bg-200 rounded-3 p-2">
            <div className="mb-1 rounded-3 d-flex justify-content-between">
              <span className="fw-semi-bold">
                {comment.user.name}
              </span>
              {parseInt(comment.user.id) === parseInt(user.id) &&
                <div 
                  className='cursor-pointer'
                  onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/card-comments/${comment.id}/`})}}
                >
                  <FontAwesomeIcon icon={faCircleXmark} transform="shrink-2" className='fs-0 m-0'/>
                </div>
              }
              <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
            </div>
            <p className='mb-2 fs--2 text-justify'>
              {comment.text && renderComment(comment.text)}
            </p>
            <div className='text-secondary fs--2'>
              {new Date(comment.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone:'UTC'})}
              {' às '+new Date(comment.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})+' - '}
              na fase {comment.str_fase}
            </div>
          </div>
        </Flex>
      ))) : 
      <div className='text-center'>
          <Spinner />
      </div> 
      }
    </>
  );
};

export default ModalCommentContent;
