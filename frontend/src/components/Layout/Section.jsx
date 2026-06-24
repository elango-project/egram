import React from 'react';

const Section = ({ 
  children, 
  className = '', 
  id,
  dark = false,
  padding = 'py-16 md:py-24' 
}) => {
  return (
    <section 
      id={id} 
      className={`relative w-full ${dark ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-900'} ${padding} ${className}`}
    >
      {children}
    </section>
  );
};

export default Section;
