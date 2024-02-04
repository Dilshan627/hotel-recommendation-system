import React from 'react';
import './App.css';
import SearchDashboard from './components/SearchBar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <SearchDashboard />
      <Footer/>
    </div>
  );
}

export default App;