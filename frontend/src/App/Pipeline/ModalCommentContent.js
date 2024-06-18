import React from 'react';
import Flex from '../../components/common/Flex';
// import { members, comments } from 'data/kanban';
import Avatar from '../../components/common/Avatar';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPaperclip, faAt, faImage} from '@fortawesome/free-solid-svg-icons';
library.add(faPaperclip, faAt, faImage );

const ModalCommentContent = ({card}) => {
  return (
    <>
      <Flex>
        <Avatar src="" className="me-2" size="l" />
        <div className="flex-1 fs--1">
          <div className="position-relative border rounded mb-3">
            <Form>
              <Form.Control
                as="textarea"
                className="border-0 rounded-bottom-0 resize-none fs--1"
                rows={2}
                placeholder='Escreva Seu Comentário'
              />
              <Flex
                justifyContent="end"
                alignItems="center"
                className="rounded-bottom p-2 mt-1"
              >
                <Button size="sm" color="primary" type="submit">
                  Comentar
                </Button>
              </Flex>
            </Form>
          </div>
        </div>
      </Flex>

      {card.commentario && (card.comentario.map(comment => (
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
