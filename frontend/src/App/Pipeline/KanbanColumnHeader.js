import React, { useContext, useState } from 'react';
// import PropTypes from 'prop-types';
import { Dropdown, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  {PipeContext  } from '../../context/Context';
import ModalDelete from '../../components/Custom/ModalDelete';
import { Modal, CloseButton } from 'react-bootstrap';
import ProductForm from './products/Form';

const KanbanColumnHeader = ({ id, title, itemCount }) => {
  const {kanbanState, kanbanDispatch } = useContext(PipeContext);
  const [modaldel, setModaldel] = useState({show:false})
  const [modalform, setModalForm] = useState({show:false})

  const handleRemoveColumn = () => {
    kanbanDispatch({
      type: 'REMOVE_KANBAN_COLUMN',
      payload: { id }
    });
  };

  return ( 
  <>
    <div className="kanban-column-header">
      <h5 className="fs-0 mb-0">
        <span className='fs--1'>{title}</span> <span className="text-500 fs--1">({itemCount})</span>
      </h5>
      <Dropdown align="end" className="font-sans-serif btn-reveal-trigger">
        <Dropdown.Toggle variant="reveal" size="sm" className="py-0 px-2">
          <FontAwesomeIcon icon="ellipsis-h" />
        </Dropdown.Toggle>

        <Dropdown.Menu className="py-0">
          <Dropdown.Item href="" onClick={() => setModalForm({show:true})}>Novo Card</Dropdown.Item>
          <Dropdown.Item href="">Edit</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            onClick={() => setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/fases/${id}/`})}
            className="text-danger"
          >
            Remove
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>

    <ModalDelete show={modaldel.show} link={modaldel.link} update={handleRemoveColumn} close={() => setModaldel({show:false})}/>
    
    <Modal
      size="md"
      show={modalform.show}
      onHide={() => setModalForm({show:false})}
      centered
      aria-labelledby="example-modal-sizes-title-lg"
      scrollable
    >
      <Modal.Header>
      <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
        Adicionar Card
      </Modal.Title>
          <CloseButton onClick={() => setModalForm({show:false})}/>
      </Modal.Header>
      <Modal.Body>
        <Row className="flex-center sectionform">
          {kanbanState.pipe.descricao === 'Produtos' 
            ? <ProductForm fase={id} onSubmit={() => setModalForm({show:false})}/>
            : null
          }
        </Row>
      </Modal.Body>
    </Modal>
  </>
  );
};

export default KanbanColumnHeader;
