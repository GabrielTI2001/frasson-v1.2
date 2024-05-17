import React, {useState, useEffect} from "react";
import { Card, Row, Col, Placeholder} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faCaretDown, faCaretUp} from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../../Main";
import { LineChart } from "../../../components/Custom/Charts";

const Exchange = () =>{
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState()
    const token = localStorage.getItem("token")

    useEffect(()=>{
        if (!searchResults){
            handleSearch('') 
        }
    }, [])

    const handleSearch = async (search) => {
        const url = `${process.env.REACT_APP_API_URL}/external/currency/exchange?search=${search}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();
            if (response.status === 401) {
                localStorage.setItem("login", JSON.stringify(false));
                localStorage.setItem('token', "");
                navigate("/auth/login");
            } else if (response.status === 200) {
                setSearchResults(data)
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/external-api'}>API de Terceiros</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Taxa de Câmbio
            </li>    
        </ol>
        {searchResults ?
        <Row xl={3}>
            <Col>
                <Card.Body className="px-1 py-2 card">
                    <div style={{paddingLeft: '0.6rem'}} className="d-flex justify-content-between">
                        <dt className="fs--1 fw-bold">USD/BRL { searchResults.usd.bid }</dt>
                        <div>
                            <div className={`d-inline-block px-2 py-0 rounded-3 fs-xs fw-normal text-${searchResults.usd.color }`}>
                                <FontAwesomeIcon className={`me-1 text-${searchResults.usd.color}`} 
                                    icon={searchResults.usd.arrow === "down" ? faCaretDown : faCaretUp} 
                                />
                                {searchResults.usd.varBid}
                            </div>
                            <div className={`d-inline-block px-2 py-0 rounded-3 fs-xs fw-normal text-${searchResults.usd.color }`}>
                                <FontAwesomeIcon className={`me-1 text-${searchResults.usd.color}`} 
                                    icon={searchResults.usd.arrow === "down" ? faCaretDown : faCaretUp} 
                                />
                                {searchResults.usd.pctChange}%
                            </div>
                        </div>
                    </div>
                    <LineChart 
                        values={searchResults.usd.dados_cotacao} 
                        columns={searchResults.usd.dados_hora}
                        name=''
                        title={`Dólar Americano/Real Brasileiro`}
                        area
                        height="200"
                        background='rgba(101, 163, 13, 1)'
                    />
                    <div className="px-2 py-1 justify-content-between"><span className="fw-semibold" style={{fontSize: '10px'}}>
                        Updated at { searchResults.usd.updated_at }</span>
                    </div>
                </Card.Body>
            </Col>

            <Col>
                <Card.Body className="px-1 py-2 card">
                    <div style={{paddingLeft: '0.6rem'}} className="d-flex justify-content-between">
                        <dt className="fs--1 fw-bold">EUR/BRL { searchResults.eur.bid }</dt>
                        <div>
                            <div className={`d-inline-block px-2 py-1 rounded-3 fs-xs fw-normal text-${searchResults.eur.color }`}>
                                <FontAwesomeIcon className={`me-1 text-${searchResults.eur.color}`} 
                                    icon={searchResults.usd.arrow === "down" ? faCaretDown : faCaretUp} 
                                />
                                {searchResults.usd.varBid}
                            </div>
                            <div className={`d-inline-block px-2 py-1 rounded-3 fs-xs fw-normal text-${searchResults.eur.color }`}>
                                <FontAwesomeIcon className={`me-1 text-${searchResults.eur.color}`} 
                                    icon={searchResults.eur.arrow === "down" ? faCaretDown : faCaretUp} 
                                />
                                {searchResults.eur.pctChange}%
                            </div>
                        </div>
                    </div>
                    <LineChart 
                        values={searchResults.eur.dados_cotacao} 
                        columns={searchResults.eur.dados_hora}
                        name=''
                        title={`Euro/Real Brasileiro`}
                        area
                        height="200"
                        background='rgba(6, 30, 108, 1)'
                    />
                    <div className="px-2 py-1 justify-content-between"><span className="fw-semibold" style={{fontSize: '10px'}}>
                        Updated at { searchResults.eur.updated_at }</span>
                    </div>
                </Card.Body>
            </Col>

            <Col>
                <Card.Body className="px-1 py-2 card">
                    <div style={{paddingLeft: '0.6rem'}} className="d-flex justify-content-between">
                        <dt className="fs--1 fw-bold">BTC/BRL { searchResults.btc.bid }</dt>
                        <div>
                            <div className={`d-inline-block px-2 py-1 rounded-3 fs-xs fw-normal text-${searchResults.btc.color }`}>
                                <FontAwesomeIcon className={`me-1 text-${searchResults.btc.color}`} 
                                    icon={searchResults.btc.arrow === "down" ? faCaretDown : faCaretUp} 
                                />
                                {searchResults.btc.varBid}
                            </div>
                            <div className={`d-inline-block px-2 py-1 rounded-3 fs-xs fw-normal text-${searchResults.btc.color }`}>
                                <FontAwesomeIcon className={`me-1 text-${searchResults.btc.color}`} 
                                    icon={searchResults.btc.arrow === "down" ? faCaretDown : faCaretUp} 
                                />
                                {searchResults.btc.pctChange}%
                            </div>
                        </div>
                    </div>
                    <LineChart 
                        values={searchResults.btc.dados_cotacao} 
                        columns={searchResults.btc.dados_hora}
                        name=''
                        title={`Bitcoin/Real Brasileiro`}
                        area
                        height="200"
                        background='rgba(255, 128, 0, 1)'
                    />
                    <div className="px-2 py-1 justify-content-between"><span className="fw-semibold" style={{fontSize: '10px'}}>
                        Updated at { searchResults.btc.updated_at }</span>
                    </div>
                </Card.Body>
            </Col>
        </Row>      
        : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div> 
        } 
        </>
        
    )
}

export default Exchange;