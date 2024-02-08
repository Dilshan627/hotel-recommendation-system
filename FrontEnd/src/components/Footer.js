// Footer.js

import React, { useState } from 'react';
import './Footer.css'; // Import the CSS file for styling

const Footer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const handleSend = () => {
    console.log('Sending:', { name, email, note });
  };

  return (
    <footer className="footer-container">
      <div className="footer-section">
        <h3>Contact Information</h3>
        <p>Best Hotel</p>
        <p>123 Main Street</p>
        <p>City, Country</p>
        <p>Phone: +1 123-456-7890</p>
        <p>Email: info@besthotel.com</p>
      </div>
      <div className="footer-section">
        <h3>Contact Us</h3>
        <input
          className="input-field"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-field"
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          className="input-field"
          placeholder="Your Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </footer>
  );
};

export default Footer;
