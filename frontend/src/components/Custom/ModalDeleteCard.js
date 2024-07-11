import { Modal, Button} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

//Use sempre barra depois do link
const ModalDeleteCard = ({show, close, link, update, name}) => {
  const token = localStorage.getItem("token")
  const navigate = useNavigate();

  const deletePoint = async () => {
    try{
      const response = await fetch(`${link}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
      });
      if (response.status === 401){
          localStorage.setItem("login", JSON.stringify(false));
          localStorage.setItem('token', "");
          navigate("/auth/login");
      }
      else if (response.status === 204){
          update('delete', link.split("/")[link.split("/").length - 2])
          toast.success("Registro Excluído com Sucesso!")
          close()
      }    
    } catch (error){
        console.error("Erro: ",error)
    }
}              
  
  return (
    <Modal
      size="md"
      show={show}
      onHide={() => close()}
      aria-labelledby="example-modal-sizes-title-lg"
      className="align-items-center pt-10 modal-delete-card"
      dialogClassName="mt-20"
    >
      <Modal.Body className="text-center">
        <h2 className="mt-4" id="" style={{display: 'block', fontSize:'18px'}}>Excluir este {name || 'card'}</h2>
        <div className=" mt-3" id="" style={{display: 'block'}}>
          <div style={{fontSize: '13px'}}>Todas as informações deste {name || 'card'} serão excluídas. Essa ação não poderá ser desfeita.</div>
        </div>
        <div className="d-block sectionform mt-3 text-end">
            <Button className="btn-light w-30 m-1" onClick={()=>{close()}}>Cancelar</Button>
            <Button className="btn-warning w-30 m-1" onClick={deletePoint}>Excluir {name || 'Card'}</Button>
        </div>
      </Modal.Body>
    </Modal>
  )

};

export default ModalDeleteCard;