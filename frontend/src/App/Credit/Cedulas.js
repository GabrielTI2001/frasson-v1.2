import { useDropzone } from 'react-dropzone';
import Flex from '../../components/common/Flex';
import { Form, ProgressBar, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faCloudArrowUp, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../Main';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../context/data';
import ModalDelete from '../../components/Custom/ModalDelete';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

export const Cedulas = ({card, cedulas, submit}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({operacao:card.id, upload_by:user.id});
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
    api.post('credit/operacoes-cedulas/', formDataToSend, {headers: {Authorization: `Bearer ${token}`}, 
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      }
    })
    .then((response) => {
      setIsUploading(false)
      setFormData({...formData, file:null})
      setAnexos([...response.data.map(d => ({...d, url:`${d.url}`})), ...anexos])
      toast.success("Cédula adicionada com sucesso!")
      setaccFiles()
    })
    .catch((error) =>{
      setIsUploading(false)
      setFormData({...formData, file:null})
      if (error.response.status === 400) {toast.error(error.response.data.file[0])}
      if (error.response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        RedirectToLogin(navigate)
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
    if (!anexos){
        setAnexos(cedulas)
    }
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
                <p className="fs-9 mb-0 text-700 ms-2">Arraste os arquivos aqui</p>
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
                <Link target='__blank' to={`${process.env.REACT_APP_API_URL}${a.url}`} 
                  className='col-11'
                >
                    <FontAwesomeIcon icon={faFilePdf} className='me-2 col-auto px-0 fs-1'/>
                    <span className='col-10'>{a.name}</span>
                </Link>
                <span className='col-auto text-end rounded-circle modal-editar' 
                  onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/credit/operacoes-cedulas/${a.id}/`})}}
                >
                    <FontAwesomeIcon icon={faClose} className='fs-0 text-body'/>
                </span>
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