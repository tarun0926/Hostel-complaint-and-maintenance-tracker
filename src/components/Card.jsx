import React from 'react';
import './Card.css';

const Card = ({ children, className = '', title, action, hover = false }) => {
  return (
    <div className={`glass card ${hover ? 'card-hover' : ''} ${className}`}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
