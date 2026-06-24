import React from 'react';

const Container = ({ 
  children, 
  className = '', 
  size = 'lg' 
}) => {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[96rem]',
    full: 'max-w-full'
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
