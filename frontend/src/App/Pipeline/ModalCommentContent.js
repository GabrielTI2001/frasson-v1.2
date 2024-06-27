import React, { useEffect, useState } from 'react';
import Flex from '../../components/common/Flex';
// import { members, comments } from 'data/kanban';
import Avatar from '../../components/common/Avatar';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPaperclip, faAt, faImage} from '@fortawesome/free-solid-svg-icons';
import { MentionsInput, Mention } from 'react-mentions';
import mentionStyle, { mentionInputStyleDark, mentionInputStyleLight } from '../../components/Custom/mentionStyle';
import { useAppContext } from '../../Main';
import { GetRecord } from '../../helpers/Data';
library.add(faPaperclip, faAt, faImage );

const ModalCommentContent = ({card}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({created_by:user.id, card_produto:card.id});
  const [users, setUsers] = useState([]);
  const {config: {theme}} = useAppContext();

  const handlesubmit = (e) => {
    e.preventDefault(); 
    console.log(formData)
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
    const getusers = async () =>{
      const user_data = await GetRecord('', 'users/users')
      setUsers(user_data.map(r => ({'id':r.id, 'display':r.first_name+' '+r.last_name})))
    }
    getusers()
  },[])

  return (
    <>
      <Flex>
        <Avatar src="" className="me-2" size="l" />
        <div className="flex-1 fs--1">
            <Form onSubmit={handlesubmit}>
              <div className="comment-box m-0 mb-2">
                <MentionsInput
                  value={formData.comment || ''}
                  style={theme !== 'dark' ? mentionInputStyleLight : mentionInputStyleDark}
                  className="fs--1 border-1"
                  onChange={(event, newValue) => setFormData({comment:newValue})}
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

      {card.commentarios && (card.comentarios.map(comment => (
        <Flex key={comment.id} className="mb-3">
          <Link to="/user/profile">
            <Avatar src={comment.user.avatar} size="l" />
          </Link>
          <div className="flex-1 ms-2 fs--1">
            <p className="mb-1 bg-200 rounded-3 p-2">
              <Link to="/user/profile" className="fw-semi-bold">
                {comment.user.name}
              </Link>{' '}
              {comment.text}
            </p>
            <Link to="#!"> Like </Link> &bull;
            <Link to="#!"> Reply </Link> &bull; {comment.time}
          </div>
        </Flex>
      )))}
    </>
  );
};

export default ModalCommentContent;
