/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';

const AdvanceTableSearchBox = ({
  onSearch,
  globalFilter,
  setGlobalFilter,
  placeholder = 'Search...',
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    if (value !== ''){
      onSearch(value); 
    }
  };


  return (
    <InputGroup className={classNames(className, 'position-relative')}>
      <FormControl
        value={searchTerm || ''}
        onChange={handleChange}
        size="sm"
        id="search"
        placeholder={placeholder}
        type="search"
        className="shadow-none"
      />
      <Button
        size="xl"
        variant="outline-secondary"
        className="border-300 hover-border-secondary cursor-normal"
        disabled={true}
      >
        <FontAwesomeIcon icon={faSearch} className="fs--1" />
      </Button>
    </InputGroup>
  );
};

export default AdvanceTableSearchBox;
