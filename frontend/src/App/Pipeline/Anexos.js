import { useDropzone } from 'react-dropzone';
import Flex from '../../components/common/Flex';
import { Form, ProgressBar, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faCloudArrowUp, faFile } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../Main';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandleSearch } from '../../helpers/Data';
import { toast } from 'react-toastify';
import api from '../../context/data';
import ModalDelete from '../../components/Custom/ModalDelete';

export const Anexos = ({card, updatedactivity}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({fluxo_ambiental:card.id, uploaded_by:user.id});
  const [accFiles, setaccFiles] = useState();
  const {config: {theme, isRTL}} = useAppContext();
  const [anexos, setAnexos] = useState();
  const token = localStorage.getItem("token")
  const [modaldel, setModaldel] = useState({show:false})
  const navigate = useNavigate()
  const [isDragActive, setIsDragActive] = useState();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  if (formData.file && !isUploading){
    console.log("teste")
    setIsUploading(true)
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'file') {
        for (let i = 0; i < formData[key].length; i++) {
          formDataToSend.append('file', formData[key][i]);
        }
      }
      else if (Array.isArray(formData[key])) {
        formData[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    api.post('pipeline/card-anexos/', formDataToSend, {headers: {Authorization: `bearer ${token}`}, 
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      }
    })
    .then((response) => {
      setIsUploading(false)
      setFormData({...formData, file:null})
      setAnexos([...response.data.map(d => ({...d, file:`${process.env.REACT_APP_API_URL}${d.file}`})), ...anexos])
      setaccFiles()
      updatedactivity({type:'ch', campo:'a Lista de Anexos', created_at:response.data[0].created_at, user:response.data[0].user})
      toast.success("Anexo adicionado com sucesso!")
    })
  }
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    multiple:true,
    onDrop: (acceptedFiles) => {
      setFormData({...formData, file:acceptedFiles})
      setaccFiles(acceptedFiles)
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const files = accFiles ? accFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  )): <></>;

  const handledelete = (type, data) =>{
    setAnexos(anexos.filter(c => c.id !== parseInt(data)))
  }

  useEffect(() =>{
    const getdata = async () =>{
      if (!anexos){
        const status = await HandleSearch('', 'pipeline/card-anexos',(data) => {setAnexos(data)}, `?fluxogai=${card.id}`)
        if (status === 401){
          navigate("/auth/login")
        }
      }
    }
    getdata()
  },[])

  return (
    <>
    <Form className='pe-2'>
        <div {...getRootProps({ className: `dropzone-area py-2 container container-fluid ${isDragActive ? 'dropzone-active' : ''}`})}>
            <input {...getInputProps()}/>
            {isUploading ? 
              <ProgressBar animated now={progress} label={`${progress}%`} />
              :
              <Flex justifyContent="center" alignItems="center">
                <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-secondary'/></span>
                <p className="fs-9 mb-0 text-700 ms-2">Arraste o arquivo aqui</p>
            </Flex>
            }
        </div>
        <div className="mt-1 fs--2">
            {acceptedFiles.length > 0 && (
            <>
                <h6>Arquivo</h6>
                <ul>{files}</ul>
            </>
            )}
        </div>
    </Form>
    <div className='mt-2 pe-2'>
        {anexos ? anexos.map(a => 
            <div className='p-1 gx-2 d-flex row flex-row rounded-2 my-2 justify-content-between nav-link cursor-pointer div-hover-children' 
              key={a.id}
            >
                <Link target='__blank' to={a.file} 
                    className='col-11'
                >
                    <FontAwesomeIcon icon={faFile} className='me-2 col-auto px-0 fs-1'/>
                    <span className='col-10'>{a.name}</span>
                </Link>
                <span className='col-auto text-end rounded-circle modal-editar' 
                onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/card-anexos/${a.id}/`})}}>
                    <FontAwesomeIcon icon={faClose} className='fs-0 text-body'/>
                </span>
                <div className='text-600 fs--2'>Carregado por {a.user.name} em
                {' '+new Date(a.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone:'UTC'})}
                {' às '+new Date(a.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                </div>
            </div>
        ) : 
        <div className='text-center'>
          <Spinner />
        </div> 
        }
    </div>
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
}