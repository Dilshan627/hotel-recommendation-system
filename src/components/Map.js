// src/components/GoogleMapIframe.js

import React from 'react';

const Map = () => {
  return (
    <iframe
      title="Google Map"
      src="https://www.google.com/maps/d/embed?mid=1H1ADd1djKllgjsCH1zUtYLqyS8JTDK4&amp;z=7&amp;ehbc=00FFFFFF"
      width="100%"
      height="550px"
      frameBorder="0"
      style={{ border: '0' }}
      allowFullScreen
    ></iframe>
  );
};

export default Map;
