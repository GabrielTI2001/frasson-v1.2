import React from 'react';
import PropTypes from 'prop-types';
import Flex from '../../components/common/Flex';
import classNames from 'classnames';

const ModalMediaContent = ({
  children,
  icon,
  transform,
  title,
  headingClass,
  headingContent,
  isHr = true
}) => {
  return (
    <Flex>
      <div className="flex-1">
        <Flex className={classNames('mb-2', headingClass)}>
          <h5 className="mb-0 fs--1 fw-bold">{title}</h5>
          {headingContent && headingContent}
        </Flex>
        {children}
        {isHr && <hr className="my-4" />}
      </div>
    </Flex>
  );
};

ModalMediaContent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  headingClass: PropTypes.string,
  headingContent: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  transform: PropTypes.string,
  isHr: PropTypes.bool
};

export default ModalMediaContent;
