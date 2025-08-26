import React from 'react';

export default function Container({ className, children }) {
  return (
    <div className={`w-full lg:w-[1240px] mx-auto ${className}`}>
      {children}
    </div>
  );
}
