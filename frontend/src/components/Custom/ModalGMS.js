import React, { useState } from 'react';
import { Modal, CloseButton } from "react-bootstrap";
import { Button, Form, Row, Col} from 'react-bootstrap';
import { convertGMStoGD } from '../../helpers/utils';
import { toast } from 'react-toastify';

const ModalGMS = ({show, type, formData, changeform, changemodal, fields=['latitude_gd', 'longitude_gd'], field}) =>{
    const [gmsform, setGMSform] = useState({})

    const submit = () =>{
        const valor = convertGMStoGD(gmsform.graus, gmsform.minutos, gmsform.segundos)
        if (!valor){
          toast.error('Valores inválidos')
        }
        if (field){
          changeform({...formData, [field]:valor})
        }
        else{
          if (type === 'latitude'){
            changeform({...formData, [fields[0]]:valor})
          }
          else{
            changeform({...formData, [fields[1]]:valor})
          }
        }
        setGMSform({})
        changemodal({show:false, type:type})
    }

    const handleFieldChange = e => {
        setGMSform({
          ...gmsform,
          [e.target.name]: e.target.value
        });
    };

    return (
      <Modal
        size="m"
        show={show}
        onHide={() =>changemodal({show:false, type:type})}
        aria-labelledby="example-modal-sizes-title-lg"
        className="align-items-center pt-10 modal-delete-card"
        dialogClassName="mt-20"
        backdrop={false}
      >
        <Modal.Header>
          <Modal.Title id="example-modal-sizes-title-sm fs-xxs">
           {type === 'latitude' ? "Latitude": "Longitude"} Sul
          </Modal.Title>
          <CloseButton onClick={() => {
              changemodal({show:false, type:type});
            }}/>
        </Modal.Header>
        <Modal.Body className="">
          <Row style={{fontSize: '11px !important'}}>
            <Form.Group className="mb-2" as={Col} lg={3} sm={3}>
                <Form.Label className='fw-bold mb-1'>Graus</Form.Label>
                <Form.Control
                    value={gmsform.graus || ''}
                    name="graus"
                    onChange={handleFieldChange}
                    type="number"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} lg={3} sm={3}>
                <Form.Label className='fw-bold mb-1'>Minutos</Form.Label>
                <Form.Control
                    value={gmsform.minutos || ''}
                    name="minutos"
                    onChange={handleFieldChange}
                    type="number"
                />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} lg={3} sm={3}>
                <Form.Label className='fw-bold mb-1'>Segundos</Form.Label>
                <Form.Control
                    value={gmsform.segundos || ''}
                    name="segundos"
                    onChange={handleFieldChange}
                    type="number"
                />
            </Form.Group>
          </Row>
          <Button onClick={submit}>Converter</Button>
        </Modal.Body>
      </Modal>
    )
}
export default ModalGMS;