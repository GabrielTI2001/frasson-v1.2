import { useEffect, useState } from "react";
import { Col, Nav, Placeholder, Row, Tab, Table, Tabs } from "react-bootstrap";
import { HandleSearch } from "../../helpers/Data";
import { useAppContext } from "../../Main";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faInbox, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { RedirectToLogin } from "../../Routes/PrivateRoute";

const Notifications = () => {
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const [messages, setMessages] = useState()
    const [arquivadas, setArquivadas] = useState()
    const [excluidas, setExcluidas] = useState()

    useEffect(() => {
        const fetchdata = async () => {
            const status = await HandleSearch('', 'inbox', (data) => setMessages(data), `?destinatario=${user.id}&notread=1`)
            if (status === 401){
                RedirectToLogin(navigate)
            }
        }
        fetchdata()
    }, [])
    const tabselect = async (key) =>{
        if (key === 'arquivadas'){
            const status = await HandleSearch('', 'inbox', (data) => setArquivadas(data), `?destinatario=${user.id}&archived=1`)
            if (status === 401){
                RedirectToLogin(navigate)
            }
        }
        if (key === 'inbox'){
            const status = await HandleSearch('', 'inbox', (data) => setMessages(data), `?destinatario=${user.id}&notread=1`)           
            if (status === 401){
                RedirectToLogin(navigate)
            }
        }
        if (key === 'lixeira'){
            const status = await HandleSearch('', 'inbox', (data) => setExcluidas(data), `?destinatario=${user.id}&deleted=1`)
            if (status === 401){
                RedirectToLogin(navigate)
            }
        }
    }

    return(
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
        <li className="breadcrumb-item fw-bold" aria-current="page">
            Central de Notificações
        </li>  
    </ol>
    <Tab.Container id="left-tabs-example" defaultActiveKey="inbox" onSelect={tabselect}>
        <Row>
            <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link className="text-body fw-bold" eventKey="inbox">
                            <FontAwesomeIcon icon={faInbox} className="me-2 text-success"/>Caixa de Entrada
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className="text-body fw-bold" eventKey="arquivadas">
                            <FontAwesomeIcon icon={faCheck} className="me-2 text-info"/>Lidas
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link className="text-body fw-bold" eventKey="lixeira">
                            <FontAwesomeIcon icon={faTrashAlt} className="me-2 text-danger"/>Lixeira
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col sm={9}>
                <Tab.Content>
                    <Tab.Pane eventKey="inbox">
                    {messages ? 
                        <div className="card shadow-none p-2">
                            <Table responsive size="sm" className={`fs--1 card d-table shadow-none mb-1`}>
                                <tbody className="p-2">
                                {messages.map(m =>
                                    <tr className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`} style={{cursor:'auto'}}>
                                        <td className="p-3" scope="col" >
                                            <span className="fw-bold text-primary">{m.subject}</span>
                                            <div>{m.text}</div>
                                            <div className="mb-2">
                                                <img className="rounded-circle me-2" style={{width:'20px'}} 
                                                src={`${process.env.REACT_APP_API_URL}/${m.avatar}`}/>
                                                <span className="fw-bold text-info-emphasis fs--2">{m.str_recipient+' '}</span>
                                                <span className="fw-bold text-body fs--2 mb-2">
                                                    em {new Date(m.created_at).toLocaleDateString('pt-BR', {timeZone:'UTC'})+' '}
                                                    {new Date(m.created_at).toLocaleTimeString('pt-BR')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </div>
                        :
                        <div>
                            <Placeholder animation="glow">
                                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                                <Placeholder xs={4} />
                                <Placeholder xs={6} /> <Placeholder xs={8} />
                            </Placeholder>    
                        </div>
                    }
                    </Tab.Pane>
                    <Tab.Pane eventKey="arquivadas">
                        <div className="card shadow-none p-2">
                            <Table responsive size="sm" className={`fs--1 card d-table shadow-none mb-1`}>
                                <tbody className="p-2">
                                {arquivadas ? arquivadas.map(m =>
                                    <tr className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`} style={{cursor:'auto'}}>
                                        <td className="p-3" scope="col" >
                                            <span className="fw-bold text-primary">{m.subject}</span>
                                            <div>{m.text}</div>
                                            <div className="mb-2">
                                                <img className="rounded-circle me-2" style={{width:'20px'}} 
                                                src={`${process.env.REACT_APP_API_URL}/${m.avatar}`}/>
                                                <span className="fw-bold text-info-emphasis fs--2">{m.str_recipient+' '}</span>
                                                <span className="fw-bold text-body fs--2 mb-2">
                                                    em {new Date(m.created_at).toLocaleDateString('pt-BR', {timeZone:'UTC'})+' '}
                                                    {new Date(m.created_at).toLocaleTimeString('pt-BR')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ):
                                <div>
                                    <Placeholder animation="glow">
                                        <Placeholder xs={7} /> <Placeholder xs={4} /> 
                                        <Placeholder xs={4} />
                                        <Placeholder xs={6} /> <Placeholder xs={8} />
                                    </Placeholder>    
                                </div>
                                }
                                </tbody>
                            </Table>
                        </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="lixeira">
                        <div className="card shadow-none p-2">
                            <Table responsive size="sm" className={`fs--1 card d-table shadow-none mb-1`}>
                                <tbody className="p-2">
                                {excluidas ? excluidas.map(m =>
                                    <tr className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`} style={{cursor:'auto'}}>
                                        <td className="p-3" scope="col" >
                                            <span className="fw-bold text-primary">{m.subject}</span>
                                            <div>{m.text}</div>
                                            <div className="mb-2">
                                                <img className="rounded-circle me-2" style={{width:'20px'}} 
                                                src={`${process.env.REACT_APP_API_URL}/${m.avatar}`}/>
                                                <span className="fw-bold text-info-emphasis fs--2">{m.str_recipient+' '}</span>
                                                <span className="fw-bold text-body fs--2 mb-2">
                                                    em {new Date(m.created_at).toLocaleDateString('pt-BR', {timeZone:'UTC'})+' '}
                                                    {new Date(m.created_at).toLocaleTimeString('pt-BR')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ):
                                <div>
                                    <Placeholder animation="glow">
                                        <Placeholder xs={7} /> <Placeholder xs={4} /> 
                                        <Placeholder xs={4} />
                                        <Placeholder xs={6} /> <Placeholder xs={8} />
                                    </Placeholder>    
                                </div>
                                }
                                </tbody>
                            </Table>
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Col>
        </Row>
    </Tab.Container>

    </>
    )
}
export default Notifications;