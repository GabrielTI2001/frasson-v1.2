import React, { useState } from 'react';

const PaginationList = ({ items, initialVisibleCount, incrementCount, children }) => {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const handleReadMore = () => {
    setVisibleCount(prevCount => prevCount + incrementCount);
  };

  return (
    <>
        {items.slice(0, visibleCount).map((item, index) => (
            <div key={index}>
                {React.cloneElement(children, { item })}
            </div>
        ))}
        {visibleCount < items.length && (
            <span onClick={handleReadMore} className='text-primary fs--1 cursor-pointer'>+ Ver Mais</span>
        )}
    </>
  );
};

export default PaginationList;