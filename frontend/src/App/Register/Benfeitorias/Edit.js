import { useEffect, useState, useReducer } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { RetrieveRecord } from "../../../helpers/Data";
import PicturesGallery from "../../../components/Custom/Galery";
import BenfeitoriaForm from "./Form";
import { toast } from "react-toastify";
import ModalDelete from "../../../components/Custom/ModalDelete";

const BenfeitoriaEdit = () => {
    const {uuid} = useParams()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [benfeitoria, setBenfeitoria] = useState()
    const [images, setImages] = useState()
    const [newimg, setNewImg] = useState()
    const [modal, setModal] = useState({show:false, link:''})

    const setter = (data) =>{
        setBenfeitoria(data)
    }
    const posdelete = (type, data) =>{
        setImages(images.filter(i => i.id !== data))
    }

    const formImgsubmit = (e) =>{
        e.preventDefault();
        const formDataToSend = new FormData();
        for (let i = 0; i < newimg.file.length; i++) {
            formDataToSend.append('file', newimg.file[i]);
        }
        formDataToSend.append('benfeitoria', benfeitoria.id);
        // setImages([...images, {id:3, url:'teste'}])
        ApiImg(formDataToSend, null, 'add')
    }

    const changeImg = (e) =>{
        setNewImg({
            file: e.target.files
        });
    }

    const ApiImg = async (dadosform, id, type) => {
        const link = `${process.env.REACT_APP_API_URL}/register/picture-farm-assets/${type === 'edit' ?id+'/':''}` 
        const method = type === 'edit' ? 'PUT' : 'POST'
        try {
            const response = await fetch(link, {
              method: method,
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              body: dadosform
            });
            const data = await response.json();
            if(response.status === 400){
                toast.error("Erro: "+data.error)
            }
            else if (response.status === 401){
              localStorage.setItem("login", JSON.stringify(false));
              localStorage.setItem('token', "");
              navigate("/auth/login");
            }
            else if (response.status === 201 || response.status === 200){
              if (type === 'edit'){
                toast.success("Registro Atualizado com Sucesso!")
                setImages(images.map(img => img.id === data.id ? {...img, url:data.file}:img))
              }
              else{
                toast.success("Registro Efetuado com Sucesso!")
                setImages([...images, ...data.map(d => ({...d, url:`${process.env.REACT_APP_API_URL}${d.url}`}))])
              }
            }
        } catch (error) {
            console.error('Erro:', error);
        }
      };
    
    
    const reducer = (type, data) =>{
        if (type === 'edit'){
            const formDataToSend = new FormData();
            formDataToSend.append('file', data.file);
            formDataToSend.append('benfeitoria', benfeitoria.id);
            ApiImg(formDataToSend, data.id, 'edit')
        }
        else if (type === 'delete'){
            setModal({show:true, link:`${process.env.REACT_APP_API_URL}/register/picture-farm-assets/${data}/`})
        }
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(uuid, 'register/farm-assets', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("change_benfeitorias_fazendas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!benfeitoria){
            getdata()
        }       
        else{
            if(!images){
                const img = benfeitoria.pictures.map(picture => ({
                    id:picture.id, url:`${process.env.REACT_APP_API_URL}${picture.url}`
                }))
                // const img = [{id: benfeitoria.pictures[0].id, url:`${process.env.REACT_APP_API_URL}/${benfeitoria.pictures[0].url}`}, 
                // {id: benfeitoria.pictures[0].id, url:`${process.env.REACT_APP_API_URL}/${benfeitoria.pictures[0].url}`}]
                setImages(img)
            }
        } 
    },[benfeitoria])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/register/farm-assets'}>Benfeitorias</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Editar Benfeitoria
            </li>         
        </ol>
        <div className="fs--1 sectionform">
            {benfeitoria && (
            <>
                {/* FORMULÁRIO */}
                <BenfeitoriaForm type='edit' hasLabel data={benfeitoria}/>
                <hr></hr>
                {/* EDITAR FOTOS */}
                <h3 className="fs-0 fw-bold">Alterar Fotos</h3>
                {images ? <PicturesGallery images={images} showactions action={reducer}/> : <div>Loading...</div>}
            </>
            )}
            <hr></hr>
            <h3 className="fs-0 fw-bold">Adicionar Fotos</h3>
            <Form onSubmit={formImgsubmit}>
                <Form.Group className="mb-3">
                    <Form.Control 
                        name="file"
                        type="file"
                        onChange={changeImg}
                        multiple
                    />
                </Form.Group>
                <Form.Group>
                    <Button type="submit">Enviar</Button>
                </Form.Group>
            </Form>
        </div>
        <ModalDelete show={modal.show} close={() => setModal({...modal, show:false})} link={modal.link} update={posdelete}/>
    </>
    );
  };
  
  export default BenfeitoriaEdit;
  