import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { Form, Col, Button, OverlayTrigger, Tooltip, ProgressBar, Dropdown } from 'react-bootstrap';
import {customStyle} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions } from '../../helpers/Data';
import ModalGMS from './ModalGMS';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleQuestion, faCloudArrowUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import Flex from '../common/Flex';
import { useDropzone } from 'react-dropzone';

const RenderFields = ({ fields, formData, changefield, changefile, message, hasLabel, changefilemulti, options, setform, defaultvalues}) => {
  const {config: {theme}} = useAppContext();
  const [showModal, setShowModal] = useState({show:false, type:''})
  const navigate = useNavigate();
  const [isDragActive, setIsDragActive] = useState();
  const [progress, setProgress] = useState(100);
  const [isUploading, setIsUploading] = useState(false);

  const ConfigureDropzone = (f) => {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        multiple:true,
        onDrop: (acceptedFiles) => {
            setIsUploading(true)
            f.ismulti ? changefilemulti({target:{name:'file', files:acceptedFiles}}) : changefilemulti({target:{name:'file', files:acceptedFiles}})
            setIsUploading(false)
        },
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        onDropAccepted: () => setIsDragActive(false),
        onDropRejected: () => setIsDragActive(false),
      });
      return { acceptedFiles, getRootProps, getInputProps, isDragActive };
  }

  return (<>
    {fields && fields.map(f => {
        const dropzoneProps = f.type === 'file' && f.isdrop ? ConfigureDropzone(f) : {};
        return(
        <Form.Group className="mb-2" as={Col} xl={f.xl || 12} sm={f.sm || 12} key={f.name}>
            {hasLabel && (f.label_html 
                ? <Form.Label className='fw-bold mb-1'>{f.label_html}</Form.Label>
                : <Form.Label className='fw-bold mb-1'>{f.label} {f.medida && <>({f.medida}<sup>{f.potencia}</sup>)</>}</Form.Label>
            )}
            {f.tooltip && 
                <OverlayTrigger overlay={
                    <Tooltip id="overlay-trigger-example">
                        {f.tooltip}
                    </Tooltip>
                    }>
                    <FontAwesomeIcon className='ms-2 text-primary' icon={faCircleQuestion}/>
                </OverlayTrigger>
            }
            {f.type === 'select' ?
                <Form.Select
                    value={formData[f.name] || ''} 
                    name={f.name}
                    onChange={changefield}
                    isInvalid={message && message[f.name]}
                >
                    {f.options ? 
                        Object.keys(f.options).map(key => 
                            <option value={key} key={key}>{f.options[key]}</option>
                        )
                    : f.boolean ? <>
                        <option value={false}>Não</option>
                        <option value={true}>Sim</option></>
                    :<>
                        <option>---</option>
                        {options && options[f.name].map(o => 
                            <option value={o.value} key={o.value}>{o.label}</option>
                        )}
                    </>
                    }
                </Form.Select>
            : f.type === 'dropdown' ? <>
                <Form.Label className='mb-1 ms-1 d-block d-flex align-items-center'>
                    {f.icon && f.icon[formData[f.name]]}{formData[f.name] && f.options[formData[f.name]]}
                </Form.Label>
                <Dropdown
                    drop={'down'}
                    className='me-2 mb-1 d-block etiqueta-dropdown w-25'
                    onSelect={(key) => changefield({target:{name:f.name, value:key}})}
                >
                    <Dropdown.Toggle variant='none'>
                        <span className='text-primary'><FontAwesomeIcon icon={faPlus} className='me-2'/>Selecionar</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                    {f.options &&
                        Object.keys(f.options).map(key => 
                            <Dropdown.Item key={key} eventKey={key} className='d-flex align-items-center fs--1 justify-content-between'>
                                <span>{f.icon && f.icon[key]} {f.options[key]}</span> 
                                {formData[f.name] === key && <FontAwesomeIcon icon={faCheckCircle} className='text-primary'/>}
                            </Dropdown.Item>
                        )
                    }   
                    </Dropdown.Menu>
                </Dropdown>
            </>
            : f.type === 'select2' ?
                <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, f.urlapi || f.url, f.attr1, f.attr2, false, f.params, navigate)} isMulti={f.ismulti}
                    styles={customStyle(theme, message && message[f.name])} classNamePrefix="select"
                    defaultValue={defaultvalues ? defaultvalues[f.name] : ''}
                    onChange={(selected) => changefield({target:{name:f.name, value:f.ismulti ? selected.map(s => s.value) : selected.value}})}
                />
            : f.type === 'file' ?
                f.isdrop ?
                <div {...dropzoneProps.getRootProps({ className: `dropzone-area py-2 container container-fluid ${isDragActive ? 'dropzone-active' : ''}`})}
                    style={{height:'60%'}}
                >
                    <input {...dropzoneProps.getInputProps()}/>
                    {isUploading ? 
                        <ProgressBar animated now={progress} label={`${progress}%`} />
                    :
                    <Flex justifyContent="center" alignItems="center">
                        <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-secondary'/></span>
                        <p className="fs-9 mb-0 text-700 ms-2">
                            {!dropzoneProps.acceptedFiles.length > 0 ? 'Arraste os arquivos aqui' : dropzoneProps.acceptedFiles.length+' Arquivo(s) Selecionado(s)'}
                        </p>
                    </Flex>
                    }
                </div>
                :
                <Form.Control
                    isInvalid={message && message[f.name]}
                    name={f.name}
                    onChange={f.ismulti ? changefilemulti : changefile}
                    multiple={f.ismulti}
                    type="file"
                />
            :<>
                {f.iscoordenada ? 
                    <div className='d-flex justify-content-between'>
                        <Form.Control
                            isInvalid={message && message[f.name]}
                            value={formData[f.name] || ''}
                            name={f.name}
                            onChange={changefield}
                            type={f.type}
                            className={`me-2 px-2`}
                        />
                        <Button onClick={() => {setShowModal({show:true, type:f.cat})}}>GMS</Button>
                    </div>
                :
                    <Form.Control
                        isInvalid={message && message[f.name]}
                        value={formData[f.name] || ''} className='px-2'
                        name={f.name}
                        as={f.type === 'textarea' ? 'textarea' : 'input'}
                        rows={f.rows}
                        onChange={changefield}
                        type={f.type}
                    />
                }
            </>
        }
            <label className='text-danger'>{message ? message[f.name] : ''}</label>
        </Form.Group>
        )
    })}
    <ModalGMS show={showModal.show} type={showModal.type} changemodal={setShowModal} formData={formData} changeform={setform}
        fields={fields.filter(f => f.iscoordenada === true).map(f => f.name)}
    />
    </>
  );
};

export default RenderFields;
