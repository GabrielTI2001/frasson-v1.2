import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { useAppContext } from '../../Main';
import customStyles, {customStylesDark} from './SelectStyles';
import { SelectSearchOptions } from '../../helpers/Data';
import { useNavigate } from 'react-router-dom';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ModalGMS from './ModalGMS';

const EditFormModal = ({
  onSubmit: handleSubmit,
  show,
  setShow,
  record, field, options
}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({user:user.id});
  const [defaultselected, setdefaultSelected] = useState();
  const [showModal, setShowModal] = useState({show:false, type:''})
  const inputRef = useRef(null);
  const {config: {theme}} = useAppContext();
  const navigate = useNavigate()

  useEffect(() => {
    if (show) {
      if (field.type === 'select2'){
        const option = field.ismulti ? record[field.list].map(d => ({value:d.value || d.id, label:d[field.string] || d.label})) 
        : {value: record[field.name], label: field.string ? record[field.string] : record[field.data] && record[field.data][field.attr_data]}
        setdefaultSelected({...defaultselected, [field.name]:option})
      }
      if (field.iscoordenada){
        setFormData({...formData, [field.name]:record[field.name]})
      }
    }
  }, [show]); 

  return (
    <>
    {show &&(
      <div
        className={classNames('rounded-3 transition-none')}
      >
        <Form
          onSubmit={e => {
          e.preventDefault();
            return handleSubmit(formData);
          }}
        >
          {field.label_html 
            ? <Form.Label className='mb-0 fw-bold fs--1'>{field.label_html}</Form.Label>
            : <Form.Label className='mb-0 fw-bold fs--1'>{field.label.replace('*','')} {field.medida && <>({field.medida}<sup>{field.potencia}</sup>)</>}</Form.Label>
          }
          {field.tooltip && 
            <OverlayTrigger overlay={
                <Tooltip id="overlay-trigger-example">
                    {field.tooltip}
                </Tooltip>
                }>
                <FontAwesomeIcon className='ms-2 text-primary' icon={faCircleQuestion}/>
            </OverlayTrigger>
          }
          {field.type === 'select2' ? ( defaultselected && <>
            <AsyncSelect ref={inputRef} defaultValue={defaultselected[field.name]} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select" isMulti={field.ismulti}
              loadOptions={(value) => SelectSearchOptions(value, field.url, field.attr1, field.attr2, false, field.params, navigate)} 
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  [field.name]: field.ismulti ? selected.map(s => s.value) : selected.value
                }));
              }
            } className='mb-1 fs--1'/>
          </>)
          : field.type === 'select' ?
          (<>
            <Form.Select ref={inputRef} defaultValue={record[field.name] || ''}
              className='mb-1 fs--1'
              onChange={({target}) => {
                setFormData(({...formData, [field.name]: target.value}));
              }
            }>
              {field.options ? Object.keys(field.options).map(key => 
                  <option value={key} key={key}>{field.options[key]}</option>
              )
              : field.boolean ? <>
                  <option value={false}>Não</option>
                  <option value={true}>Sim</option></>
              : <>
                  {options && options[field.name].map(o => 
                      <option value={o.value} key={o.value}>{o.label}</option>
                  )}
                </>
              }
            </Form.Select>
          </>)
          : field.type === 'file' ? <>
            <Form.Control
                name={field.name}
                className='mb-2'
                onChange={(e) => {setFormData({...formData, [e.target.name]:e.target.files})}}
                type="file"
            />
            </>
          : 
          <>
            {field.iscoordenada ? 
              <div className='d-flex justify-content-between'>
                <Form.Control
                  ref={inputRef} value={formData[field.name] || ''} name={field.name}
                  onChange={({target}) => setFormData(({...formData, [field.name]: target.value}))}
                  className={`mb-1 fs--1 px-2 me-2`}
                />
                <Button className='py-0' onClick={() => {setShowModal({show:true, type:field.cat})}}>GMS</Button>
              </div>
            :
              <Form.Control
                ref={inputRef} defaultValue={record[field.name] || ''} type={field.type}
                className={`mb-1 fs--1 px-2`} 
                as={field.type === 'textarea' ? 'textarea' : 'input'}
                onChange={({target}) => setFormData(({...formData, [field.name]: target.value}))}
              />
            }
          </>
          }

          <Row className={`gx-2 w-50 ms-0`}>
            <Button
              variant="primary"
              size="sm"
              className="col col-auto ms-0 me-2"
              type="submit"
            >
              <span>Atualizar</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="col col-auto border-400"
              type="button"
              onClick={() =>     
                setShow(prevState => ({
                ...prevState,
                [field.name]: false
              }))}
            >
              <span>Cancelar</span>
            </Button>
          </Row>  
        </Form>
      </div>   
    )}
    <ModalGMS show={showModal.show} type={showModal.type} changemodal={setShowModal} formData={formData} changeform={setFormData}
      field={field.name}
    />
    </>
  );
};

export default EditFormModal;
