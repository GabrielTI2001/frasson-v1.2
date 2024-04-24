import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Row } from 'react-bootstrap';
import { RetrieveRecord } from '../../../helpers/Data';
import PicturesGallery from '../../../components/Custom/Galery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTractor, faLayerGroup, faCalendarDays, faUpRightAndDownLeftFromCenter, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';

const ViewBenfeitoria = () => {
    const {uuid} = useParams()
    const [benfeitoria, setBenfeitoria] = useState()
    const [images, setImages] = useState()
    const navigate = useNavigate()
    const setter = (data) =>{
        setBenfeitoria(data)
    }
    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(uuid, 'register/farm-assets', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if (!benfeitoria){
            getdata()
        }
        else{
            if(!images){
                const img = benfeitoria.pictures.map(picture => ({
                    id:picture.id, url:`${process.env.REACT_APP_API_URL}/${picture.url}`
                }))
                // const img = [{id: benfeitoria.pictures[0].id, url:`${process.env.REACT_APP_API_URL}/${benfeitoria.pictures[0].url}`}, 
                // {id: benfeitoria.pictures[0].id, url:`${process.env.REACT_APP_API_URL}/${benfeitoria.pictures[0].url}`}]
                setImages(img)
            }
        }
    },[benfeitoria])
    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs mb-1">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/register'}>Cadastros Gerais</Link>
        </li>
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/register/farm-assets'}>Benfeitorias</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {benfeitoria && benfeitoria.str_farm}
        </li>  
    </ol>
     <Tabs defaultActiveKey="cadastro" id="uncontrolled-tab-example">
        <Tab eventKey="cadastro" title="Cadastro" className='border-bottom border-x p-3'>
        {benfeitoria ? 
            <Row>
                <div className='mb-1'>
                    <FontAwesomeIcon icon={faTractor} className="me-2"/><strong>Fazenda: </strong>
                    {benfeitoria.farm ? benfeitoria.str_farm :'-'}
                </div>
                <div className='mb-1'>
                    <FontAwesomeIcon icon={faLayerGroup} className="me-2"/><strong>Tipo de Benfeitoria: </strong>
                    {benfeitoria.type ? benfeitoria.str_type :'-'}
                </div>
                <div className='mb-1'>
                    <FontAwesomeIcon icon={faCalendarDays} className="me-2"/><strong>Data Construção: </strong>
                    {benfeitoria.data_construcao ? `${new Date(benfeitoria.data_construcao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` :'-'}
                </div>
                <div className='mb-1'>
                    <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className="me-2"/><strong>Tamanho: </strong>
                    {benfeitoria.tamanho ? Number(benfeitoria.tamanho).toLocaleString('pt-BR',
                 {minimumFractionDigits: 2, maximumFractionDigits:2}) :'-'}
                </div>
                <div className='mb-1'>
                    <FontAwesomeIcon icon={faMoneyBill} className="me-2"/><strong>Valor Estimado: </strong>
                    {benfeitoria.valor_estimado ? Number(benfeitoria.valor_estimado).toLocaleString('pt-BR',
                    {minimumFractionDigits: 2, maximumFractionDigits:2}) :'-'}
                </div>
            </Row>: <div>Loading</div>
        }
        </Tab>
        <Tab eventKey="fotos" title="Fotos" className='border-bottom border-x p-3'>
            <div>
            {images && images ? 
                <PicturesGallery images={images}/>
                :<div>Loading</div>
            }  
            </div>
        </Tab>
    </Tabs>
    </>
    );
};
  
export default ViewBenfeitoria;
  

