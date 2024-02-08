import React from 'react';
import './Card.css';

const Card = ({ hotel }) => {
  return (
    <div className="card">
      <h2>{hotel.name}</h2>
      {hotel.phone && <p>Phone: {hotel.phone}</p>}
      {hotel.details && <p>Details: {hotel.details}</p>}
      
      {hotel.address && (
        <div>
          <p>Address:</p>
          <p>{hotel.address['street-address']}</p>
          <p>{hotel.address.locality}, {hotel.address.region} {hotel.address['postal-code']}</p>
        </div>
      )}

      <p>Type: {hotel.type}</p>
      
      {hotel.url && (
        <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="visit-button">
          Visit Site
        </a>
      )}
    </div>
  );
};

export default Card;
