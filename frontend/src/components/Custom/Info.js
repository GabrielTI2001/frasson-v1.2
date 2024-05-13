import React from 'react';
import Flex from '../common/Flex';

const Info = ({title, description }) => (
  <Flex alignItems="center" className="position-relative mb-2">
    <div>
      <h6 className="fs-0 mb-0">
        {title &&
        <span className="fw-bold" style={{fontSize: '12px'}}>
          {title}
        </span>
        }
      </h6>
      <p className="mb-1 mt-1" style={{fontSize: '12px'}}>{description}</p>
    </div>
  </Flex>
);

export default Info;
