import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import logo from '../assets/logo.png';

const HodDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, departmentid, token, username } = location.state || { userType: 'unknown', departmentid: null, token: null, username: '' };
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState({ hods: [], users: [] });
  const [requests, setRequests] = useState([]);
  const [issueReports, setIssueReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showAssignAssetPopup, setShowAssignAssetPopup] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [rejectionComments, setRejectionComments] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('HodDashboard loaded with:', { userType, departmentid, token, username });
    if (!token) {
      setError('No authentication token. Please log in again.');
      return;
    }
    if (userType !== 'hod') {
      setError('Unauthorized access. Only HODs can view this dashboard.');
      return;
    }
    fetchAssets().catch((err) => setError(`Assets fetch failed: ${err.message}`));
    fetchUsers().catch((err) => setError(`Users fetch failed: ${err.message}`));
    fetchNotifications().catch((err) => setError(`Notifications fetch failed: ${err.message}`));
  }, [userType, departmentid, token, username]);

  const fetchAssets = async () => {
    try {
      console.log('Fetching assets with token:', token);
      const response = await fetch(`http://localhost:5000/api/assets?departmentid=${departmentid}`, {
        headers: { 'x-auth-token': token },
      });
      console.log('Assets response:', response.status);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Assets fetch error:', error);
      setError(error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with token:', token);
      const response = await fetch(`http://localhost:5000/api/all-users?departmentid=${departmentid}`, {
        headers: { 'x-auth-token': token },
      });
      console.log('Users response:', response.status);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Users fetch error:', error);
      setError(error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      if (!departmentid) {
        throw new Error('Department ID is missing');
      }
      console.log('Fetching requests with token:', token, 'and departmentid:', departmentid);
      const response = await fetch(`http://localhost:5000/api/asset-requests?departmentid=${departmentid}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });
      console.log('Requests response:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }
      const data = await response.json();
      console.log('Fetched requests:', data);
      setRequests(data);
    } catch (error) {
      console.error('Requests fetch error:', error);
      setError(`Failed to fetch requests: ${error.message}`);
    }
  };

  const fetchIssueReports = async () => {
    try {
      console.log('Fetching issue reports with token:', token, 'and departmentid:', departmentid);
      const response = await fetch(`http://localhost:5000/api/issue-reports?departmentid=${departmentid}`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setIssueReports(data);
    } catch (error) {
      console.error('Issue reports fetch error:', error);
      setError(error.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications with token:', token);
      const response = await fetch(`http://localhost:5000/api/notifications?departmentid=${departmentid}`, {
        headers: { 'x-auth-token': token },
      });
      console.log('Notifications response:', response.status);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Notifications fetch error:', error);
      setError(error.message);
    }
  };

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedAsset) {
      alert('Please select a user and an asset');
      return;
    }
    try {
      const updatedAsset = { ...selectedAsset, status: 'Assigned' };
      const assetResponse = await fetch(`http://localhost:5000/api/assets/${selectedAsset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(updatedAsset),
      });
      if (!assetResponse.ok) throw new Error(`HTTP error! Status: ${assetResponse.status}`);

      const assignResponse = await fetch('http://localhost:5000/api/assign-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ userId: selectedUser._id, assetCode: selectedAsset.assetCode }),
      });
      if (!assignResponse.ok) throw new Error(`HTTP error! Status: ${assignResponse.status}`);
      alert('Asset assigned successfully!');
      setShowAssignAssetPopup(false);
      setSelectedUser(null);
      setSelectedAsset(null);
      fetchAssets();
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRemoveAssignment = async (user) => {
    if (!user.assignedAsset) {
      alert('No asset assigned to remove');
      return;
    }
    try {
      const asset = assets.find((a) => a.assetCode === user.assignedAsset);
      if (!asset) throw new Error('Asset not found');

      const updatedAsset = { ...asset, status: 'Available' };
      const assetResponse = await fetch(`http://localhost:5000/api/assets/${asset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(updatedAsset),
      });
      if (!assetResponse.ok) throw new Error(`HTTP error! Status: ${assetResponse.status}`);

      const removeResponse = await fetch('http://localhost:5000/api/assign-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ userId: user._id, assetCode: null }),
      });
      if (!removeResponse.ok) throw new Error(`HTTP error! Status: ${removeResponse.status}`);
      alert('Asset assignment removed successfully!');
      fetchAssets();
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      const response = await fetch(`http://localhost:5000/api/asset-requests/${request._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'HOD Approved' }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      alert('Request approved and forwarded to admin!');
      fetchRequests();
      fetchNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRejectRequest = async (request) => {
    if (!rejectionComments) {
      alert('Please provide comments for rejection');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/asset-requests/${request._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'HOD Rejected', rejectionComments }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      alert('Request rejected and user notified!');
      setRejectionComments('');
      fetchRequests();
      fetchNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleApproveIssueReport = async (report) => {
    try {
      const response = await fetch(`http://localhost:5000/api/issue-reports/${report._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'HOD Approved' }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const notification = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          username: report.username,
          message: `Your issue report for asset ${report.assetCode} has been approved by HOD and forwarded to admin.`,
        }),
      });
      if (!notification.ok) throw new Error(`Notification failed: ${notification.status}`);
      alert('Issue report approved and forwarded to admin!');
      fetchIssueReports();
      fetchNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRejectIssueReport = async (report) => {
    if (!rejectionComments) {
      alert('Please provide comments for rejection');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/issue-reports/${report._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'Rejected', rejectionComments }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const notification = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          username: report.username,
          message: `Your issue report for asset ${report.assetCode} was rejected by HOD. Reason: ${rejectionComments}`,
        }),
      });
      if (!notification.ok) throw new Error(`Notification failed: ${notification.status}`);
      alert('Issue report rejected and user notified!');
      setRejectionComments('');
      fetchIssueReports();
      fetchNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  const handleSidebarClick = (section) => {
    setActiveSection(section);
    if (section === 'assets') setShowAssetDetails(true);
    else if (section === 'users') setShowAssetDetails(false);
    else if (section === 'requests') {
      setShowRequests(true);
      fetchRequests().catch((err) => setError(`Requests fetch failed: ${err.message}`));
    } else if (section === 'reports') {
      setShowReports(true);
      fetchIssueReports().catch((err) => setError(`Reports fetch failed: ${err.message}`));
    } else if (section === 'notifications') {
      fetchNotifications().catch((err) => setError(`Notifications fetch failed: ${err.message}`));
    } else {
      setShowAssetDetails(false);
      setShowRequests(false);
      setShowReports(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowAssignAssetPopup(true);
  };

  if (error) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="logo-container">
            <img src={logo} alt="Asset Manager Logo" className="dashboard-logo" onError={(e) => console.log('Logo error:', e)} />
          </div>
          <div className="header-center">
            <h1>Asset Manager</h1>
            <p className="tagline">Smart way to track your Assets</p>
          </div>
          <div className="header-right">
            <input type="text" placeholder="Search..." className="search-bar" />
            <div className="user-profile" onClick={goHome}>👤 {username}</div>
          </div>
        </header>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="Asset Manager Logo" className="dashboard-logo" onError={(e) => console.log('Logo error:', e)} />
        </div>
        <div className="header-center">
          <h1>Asset Manager</h1>
          <p className="tagline">Smart way to track your Assets</p>
        </div>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="user-profile" onClick={goHome}>👤 {username}</div>
        </div>
      </header>
      <div className="dashboard-content">
        <aside className="sidebar">
          <button className={`home-button ${activeSection === 'home' ? 'active' : ''}`} onClick={() => handleSidebarClick('home')}>
            <span className="home-icon">🏠</span> Home
          </button>
          <nav>
            <button className={`sidebar-button ${activeSection === 'assets' ? 'active' : ''}`} onClick={() => handleSidebarClick('assets')}>
              <span className="icon">📋</span> Asset Details
            </button>
            <button className={`sidebar-button ${activeSection === 'users' ? 'active' : ''}`} onClick={() => handleSidebarClick('users')}>
              <span className="icon">👥</span> Users
            </button>
            <button className={`sidebar-button ${activeSection === 'requests' ? 'active' : ''}`} onClick={() => handleSidebarClick('requests')}>
              <span className="icon">📥</span> User Requests
            </button>
            <button className={`sidebar-button ${activeSection === 'reports' ? 'active' : ''}`} onClick={() => handleSidebarClick('reports')}>
              <span className="icon">📊</span> Issue Reports
            </button>
            <button className={`sidebar-button ${activeSection === 'maintenance' ? 'active' : ''}`} onClick={() => handleSidebarClick('maintenance')}>
              <span className="icon">🔧</span> Maintenance
            </button>
            <button className={`sidebar-button ${activeSection === 'notifications' ? 'active' : ''}`} onClick={() => handleSidebarClick('notifications')}>
              <span className="icon">🔔</span> Notifications
            </button>
          </nav>
        </aside>
        <main className="main-content">
          {showAssetDetails && activeSection === 'assets' && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setShowAssetDetails(false)}>⬅</span>
                <h2>Assets Details</h2>
              </div>
              {assets.length > 0 ? (
                <div className="assets-grid">
                  {assets.map((asset) => (
                    <div key={asset._id} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <h3>{asset.name}</h3>
                      <p>Asset Code: {asset.assetCode}</p>
                      <p>Status: {asset.status}</p>
                      {asset.qrCode && <img src={`http://localhost:5000${asset.qrCode}`} alt="QR Code" style={{ width: '100px' }} />}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No assets found.</p>
              )}
            </div>
          )}
          {activeSection === 'users' && !showAssetDetails && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setActiveSection('home')}>⬅</span>
                <h2>Users</h2>
              </div>
              {users.users.length > 0 ? (
                <div className="assets-grid">
                  {users.users.map((user) => (
                    <div key={user._id} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <h3>{user.username}</h3>
                      <p>Email: {user.email}</p>
                      <p>Role: {user.role}</p>
                      <p>Department: {user.departmentname || 'N/A'}</p>
                      <p>Assigned Asset: {user.assignedAsset || 'None'}</p>
                      <button className="assign-button" onClick={() => handleUserClick(user)}>
                        Assign Asset
                      </button>
                      {user.assignedAsset && (
                        <button className="remove-button" onClick={() => handleRemoveAssignment(user)}>
                          Remove Assignment
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No users found.</p>
              )}
            </div>
          )}
          {activeSection === 'requests' && showRequests && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setShowRequests(false)}>⬅</span>
                <h2>User Requests</h2>
              </div>
              {requests.length > 0 ? (
                <div className="assets-grid">
                  {requests.map((request) => (
                    <div key={request._id} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <h3>User: {request.username}</h3>
                      <p>Requested Asset: {request.assetCode}</p>
                      <p>Status: {request.status || 'Pending'}</p>
                      {request.status === 'Pending' && (
                        <>
                          <button className="approve-button" onClick={() => handleApproveRequest(request)}>
                            Approve
                          </button>
                          <div className="input-group">
                            <label htmlFor={`rejectionComments-${request._id}`}>Rejection Comments</label>
                            <textarea
                              id={`rejectionComments-${request._id}`}
                              value={rejectionComments}
                              onChange={(e) => setRejectionComments(e.target.value)}
                              placeholder="Enter reason for rejection"
                            />
                          </div>
                          <button className="reject-button" onClick={() => handleRejectRequest(request)}>
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'HOD Rejected' && <p>Rejection Comments: {request.rejectionComments}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No requests found.</p>
              )}
            </div>
          )}
          {activeSection === 'reports' && showReports && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setShowReports(false)}>⬅</span>
                <h2>Issue Reports</h2>
              </div>
              {issueReports.length > 0 ? (
                <div className="assets-grid">
                  {issueReports.map((report) => (
                    <div key={report._id} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <h3>User: {report.username}</h3>
                      <p>Asset Code: {report.assetCode}</p>
                      <p>Issue: {report.message}</p>
                      <p>Status: {report.status || 'Pending'}</p>
                      {report.status === 'Pending' && (
                        <>
                          <button className="approve-button" onClick={() => handleApproveIssueReport(report)}>
                            Approve
                          </button>
                          <div className="input-group">
                            <label htmlFor={`rejectionComments-${report._id}`}>Rejection Comments</label>
                            <textarea
                              id={`rejectionComments-${report._id}`}
                              value={rejectionComments}
                              onChange={(e) => setRejectionComments(e.target.value)}
                              placeholder="Enter reason for rejection"
                            />
                          </div>
                          <button className="reject-button" onClick={() => handleRejectIssueReport(report)}>
                            Reject
                          </button>
                        </>
                      )}
                      {report.status === 'Rejected' && <p>Rejection Comments: {report.rejectionComments}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No issue reports found.</p>
              )}
            </div>
          )}
          {activeSection === 'notifications' && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setActiveSection('home')}>⬅</span>
                <h2>Notifications</h2>
              </div>
              {notifications.length > 0 ? (
                <div className="assets-grid">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <h3>{notification.message}</h3>
                      <p>From: {notification.fromUser || 'System'}</p>
                      <p>Date: {new Date(notification.createdAt || notification.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No notifications found.</p>
              )}
            </div>
          )}
          {!showAssetDetails &&
            activeSection !== 'assets' &&
            activeSection !== 'users' &&
            activeSection !== 'requests' &&
            activeSection !== 'reports' &&
            activeSection !== 'notifications' && (
              <p>Select an option from the sidebar to view or manage content.</p>
            )}
          {showAssignAssetPopup && selectedUser && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="popup-header">
                  <span className="back-arrow" onClick={() => setShowAssignAssetPopup(false)}>⬅</span>
                  <h2>Assign Asset to {selectedUser.username}</h2>
                </div>
                <form onSubmit={handleAssignAsset}>
                  <div className="input-group">
                    <label htmlFor="assetSelect">Select Asset</label>
                    <select
                      id="assetSelect"
                      value={selectedAsset ? selectedAsset.assetCode : ''}
                      onChange={(e) => {
                        const asset = assets.find((a) => a.assetCode === e.target.value);
                        setSelectedAsset(asset);
                      }}
                      required
                    >
                      <option value="">Select an asset...</option>
                      {assets
                        .filter((asset) => asset.status === 'Available')
                        .map((asset) => (
                          <option key={asset._id} value={asset.assetCode}>
                            {asset.name} ({asset.assetCode})
                          </option>
                        ))}
                    </select>
                  </div>
                  <button type="submit" className="submit-button">Assign</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HodDashboard;