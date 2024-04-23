import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import FalconLightBoxGallery from '../../components/common/FalconLightBoxGallery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil } from '@fortawesome/free-solid-svg-icons';

//A prop images deve receber um objeto com id e url da imagem
const PicturesGallery = ({ images, showactions, action }) => {
  const mudaarquivo = (e) =>{
    // setFormData({...formData, [e.target.name]:e.target.files})
    action('edit', {id:e.target.id, file:e.target.files[0]})
  }
  return (
    <FalconLightBoxGallery images={images.map(i => i.url)}>
      {setImgIndex => (
        <Row className="g-2" xl={4} sm={4} xs={2}>
          {images.map((img, index) => 
            <Col key={index}>
              <Image
                src={img.url}
                fluid
                rounded
                className='cursor-pointer mb-1'
                onClick={() => setImgIndex(index)}
              />
              {showactions &&
              <div className='row justify-content-center'>
                <FontAwesomeIcon icon={faTrash} style={{maxWidth: '12px', cursor: 'pointer', marginTop:'0px'}} onClick={() => action('delete', img.id)} 
                className='px-1 py-0 mx-1 fa-2x'/>
                <label className='cursor-pointer px-1 mb-0 w-auto h-auto' htmlFor={img.id}>
                  <FontAwesomeIcon icon={faPencil} style={{maxWidth: '15px'}} className='fa-2x' />
                </label>
                <input type="hidden" name="id" value={img.id} />
                <input type="file" name="file" className="d-none" id={img.id} onChange={mudaarquivo}></input>
              </div>
              }
            </Col>
          )}
        </Row>
      )}
    </FalconLightBoxGallery>
  );
};

export default PicturesGallery;
