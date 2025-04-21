import React, { useState } from 'react';
import '../css/Register.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import the new logo

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    departmentid: '',
    departmentname: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    const dataToSend = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      userType: formData.userType,
      departmentid: formData.departmentid,
      departmentname: formData.departmentname,
    };
    console.log('Sending registration data:', dataToSend);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      console.log('API response:', result);
      if (response.ok) {
        alert(`Registration successful as ${formData.userType}! Your details have been saved.`);
        setFormData({
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          userType: 'user',
          departmentid: '',
          departmentname: '',
        });
      } else {
        alert(`Registration failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('An error occurred while registering.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <img src={logo} alt="Asset Manager Logo" className="register-logo" onError={(e) => console.log('Logo failed to load:', e)} />
          <h1>Asset Manager</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="userType">Register as</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="hod">HOD</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="departmentid">Department ID</label>
            <input
              type="text"
              id="departmentid"
              name="departmentid"
              value={formData.departmentid}
              onChange={handleChange}
              placeholder="Enter department ID"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="departmentname">Department Name</label>
            <input
              type="text"
              id="departmentname"
              name="departmentname"
              value={formData.departmentname}
              onChange={handleChange}
              placeholder="Enter department name"
              required
            />
          </div>
          <button type="submit" className="action-button">Sign Up</button>
        </form>
        <div className="extra-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;