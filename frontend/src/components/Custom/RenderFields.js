import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { Form, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {customStyle} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions } from '../../helpers/Data';
import ModalGMS from './ModalGMS';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

const RenderFields = ({ fields, formData, changefield, changefile, message, hasLabel, changefilemulti, options, setform}) => {
  const {config: {theme}} = useAppContext();
  const [showModal, setShowModal] = useState({show:false, type:''})
  const navigate = useNavigate();
  return (<>
    {fields && fields.map(f => (
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
            : f.type === 'select2' ?
                <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, f.url, f.attr1, f.attr2, false, f.params, navigate)} isMulti={f.ismulti}
                    styles={customStyle(theme, message && message[f.name])} classNamePrefix="select"
                    onChange={(selected) => changefield({target:{name:f.name, value:f.ismulti ? selected.map(s => s.value) : selected.value}})}
                />
            : f.type === 'file' ?
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
                            className={`me-2`}
                        />
                        <Button onClick={() => {setShowModal({show:true, type:f.cat})}}>GMS</Button>
                    </div>
                :
                    <Form.Control
                        isInvalid={message && message[f.name]}
                        value={formData[f.name] || ''}
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
    ))}
    <ModalGMS show={showModal.show} type={showModal.type} changemodal={setShowModal} formData={formData} changeform={setform}
        fields={fields.filter(f => f.iscoordenada === true).map(f => f.name)}
    />
    </>
  );
};

export default RenderFields;
