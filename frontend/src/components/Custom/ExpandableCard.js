import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { faAnglesDown, faAnglesUp, faArrowUpRightFromSquare, faTrashCan, faX} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppContext } from '../../Main';

const ExpandableCard = ({ data, attr1, attr2, className, url, children, footer, clickdelete, title, auto, close, header}) => {
  const {config: {theme}} = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const toggleExpand = () => {
    if (!isExpanded){
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (auto){
      toggleExpand()
    }
  }, [])

  return (
    <div className={`mb-2 mt-1 shadow-none info-pipe fs--1 expandable-card ${isExpanded ? 'expanded' : ''} 
    ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
      <Card.Body className='p-3 py-2'>
        <div className={`d-flex justify-content-between px-0`}>
          {header && header}
          {(attr1 || title) && <label className='fw-bold fs--1 mb-2'>{attr1 ? data[attr1] : title}</label>}
          <div>
            {!auto ?
              <Button variant='100' className="toggle-button shadow-none py-0 px-1 me-1" onClick={toggleExpand}>
                <FontAwesomeIcon icon={isExpanded ? faAnglesUp : faAnglesDown} />
              </Button>
            :
              <Button className='p-0 px-1 shadow-none' variant='100' onClick={close}>
                <FontAwesomeIcon icon={faX} />
              </Button>
            }
            {url && 
              <Button variant="100" className="toggle-button shadow-none py-0 px-1 me-1">
                <Link to={`/${url}/${data.uuid}`} target="__blank">
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-600'/>
                </Link>
              </Button>
            }
            {data && isExpanded && clickdelete &&
              <Button onClick={clickdelete} className='toggle-button shadow-none py-0 px-1' variant="falcon-default">
                <FontAwesomeIcon icon={faTrashCan} className='fs--1' />
              </Button>
            }
          </div>
        </div>
        {attr2 &&
          <div className="d-flex justify-content-between px-0">
            <label className='fs--1 mb-0 fw-normal mb-0'>{data[attr2]}</label>
          </div>
        }
        <div className='mt-0'>
          <span className='fs--2 text-600'>
            {footer}
          </span>
        </div>
        <div className="detailed-info">
          {loading ? <div className='text-center'><Spinner/></div> : children}
        </div>
      </Card.Body>
    </div>
  );
};

export default ExpandableCard;