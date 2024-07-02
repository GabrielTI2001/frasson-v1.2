import { useDropzone } from 'react-dropzone';
import Flex from '../../components/common/Flex';
import cloudUpload from '../../assets/img/icons/cloud-upload.svg';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

export const Anexos = () => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <>
     <Form>
        <div {...getRootProps({ className: 'dropzone-area py-3' })}>
                <input {...getInputProps()} />
                <Flex justifyContent="center" alignItems="center">
                <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-secondary'/></span>
                <p className="fs-9 mb-0 text-700 ms-2">Arraste o arquivo aqui</p>
                </Flex>
        </div>
        <div className="mt-1 fs--2">
            {acceptedFiles.length > 0 && (
            <>
                <h6>Arquivo</h6>
                <ul>{files}</ul>
            </>
            )}
        </div>
        <Button type='submit'>Enviar</Button>
      </Form>
    </>
  );
}