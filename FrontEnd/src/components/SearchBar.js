import React, { useState } from 'react';
import './SearchBar.css';
import Card from './Card';
import { getHotel } from './Request';

const Dropdown = ({ locations, handleLocationClick }) => (
  <div className="dropdown-outside">
    <div className="dropdown">
      {locations.length > 0 ? (
        <ul>
          {locations.map((location, index) => (
            <li
              key={index}
              className="dropdown-item"
              onClick={() => handleLocationClick(location)}
            >
              {location}
            </li>
          ))}
        </ul>
      ) : (
        <p>No locations found</p>
      )}
    </div>
  </div>
);

const Introduction = () => (
  <p className='introduction'>
    Introducing an innovative AI solution that revolutionizes the way we choose lodging facilities post-travel – a comprehensive platform that seamlessly analyzes both reviews and prices to deliver unparalleled recommendations. Say goodbye to the tedious process of sifting through endless options; our intelligent system intelligently evaluates user reviews and compares prices to ensure you find the perfect accommodation in any given area ...
  </p>
);

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hotelsData, setHotelsData] = useState([]);
  const locations = ['New York City', 'Houston', 'Los Angeles', 'Chicago', 'Philadelphia', 'San Antonio', 'San Diego', 'Phoenix', 'Dallas', 'San Jose', 'Jacksonville', 'Austin', 'San Francisco', 'Indianapolis', 'Charlotte', 'Detroit', 'Columbus', 'Fort Worth', 'El Paso', 'Memphis', 'Seattle', 'Boston', 'Baltimore', 'Denver', 'Washington DC'];

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLocationClick = (location) => {
    setSearchTerm(location);
    setShowDropdown(false);
  };

  const handleSearchButtonClick = async () => {
    console.log("Search Term:", searchTerm);

    try {
      const hotelData = await Promise.race([
        getHotel(searchTerm),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 90000))
      ]);
      console.log('Hotel Data:', hotelData);
      setHotelsData(hotelData);
    } catch (error) {
      console.error('Error:', error.message);
    }

    setSearchTerm('');
  };

  return (
    <div className="search-bar-container">
      <h1 className='title'>Best Hotel</h1>

      <div className='test'>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Travel location"
            className="search-input"
            value={searchTerm}
            onChange={handleInputChange}
            onClick={() => setShowDropdown(true)}
          />
          <button className="search-button" onClick={handleSearchButtonClick}>
            Search
          </button>
        </div>

        {showDropdown && <Dropdown locations={locations} handleLocationClick={handleLocationClick} />}
      </div>

      {hotelsData.length > 0 ? (
        <div className='card-container'>
          <div className="card-row">
            {hotelsData.map((hotel, index) => (
              <Card key={index} hotel={hotel} />
            ))}
          </div>
        </div>
      ) : (
        <Introduction />
      )}
    </div>
  );
};

export default SearchBar;
