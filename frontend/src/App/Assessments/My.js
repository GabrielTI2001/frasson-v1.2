import React, { useState, useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import { Table, Row, Placeholder} from 'react-bootstrap';
import { useAppContext } from "../../Main";
import { GetRecords } from "../../helpers/Data";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";

const MyAssessments = () =>{
    const {config: {theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem('user'))
    const [dados, setDados] = useState();
    const navigate = useNavigate();

    const handleApi = async () => {
        const data = await GetRecords('assessments/my', `user=${user.id}`)
        if (!data){
            RedirectToLogin(navigate)
        }
        else{
            setDados(data.avaliacoes)
        }
    };
    useEffect(()=>{
        handleApi()
    },[])
    

    return(
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                Minhas Avaliações Pendentes
            </span>
        </CustomBreadcrumb>
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