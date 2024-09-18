import React, { useContext, useState } from 'react';
// import PropTypes from 'prop-types';
import { Dropdown, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  {PipeContext  } from '../../context/Context';
import ModalDelete from '../../components/Custom/ModalDelete';
import { Modal, CloseButton } from 'react-bootstrap';
import ProductForm from './GAI/Form';
import ProspectForm from './Prospects/Form';

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
    </div>

    <ModalDelete show={modaldel.show} link={modaldel.link} update={handleRemoveColumn} close={() => setModaldel({show:false})}/>
    
    <Modal
      size="md"
      show={modalform.show}
      onHide={() => setModalForm({show:false})}
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
          {kanbanState.pipe.code === 518984721 ? <ProductForm fase={id} onSubmit={() => setModalForm({show:false})}/>
            : kanbanState.pipe.code === 518984924 ? <ProspectForm fase={id} onSubmit={() => setModalForm({show:false})}/> : null
          }
        </Row>
      </Modal.Body>
    </Modal>
  </>
  );
};

export default KanbanColumnHeader;
