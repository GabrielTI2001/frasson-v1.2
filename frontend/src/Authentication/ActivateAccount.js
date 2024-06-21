import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

const Activate = () => {
    const [isdone, setIsdone] = useState(false)
    const [message, setMessage] = useState("")
    const { uid, token } = useParams()

    useEffect(() => {
      const handleSubmit = async () => {
        const credentials = {uid: uid, token:token}
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/users/activation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            if (response.status === 204){
              setMessage("Conta Ativada com Sucesso!")
            }
            else{
              setMessage("Erro: Token Inválido")
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
        }
      };
      if (!isdone){
          handleSubmit()
          setIsdone(true)
      }      
    }, [isdone, token, uid])
    
    return (
      <div id="page-container" className="text-center">
        {message === "" ? 
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          :<h6>{message}</h6>
        }
        {message === "Conta Ativada com Sucesso!" ? 
          <Link to={"/auth/login"}>Fazer Login</Link>
          : <div></div>
        }
      </div>
    );
  };
  
  export default Activate;
  