import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';
import logo from '../assets/logo.png'; // Import the new logo


const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <img src={logo} alt="Asset Manager Logo" className="login-logo" onError={(e) => console.log('Logo failed to load:', e)} />
        
        <h1>Asset Manager</h1>
        <p>Please choose an option to proceed:</p>
        <div className="home-buttons">
          <Link to="/login" className="home-button">Login</Link>
          <Link to="/register" className="home-button">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;