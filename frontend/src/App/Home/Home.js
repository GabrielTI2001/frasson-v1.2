import React, { useContext, useState, useEffect} from 'react';
import {ProfileContext} from '../../context/Context';
import { Col, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilSquare } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../Main';
import { GetRecord, HandleSearch } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const Home = () => {
    const {profileState:{perfil}} = useContext(ProfileContext)
    const {config: {theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem('user'))
    const [data, setData] = useState()
    const [pipes, setPipes] = useState()
    const navigate = useNavigate()

    useEffect(() => {
        const getdata = async () =>{
            const dados = await GetRecord('', 'register/landing')
            setData(dados)
            const status = await HandleSearch('', 'pipeline/pipe-data', (data) => setPipes(data), `?user=${user.id}`)
            if (status === 401) RedirectToLogin(navigate)
        }   
        getdata()
    }, [])

    return (
        <>
            {perfil && perfil.avatar &&
                <Row className='mb-3 mt-2 gx-1'>
                    <Col xl='auto' sm='auto'>
                        <img className='p-0 rounded-circle me-0' style={{width: '40px', height: '40px'}} 
                            src={`${perfil.avatar}`}
                        />
                    </Col>
                    <Col>
                        <div className='fs--1 fw-bold'>
                            Olá, <strong className='text-primary fs--1'>{perfil !== '' ? perfil.first_name : ""}</strong>.
                            <span className='ms-1 fs--1'>{data && data.message}</span>
                            <p className='mb-0 text-secondary'>Hoje é {data && data.str_data_hoje}</p>
                        </div>
                    </Col>
                    
                </Row>
            }
            <h4 className='fw-bold fs-1'>Fluxos</h4>
            <Row xl={11} sm={5} xs={1} lg={10} className='gx-4 gy-4 cols-xl-12'>
            {pipes && pipes.map(p =>
                <Col key={p.id}>
                    <Link className={`card card-link-success-${theme} p-3 text-center`} 
                        to={`/pipeline/${p.code}`}
                    >
                        <div className='mb-3'>
                            <FontAwesomeIcon icon={faPencilSquare} className='fs-5 text-success-emphasis'/>
                        </div>
                        <h4 className='fs--1 text-body'>{p.descricao}</h4>
                    </Link>
                </Col>
            )}
            </Row>
        </>

    );
  };
  
  export default Home;
  