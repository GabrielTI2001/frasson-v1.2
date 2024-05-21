import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import ActionButton from '../../../components/common/ActionButton';
import { Row, Table } from "react-bootstrap";
// import { faTrashAlt, faEdit } from "@fortawesome/free-solid-svg-icons";
import SubtleBadge from "../../../components/common/SubtleBadge";
import AllowedEmailsForm from "../AllowedEmails/AllowedEmailsForm";
import { useAppContext } from "../../../Main";

const IndexUsers = () => {
    const {config: {theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")
    const [users, setUsers] = useState()
    const [allowedEmails, setAllowedEmails] = useState()
    const navigate = useNavigate()

    const update = (type, dados) =>{
        if (type === 'edit'){
            setAllowedEmails([...allowedEmails.map(email =>(
                email.id === dados.id ? dados.dados : email
            ))])
        }
        else if (type === 'delete'){
            setAllowedEmails([...allowedEmails.filter(email => email.id !== dados.id)])
        }
        else{
            setAllowedEmails([...allowedEmails, dados])
        }
    }

    useEffect(() =>{
        const getdata = async () =>{
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/users/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
                    navigate(`/auth/login?next=${next}`);
                }
                else if (response.status === 200){
                    const data = await response.json();
                    setUsers(data)
                }
                else if (response.status === 404){
                    setUsers([])
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }

        const getAllowedEmails = async () =>{
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/allowed-emails/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
                    navigate(`/auth/login?next=${next}`);
                }
                else if (response.status === 200){
                    const data = await response.json();
                    setAllowedEmails(data)
                }
                else if (response.status === 404){
                    setUsers([])
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }

        if (!user.is_superuser){
            navigate("/error/403")
        }
        if (!users){
            getdata()
            getAllowedEmails()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/home'}>Home</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Usuários do Sistema
            </li>    
        </ol>
        <Row>
        <h4 className="fw-600 fs--1">Usuários</h4>
        {users && 
        <Table responsive>
            <thead className="bg-300">
                <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">E-Mail</th>
                    <th scope="col">Status</th>
                    <th scope="col">Último Login</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {users.map(user =>(
               <tr key={user.email} style={{cursor:'auto'}}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td><SubtleBadge bg={user.is_active ? 'success' : 'danger'} className='fw-bold'>{user.is_active ? 'Ativo' : 'Inativo'}</SubtleBadge></td>
                <td>{user.last_login 
                    ? new Date(user.last_login).toLocaleDateString('pt-BR', {timeZone: 'UTC'})+' '+new Date(user.last_login).toLocaleTimeString('pt-BR')
                    : '-'}</td>
               </tr>
            ))} 
            </tbody>
        </Table>        
        }
        {allowedEmails &&
        <Table responsive style={{width: '320px'}}>
            <thead className="bg-300">
                <tr>
                    <th scope="col">E-Mails Autorizados no Sistema</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {allowedEmails.map(email =>(
               <tr key={email.id} style={{cursor:'auto'}}>
                <td>{email.email}</td>
                {/* <td className="text-end">
                    <ActionButton icon={faEdit} title="Edit" variant="action" className="px-1 py-0 me-2"/>
                    <ActionButton icon={faTrashAlt} title="Delete" variant="action" className="px-1 py-0" />
                </td> */}
               </tr>
            ))} 
            </tbody>
        </Table>        
        }
        <AllowedEmailsForm submit={update} />
        </Row>
        </>
    );
  };
  
  export default IndexUsers;
  