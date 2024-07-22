import React from 'react';
import AsyncSelect from 'react-select/async';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Col } from 'react-bootstrap';
import {customStyle} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions } from '../../helpers/Data';

const RenderFields = ({ fields, formData, changefield, changefile, message, hasLabel, defaultoptions, type}) => {
  const {config: {theme}} = useAppContext();
  const navigate = useNavigate();
  return (
    fields && fields.map(f => (
        <Form.Group className="mb-2" as={Col} xl={f.xl} sm={f.sm} key={f.name}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>{f.label}</Form.Label>}
            {f.type === 'select' ?
                <Form.Select
                    value={formData[f.name] || ''} 
                    name={f.name}
                    onChange={changefield}
                    isInvalid={message && message[f.name]}
                >
                {Object.keys(f.options).map(key => 
                    <option value={key} key={key}>{f.options[key]}</option>
                )}
                </Form.Select>
            : f.type === 'select2' ? defaultoptions && 
                <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, f.url, f.attr1, f.attr2, false, null, navigate)} isMulti={f.ismulti}
                    styles={customStyle(theme, message && message[f.name])} classNamePrefix="select"
                    defaultValue={ type === 'edit' ? (defaultoptions[f.name] || '') : ''}
                    onChange={(selected) => changefield({target:{name:f.name, value:f.ismulti ? selected.map(s => s.value) : selected.value}})}
                />
            : f.type === 'file' ?
                <Form.Control
                    isInvalid={message && message[f.name]}
                    name={f.name}
                    onChange={changefile}
                    type="file"
                />
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
            <label className='text-danger'>{message ? message[f.name] : ''}</label>
        </Form.Group>
    ))
  );
};

export default RenderFields;
