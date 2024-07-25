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

export const Anexos = ({record, updatedactivity, isgai, isgc}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({contrato_ambiental:isgai ? record.id : null, 
    contrato_credito:isgc ? record.id : null, uploaded_by:user.id});
  const [accFiles, setaccFiles] = useState();
  const {config: {theme}} = useAppContext();
  const [anexos, setAnexos] = useState();
  const token = localStorage.getItem("token")
  const [modaldel, setModaldel] = useState({show:false})
  const navigate = useNavigate()
  const [isDragActive, setIsDragActive] = useState();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  if (formData.file && !isUploading){
    setIsUploading(true)
    const filteredData = Object.entries(formData)
      .filter(([key, value]) => value !== null)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    const formDataToSend = new FormData();
    for (const key in filteredData) {
      if (key === 'file') {
        for (let i = 0; i < filteredData[key].length; i++) {
          formDataToSend.append('file', filteredData[key][i]);
        }
      }
      else if (Array.isArray(filteredData[key])) {
        filteredData[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      } else {
        formDataToSend.append(key, filteredData[key]);
      }
    }
    api.post('finances/anexos/', formDataToSend, {headers: {Authorization: `Bearer ${token}`}, 
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      }
    })
    .then((response) => {
      setIsUploading(false)
      setFormData({...formData, file:null})
      setAnexos([...response.data.map(d => ({...d, file:`${process.env.REACT_APP_API_URL}${d.file}`})), ...anexos])
      toast.success("Anexo adicionado com sucesso!")
      setaccFiles()
      updatedactivity({type:'ch', campo:'a Lista de Anexos', created_at:response.data[0].created_at, user:response.data[0].user})
    })
    .catch((error) =>{
      setIsUploading(false)
      setFormData({...formData, file:null})
      if (error.response.status === 400) {toast.error(error.response.data.file[0])}
      if (error.response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        navigate("/auth/login")
      }
      else{toast.error("Ocorreu Um Erro!")}
      setaccFiles()
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
        const param = isgai ? 'contratogai' : isgc ? 'contratogc' : 'fluxogai'
        const param2 = ''
        const status = await HandleSearch('', 'finances/anexos',(data) => {setAnexos(data)}, `?${param}=${record.id}&${param2}`)
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
                <p className="fs-9 mb-0 text-700 ms-2">Arraste o(s) arquivo(s) aqui</p>
            </Flex>
            }
        </div>
        <div className="mt-1 fs--2">
            {acceptedFiles && acceptedFiles.length > 0 && (
            <>
                <h6>Arquivo</h6>
                <ul>{files}</ul>
            </>
            )}
        </div>
    </Form>
    <div className='mt-2 pe-2'>
        {anexos ? anexos.map(a => 
            <div className='p-1 gx-2 d-flex row flex-row rounded-2 my-2 justify-content-between nav-link cursor-pointer hover-children' 
              key={a.id}
            >
                <Link target='__blank' to={a.file} 
                    className='col-11'
                >
                    <FontAwesomeIcon icon={faFile} className='me-2 col-auto px-0 fs-1'/>
                    <span className='col-10'>{a.name}</span>
                </Link>
                <span className='col-auto text-end rounded-circle modal-editar' 
                onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/finances/anexos/${a.id}/`})}}>
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