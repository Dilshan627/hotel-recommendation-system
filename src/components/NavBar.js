import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/">Location</Link>
        </li>
        <li>
          <Link to="/">Best Hotel</Link>
        </li>
        <li>
          <Link to="/">Best Service</Link>
        </li>
        <li>
          <Link to="/">Contact</Link>
        </li>
        <li>
          <Link to="/">Account</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
