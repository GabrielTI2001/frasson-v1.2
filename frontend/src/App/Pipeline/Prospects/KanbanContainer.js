import React, { useContext, useEffect, useRef, useState } from 'react';
import KanbanColumn from '../KanbanColumn';
import api from '../../../context/data';
import KanbanModal from './KanbanModal';
import { DragDropContext } from '@hello-pangea/dnd';
import IconButton from '../../../components/common/IconButton';
import is from 'is_js';
import { PipeContext } from '../../../context/Context';
import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchForm from '../Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import CustomBreadcrumb from '../../../components/Custom/Commom';
import { SkeletBig } from '../../../components/Custom/Skelet';
import { AddCard } from './Nav';

const SOCKET_SERVER_URL = `${process.env.REACT_APP_WS_URL}/pipeline/`;
const clientId = Math.floor(Math.random() * 1000000)

const KanbanContainer = () => {
  const {
    kanbanState,
    kanbanDispatch
  } = useContext(PipeContext);
  const token = localStorage.getItem("token")
  const {code} = useParams()
  const containerRef = useRef(null);
  const fases = kanbanState.fases;
  const pipe = kanbanState.pipe
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [socket, setSocket] = useState()
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (socket && kanbanState.fases){
    socket.onmessage = (event) => {
      if (JSON.parse(event.data)){
        const data = JSON.parse(event.data).message;
        // console.log(clientId+' '+data.clientId)
        if (data.type === 'movecardprospect' && data.clientId !== clientId){
          // console.log(data)
          const { source, destination } = data.data;
          const sourceColumn = getColumn(source.droppableId);
          const destColumn = getColumn(destination.droppableId);
          const movedItems = move(source, destination);
          const idcard = data.code
          kanbanDispatch({
            type: 'UPDATE_DUAL_COLUMN',
            payload: {
              idcard,
              sourceColumn,
              updatedSourceItems: movedItems.updatedSourceItems,
              destColumn,
              updatedDestItems: movedItems.updatedDestItems
            }
          });
        }
      }
    };
  }

  const saveScrollPosition = () => {
    if (containerRef.current) {
      sessionStorage.setItem("scrollPosition", containerRef.current.scrollLeft);
    }
  };

  const restoreScrollPosition = () => {
    const savedScrollPosition = sessionStorage.getItem("scrollPosition");
    if (savedScrollPosition && containerRef.current) {
      containerRef.current.scrollLeft = parseInt(savedScrollPosition);
      sessionStorage.removeItem("scrollPosition")
    }
  };

  useEffect(() => {setSocket(new WebSocket(SOCKET_SERVER_URL));}, [])
  useEffect(() => {
    if (fases) {
      restoreScrollPosition();
    }
    if (pipe && pipe.pessoas){
      const pessoas = pipe.pessoas
      if (!pessoas.some(pessoa => pessoa === user.id) && !user.is_superuser){
        navigate("/error/403")
      }
    }
    if (code) {
      kanbanDispatch({ type: 'OPEN_KANBAN_MODAL', payload: {} });
    }
    if (is.ipad()) {
      containerRef.current.classList.add('ipad');
    }
    if (is.mobile()) {
      containerRef.current.classList.add('mobile');
      if (is.safari()) {
        containerRef.current.classList.add('safari');
      }
      if (is.chrome()) {
        containerRef.current.classList.add('chrome');
      }
    }
  },[pipe]);

  const getColumn = id => {
    if (fases){
      return fases.find(fase => fase.id === Number(id))
    }
    else{
      return null;
    }
  };

  const reorderArray = (array, fromIndex, toIndex) => {
    const newArr = [...array];
    const chosenItem = newArr.splice(fromIndex, 1)[0];
    newArr.splice(toIndex, 0, chosenItem);
    return newArr;
  };

  const move = (source, destination) => {
    const sourceItemsClone = [...getColumn(source.droppableId).card_set];
    const destItemsClone = [...getColumn(destination.droppableId).card_set];
    const [removedItem] = sourceItemsClone.splice(source.index, 1);
    destItemsClone.splice(destination.index, 0, removedItem);
    return {
      updatedDestItems: destItemsClone,
      updatedSourceItems: sourceItemsClone
    };
  };

  const handleDragEnd = result => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (source.droppableId === destination.droppableId) {
      const items = getColumn(source.droppableId).card_set;
      const column = getColumn(source.droppableId);
      const reorderedItems = reorderArray(items, source.index, destination.index);
      kanbanDispatch({type: 'UPDATE_SINGLE_COLUMN', payload: { column, reorderedItems }});
    } else {
      const initialSourceItems = [...getColumn(source.droppableId).card_set];
      const initialDestItems = destination.droppableId !== source.droppableId ? [...getColumn(destination.droppableId).card_set] : null;
      const sourceColumn = getColumn(source.droppableId);
      const destColumn = getColumn(destination.droppableId);
      const movedItems = move(source, destination);
      if (getColumn(source.droppableId).card_set[source.index].code){
        const idcard = getColumn(source.droppableId).card_set[source.index].code
        kanbanDispatch({
          type: 'UPDATE_DUAL_COLUMN',
          payload: {
            idcard,
            sourceColumn,
            updatedSourceItems: movedItems.updatedSourceItems,
            destColumn,
            updatedDestItems: movedItems.updatedDestItems
          }
        });
        api.put(`pipeline/fluxos/prospects/${idcard}/`, {'phase':destColumn.id, 'user':user.id}, {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
          socket.send(JSON.stringify({message:{type:"movecardprospect", data:result, code:response.data.code, clientId:clientId}}));
          toast.success(`Card movido com sucesso para ${response.data.str_fase}`)
        })
        .catch((erro) => {
          if (erro.response.status === 400){
            toast.error(erro.response.data.phase[0])
          }
          if (erro.response.status === 401){
            localStorage.setItem("login", JSON.stringify(false));
            localStorage.setItem('token', "");
            RedirectToLogin(navigate)
          }
          kanbanDispatch({
            type: 'REVERT_DRAG',
            payload: {
              sourceColumnId: destination.droppableId,
              initialSourceItems,
              destColumnId: source.droppableId,
              initialDestItems
            }
          });
          console.error('erro: '+erro);
        })
      }
    }
  };

  const movercardmodal = (type, result, code) =>{
    saveScrollPosition()
    socket.send(JSON.stringify({message:{type:type, data:result, code:code, clientId:clientId}}));
  }

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('kanban-items-container') || e.target.classList.contains('kanban-container')) {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return; // Se não estiver arrastando, saia da função
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Multiplica por 1 para ajustar a velocidade de scroll
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (<>
    <Row className="gx-1 gy-2 px-0 d-flex align-items-center mb-2">
      <CustomBreadcrumb className="col mb-0" iskanban>
          <Link className="link-fx fw-bold text-primary fs--1" to={'/home'}>Home</Link>
          <span className='fw-bold fs--1'>
            Fluxo - Prospects
          </span>  
      </CustomBreadcrumb>
      <Col xs={12} xl={4} sm={4}>
        <SearchForm />
      </Col>
      <Col xl={'auto'} sm='auto' xs={'auto'}>
        <Link className="text-decoration-none btn btn-primary shadow-none fs--2" style={{padding: '2px 5px'}} 
          to={`settings`}
        >
          <FontAwesomeIcon icon={faGear} className='me-2' />Editar Pipe
        </Link>
      </Col>
    </Row>
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-container me-n3" ref={containerRef} xl={8}
        onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
      >
      {/* Pega o array de itens e renderiza um div pra cada*/}
        {kanbanState && kanbanState.fases ? kanbanState.fases.map((fase)=>{
          return( 
              <KanbanColumn
                key={fase.id}
                kanbanColumnItem={fase}
                item='prospect' handleMouseDown={handleMouseDown}
              />
            )
          }) 
          : <div className='kanban-column'><SkeletBig /></div>   
        }
      </div>
    </DragDropContext>
    <AddCard />
    <KanbanModal show={kanbanState.kanbanModal.show} movercard={movercardmodal}/>
    </>
  );
};

export default KanbanContainer;
