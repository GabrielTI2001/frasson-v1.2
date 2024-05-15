import React from 'react';
import Flex from '../common/Flex';

const Info = ({title, description }) => (
  <Flex alignItems="center" className="position-relative mb-2">
    <div>
      <h6 className="fs-0 mb-1">
        {title &&
        <span className="fw-bold" style={{fontSize: '12px'}}>
          {title}
        </span>
        }
      </h6>
      <span className="mb-1 mt-1" style={{fontSize: '12px'}}>{description}</span>
    </div>
  </Flex>
);

export default Info;
