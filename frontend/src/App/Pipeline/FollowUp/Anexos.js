import { Form, Placeholder, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faCloudArrowUp, faFile } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandleSearch } from '../../../helpers/Data';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { useDropzone } from 'react-dropzone';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import Flex from '../../../components/common/Flex';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

export const Anexos = ({ pvtec }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({ pvtec: pvtec.id, uploaded_by: user.id });
  const [formDataResponse, setFormDataResponse] = useState({ pvtec: pvtec.id, uploaded_by: user.id, pvtec_response: true });
  const { config: { theme, isRTL } } = useAppContext();
  const [anexos, setAnexos] = useState();
  const [anexosResposta, setAnexosResposta] = useState();
  const token = localStorage.getItem("token");
  const [modaldel, setModaldel] = useState({ show: false });
  const navigate = useNavigate();
  const [isDragActive, setIsDragActive] = useState();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const sendFile = (data, setData, updateList) => {
    if (data.file) {
      setIsUploading(true);
      const formDataToSend = new FormData();
      for (const key in data) {
        if (key === 'file') {
          for (let i = 0; i < data[key].length; i++) {
            formDataToSend.append('file', data[key][i]);
          }
        }
        else if (Array.isArray(data[key])) {
          data[key].forEach(value => {
            formDataToSend.append(key, value);
          });
        } else {
          formDataToSend.append(key, data[key]);
        }
      }
      api.post('pipeline/card-anexos/', formDataToSend, { headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      })
      .then((response) => {
        setIsUploading(false);
        setData({ ...data, file: null });
        updateList((prev) => [...prev, ...response.data.map(d => ({...d, file:`${process.env.REACT_APP_API_URL}${d.file}`}))]);
        toast.success("Anexo adicionado com sucesso!");
      });
    }
  };

  useEffect(() => {
    sendFile(formData, setFormData, setAnexos);
    sendFile(formDataResponse, setFormDataResponse, setAnexosResposta);
  }, [formData, formDataResponse]);

  const { getRootProps: getRootPropsSolicitacao, getInputProps: getInputPropsSolicitacao } = useDropzone({
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFormData({ ...formData, file: acceptedFiles });
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const { getRootProps: getRootPropsResposta, getInputProps: getInputPropsResposta } = useDropzone({
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFormDataResponse({ ...formDataResponse, file: acceptedFiles });
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const handleDelete = (type, data) => {
    setAnexosResposta(anexosResposta.filter(c => parseInt(c.id) !== parseInt(data)));
  };

  useEffect(() => {
    const getData = async () => {
      if (!anexos) {
        const status = await HandleSearch('', 'pipeline/card-anexos', (data) => { setAnexos(data); }, `?pvtec=${pvtec.id}`);
        if (status === 401) {
          RedirectToLogin(navigate);
        }
        HandleSearch('', 'pipeline/card-anexos', (data) => { setAnexosResposta(data); }, `?pvtec=${pvtec.id}&isresponse=1`);
      }
    };
    getData();
  }, []);

  return (
    <>
      <div className='mt-0 pe-2'>
        <strong className='d-block'>Anexos de Solicitação ({anexos && anexos.length})</strong>
        {anexos ? (anexos.length > 0 ? anexos.map(a =>
          <div className='p-1 gx-2 d-flex col rounded-2 my-1 justify-content-between nav-link cursor-pointer hover-children'
            key={a.id}
          >
            <Link target='__blank' to={a.file}
              className='col-11'
            >
              <FontAwesomeIcon icon={faFile} className='me-2 col-auto px-0 fs-1' />
              <span className='col-10'>{a.name}</span>
            </Link>
            {user.is_superuser && <span className='col-auto text-end rounded-circle modal-editar'
              onClick={() => { setModaldel({ show: true, link: `${process.env.REACT_APP_API_URL}/pipeline/card-anexos/${a.id}/` }) }}>
              <FontAwesomeIcon icon={faClose} className='fs-0 text-body' />
            </span>}
          </div>
        ) : <>
          <span className='fs--1'>Nenhum Anexo</span>
          <Form className='pe-2 mt-1 mb-3'>
            <div {...getRootPropsSolicitacao({ className: `dropzone-area py-2 container container-fluid ${isDragActive ? 'dropzone-active' : ''}`})}>
              <input {...getInputPropsSolicitacao()} />
              {isUploading ? 
                <ProgressBar animated now={progress} label={`${progress}%`} />
                :
                <Flex justifyContent="center" alignItems="center">
                  <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-warning' /></span>
                  <p className="fs-9 mb-0 text-700 ms-2">Arraste um novo anexo de SOLICITAÇÃO aqui</p>
                </Flex>
              }
            </div>
          </Form>
        </>) 
        :
          <div>
            <Placeholder animation="glow">
              <Placeholder xs={7} /> <Placeholder xs={4} />
              <Placeholder xs={4} />
              <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>
          </div>
        }
        <strong className='d-block'>Anexos de Resposta ({anexosResposta && anexosResposta.length})</strong>
        {anexosResposta ? (anexosResposta.length > 0 ? anexosResposta.map(a =>
          <div className='p-1 gx-2 d-flex col rounded-2 my-1 justify-content-between nav-link cursor-pointer hover-children'
            key={a.id}
          >
            <Link target='__blank' to={a.file}
              className='col-11'
            >
              <FontAwesomeIcon icon={faFile} className='me-2 col-auto px-0 fs-1' />
              <span className='col-10'>{a.name}</span>
            </Link>
            <span className='col-auto text-end rounded-circle modal-editar'
              onClick={() => { setModaldel({ show: true, link: `${process.env.REACT_APP_API_URL}/pipeline/card-anexos/${a.id}/` }) }}>
              <FontAwesomeIcon icon={faClose} className='fs-0 text-body' />
            </span>
          </div>
        ) : <span className='fs--1'>Nenhum Anexo</span>) : 
          <div>
            <Placeholder animation="glow">
              <Placeholder xs={7} /> <Placeholder xs={4} />
              <Placeholder xs={4} />
              <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>
          </div>
        }
        {anexos && anexos.length > 0 &&
        <Form className='pe-2 mt-1'>
          <div {...getRootPropsResposta({className: `dropzone-area py-2 container container-fluid ${isDragActive ? 'dropzone-active' : ''}`})}>
            <input {...getInputPropsResposta()} />
            {isUploading ? 
              <ProgressBar animated now={progress} label={`${progress}%`} />
              :
              <Flex justifyContent="center" alignItems="center">
                <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-warning' /></span>
                <p className="fs-9 mb-0 text-700 ms-2">Arraste um novo anexo de RESPOSTA aqui</p>
              </Flex>
            }
          </div>
        </Form>
        }
      </div>
      <ModalDelete show={modaldel.show} link={modaldel.link} update={handleDelete} close={() => setModaldel({ show: false })} />
    </>
  );
}
