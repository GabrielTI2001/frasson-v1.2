import React, { useState, useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import { Table, Row, Placeholder} from 'react-bootstrap';
import { useAppContext } from "../../Main";

const MyAssessments = () =>{
    const {config: {theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem('user'))
    const [dados, setDados] = useState();
    const navigate = useNavigate();
    const token = localStorage.getItem("token")
    console.log(dados)

    const handleApi = async () => {
        const link = `${process.env.REACT_APP_API_URL}/assessments/my/?user=${user.id}`
        const method = 'GET'
        try {
            const response = await fetch(link, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (response.status === 401){
              localStorage.setItem("login", JSON.stringify(false));
              localStorage.setItem('token', "");
              navigate("/auth/login");
            }
            else if (response.status === 201 || response.status === 200){
                setDados(data.avaliacoes)
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    useEffect(()=>{
        handleApi()
    },[])
    

    return(
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                Minhas Avaliações Pendentes
            </li>
        </ol>
        {dados ?
        <Row xl={2} className="mt-2">
            <Table responsive>
                <thead className="bg-300">
                    <tr>
                        <th scope="col">Data Ref.</th>
                        <th scope="col">Descrição</th>
                        <th scope="col">AÇÕES</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {dados && dados.map(reg =>(
                <tr key={reg.uuid} style={{cursor:'auto'}}>
                    <td>{reg.description}</td>
                    <td>{reg.data}</td>
                    <td>
                        <Link className="badge bg-success fs--2" to={`/assessments/quiz/${reg.uuid}`}>Responder</Link>
                    </td>
                </tr>
                ))} 
                </tbody>
            </Table>
        </Row>
        :             
        <Placeholder animation="glow">
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
            <Placeholder xs={4} />
            <Placeholder xs={6} /> <Placeholder xs={8} />
        </Placeholder> 
        }
        </>
    )
}

export default MyAssessments;