import { Modal, Button} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import SweetAlert2 from 'react-sweetalert2'; //Não retirar
import { RedirectToLogin } from "../../Routes/PrivateRoute";

//Use sempre barra depois do link
const ModalDelete = ({show, close, link, update, transparent}) => {
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
          RedirectToLogin(navigate);
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
      size="m"
      show={show}
      onHide={() => close()}
      aria-labelledby="example-modal-sizes-title-lg"
      className="align-items-center pt-10 modal-delete"
      dialogClassName="mt-20"
    >
      <Modal.Body className="text-center">
        <div className="swal2-icon swal2-warning swal2-icon-show mt-4" style={{display: 'flex'}}>
          <div className="swal2-icon-content">!</div>
        </div>
        <h2 className="swal2-title mt-4" id="swal2-title" style={{display: 'block', fontSize:'18px'}}>Você tem certeza?</h2>
        <div className="swal2-html-container mt-3" id="swal2-html-container" style={{display: 'block'}}>
          <div style={{fontSize: '13px'}}>Esse registro será excluído!</div>
        </div>
        <div className="d-block sectionform mt-3">
            <Button className="btn-danger w-30 m-1" onClick={deletePoint}>Sim, Excluir!</Button>
            <Button className="btn-primary w-30 m-1" onClick={()=>{close()}}>Cancelar</Button>
        </div>
      </Modal.Body>
    </Modal>
  )

};

export default ModalDelete;