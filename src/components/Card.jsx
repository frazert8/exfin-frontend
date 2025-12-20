import React from 'react';

const Card = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}>
    <div className={noPadding ? "" : "p-6"}>{children}</div>
  </div>
);

export default Card;
