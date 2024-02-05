import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  
import SearchDashboard from './components/SearchBar';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
// import Map from './components/Map';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <NavBar />
          <Routes>
            <Route path="/" element={<SearchDashboard />} />
            <Route path="/search" element={<SearchDashboard />} />
          </Routes>
        </div>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
