import React, { useState } from 'react';
import './SearchBar.css';
import Card from './Card';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hotelsData, setHotelsData] = useState([]);


  const locations = ['New York City','Houston','Los Angeles','Chicago','Philadelphia','San Antonio','San Diego','Phoenix','Dallas','San Jose','Jacksonville','Austin','San Francisco','Indianapolis','Charlotte','Detroit','Columbus','Fort Worth','El Paso','Memphis','Seattle','Boston','Baltimore','Denver','Washington DC'];
  
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLocationClick = (location) => {
    setSearchTerm(location);
    setShowDropdown(false);
  };

  const handleSearchButtonClick = () => {
    console.log("Search Term:", searchTerm);

    fetch(`http://127.0.0.1:8000/location?location=${searchTerm}`)
      .then(response => response.json())
      .then(data => {
        setHotelsData(data);
        console.log("Response from server:", data);
      })
      .catch(error => {
        console.error("Error:", error);
      });

    setSearchTerm('');
  };

  return (
    <div className="search-bar-container">
      <h1 className='title'>Top Best Hotel</h1>

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

        {showDropdown && (
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
        )}
      </div>

      {hotelsData.length > 0 && (
        <div className='card-container'>
          <div className="card-row">
            {hotelsData.map((hotel, index) => (
              <Card key={index} hotel={hotel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;