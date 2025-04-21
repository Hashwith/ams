import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import logo from '../assets/logo.png';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, departmentid, token, username } = location.state || { userType: 'unknown', departmentid: null, token: null, username: '' };
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState({ hods: [], users: [] });
  const [requests, setRequests] = useState([]);
  const [issueReports, setIssueReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showAddAssetPopup, setShowAddAssetPopup] = useState(false);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [showAssignAssetPopup, setShowAssignAssetPopup] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [newAsset, setNewAsset] = useState({ name: '', type: '', brand: '', model: '', dateOfBuying: '', status: 'Available', departmentid: departmentid || '' });
  const [newUser, setNewUser] = useState({ email: '', username: '', password: '', role: 'user', departmentid: departmentid || '', departmentname: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [rejectionComments, setRejectionComments] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AdminDashboard loaded with:', { userType, departmentid, token, username });
    if (!token) {
      setError('No authentication token. Please log in again.');
      return;
    }
    if (userType !== 'admin') {
      setError('Unauthorized access. Only admins can view this dashboard.');
      return;
    }
    fetchAssets().catch(setError);
    fetchUsers().catch(setError);
    fetchRequests().catch(setError);
    fetchIssueReports().catch(setError);
    fetchNotifications().catch(setError);
  }, [userType, departmentid, token, username]);

  const fetchAssets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/assets', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched Assets:', data);
      setAssets(data);
    } catch (error) {
      console.error('Assets fetch error:', error);
      setError(error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/all-users', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched Users:', data);
      setUsers(data);
      return data;
    } catch (error) {
      console.error('Users fetch error:', error);
      setError(error.message);
      return null;
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/asset-requests?status=HOD%20Approved', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched Requests:', data);
      setRequests(data);
    } catch (error) {
      console.error('Requests fetch error:', error);
      setError(error.message);
    }
  };

  const fetchIssueReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/issue-reports?status=HOD%20Approved', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched Issue Reports:', data);
      setIssueReports(data);
    } catch (error) {
      console.error('Issue Reports fetch error:', error);
      setError(error.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched Notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Notifications fetch error:', error);
      setError(error.message);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newAsset),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      alert(`Asset added successfully! QR Code: ${result.asset.qrCode}`);
      setNewAsset({ name: '', type: '', brand: '', model: '', dateOfBuying: '', status: 'Available', departmentid: departmentid || '' });
      setShowAddAssetPopup(false);
      fetchAssets();
    } catch (error) {
      console.error('Add asset error:', error);
      setError(error.message);
      alert(`Failed to add asset: ${error.message}`);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error! Status: ${response.status}`);
      }
      alert(`User added successfully! Credentials: Username: ${newUser.username}, Password: ${newUser.password}`);
      setNewUser({ email: '', username: '', password: '', role: 'user', departmentid: departmentid || '', departmentname: '' });
      setShowAddUserPopup(false);
      fetchUsers();
    } catch (error) {
      console.error('Add user error:', error);
      setError(error.message);
      alert(`Failed to add user: ${error.message}`);
    }
  };

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedAsset) {
      alert('Please select a user and an asset');
      return;
    }
    try {
      const assignPayload = {
        userId: selectedUser._id,
        assetCode: selectedAsset.assetCode,
        assetName: selectedAsset.name,
        assetModel: selectedAsset.model,
        assetId: selectedAsset._id,
      };
      console.log('Assign Asset Payload:', JSON.stringify(assignPayload, null, 2));
      const assignResponse = await fetch('http://localhost:5000/api/assign-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(assignPayload),
      });
      if (!assignResponse.ok) {
        const assignError = await assignResponse.json();
        throw new Error(`Assign asset failed: ${assignError.msg || assignResponse.statusText}`);
      }
      alert('Asset assigned successfully!');
      setShowAssignAssetPopup(false);
      setSelectedUser(null);
      setSelectedAsset(null);
      fetchAssets();
      fetchUsers();
    } catch (error) {
      console.error('Assign asset error:', error);
      setError(error.message);
      alert(`Failed to assign asset: ${error.message}`);
      fetchAssets();
    }
  };

  const handleRemoveAssignment = async (user) => {
    if (!user.assignedAsset) {
      alert('No asset assigned to remove');
      return;
    }
    try {
      const removeResponse = await fetch('http://localhost:5000/api/assign-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          userId: user._id,
          assetCode: null,
          assetName: null,
          assetModel: null,
          assetId: null,
        }),
      });
      if (!removeResponse.ok) {
        const removeError = await removeResponse.json();
        throw new Error(`Remove assignment failed: ${removeError.msg || removeResponse.statusText}`);
      }
      alert('Asset assignment removed successfully!');
      fetchAssets();
      fetchUsers();
    } catch (error) {
      console.error('Remove assignment error:', error);
      setError(error.message);
      alert(`Failed to remove assignment: ${error.message}`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.username}?`)) return;
    try {
      if (user.assignedAsset) {
        await handleRemoveAssignment(user);
      }
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete user');
      }
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      setError(error.message);
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Are you sure you want to delete asset ${asset.name} (${asset.assetCode})?`)) return;
    try {
      if (asset.status === 'Assigned') {
        alert('Cannot delete an assigned asset. Please unassign it first.');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/assets/${asset._id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete asset');
      }
      alert('Asset deleted successfully!');
      fetchAssets();
    } catch (error) {
      console.error('Delete asset error:', error);
      setError(error.message);
      alert(`Failed to delete asset: ${error.message}`);
    }
  };

  const handleApproveRequest = async (request) => {
    if (!request.assetCode || !request.userId) {
      alert('Invalid request data');
      return;
    }
    try {
      const asset = assets.find((a) => a.assetCode === request.assetCode);
      if (!asset || asset.status !== 'Available') throw new Error('Asset not available');
      const user = [...users.hods, ...users.users].find((u) => u._id === request.userId);
      if (!user) throw new Error('User not found');
      const assignPayload = {
        userId: user._id,
        assetCode: asset.assetCode,
        assetName: asset.name,
        assetModel: asset.model,
        assetId: asset._id,
      };
      console.log('Approving Request, Assign Payload:', assignPayload);
      const assignResponse = await fetch('http://localhost:5000/api/assign-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(assignPayload),
      });
      if (!assignResponse.ok) {
        const assignError = await assignResponse.json();
        throw new Error(`Assign asset failed: ${assignError.msg || assignResponse.statusText}`);
      }
      const updateResponse = await fetch(`http://localhost:5000/api/asset-requests/${request._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'Admin Approved' }),
      });
      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        throw new Error(`Update request failed: ${updateError.msg || updateResponse.statusText}`);
      }
      alert('Request approved and asset assigned!');
      fetchRequests();
      fetchAssets();
      fetchUsers();
      fetchNotifications();
    } catch (error) {
      console.error('Approve request error:', error);
      setError(error.message);
      alert(`Failed to approve request: ${error.message}`);
    }
  };

  const handleRejectRequest = async (request) => {
    if (!rejectionComments) {
      alert('Please provide rejection comments');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/asset-requests/${request._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'Admin Rejected', rejectionComments }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to reject request');
      }
      alert('Request rejected!');
      setRejectionComments('');
      fetchRequests();
      fetchNotifications();
    } catch (error) {
      console.error('Reject request error:', error);
      setError(error.message);
      alert(`Failed to reject request: ${error.message}`);
    }
  };

  const handleApproveIssueReport = async (report) => {
    try {
      const response = await fetch(`http://localhost:5000/api/issue-reports/${report._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'Approved' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to approve issue report');
      }
      const notificationResponse = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          username: report.username,
          message: `Your issue report for asset ${report.assetCode} has been approved. It will be resolved soon.`,
        }),
      });
      if (!notificationResponse.ok) {
        console.warn('Failed to send notification:', await notificationResponse.json());
      }
      alert('Issue report approved successfully!');
      fetchIssueReports();
      fetchNotifications();
    } catch (error) {
      console.error('Approve issue report error:', error);
      setError(error.message);
      alert(`Failed to approve issue report: ${error.message}`);
    }
  };

  const handleRejectIssueReport = async (report) => {
    if (!rejectionComments) {
      alert('Please provide rejection comments');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/issue-reports/${report._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: 'Rejected', rejectionComments }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to reject issue report');
      }
      const notificationResponse = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          username: report.username,
          message: `Your issue report for asset ${report.assetCode} was rejected. Reason: ${rejectionComments}`,
        }),
      });
      if (!notificationResponse.ok) {
        console.warn('Failed to send notification:', await notificationResponse.json());
      }
      alert('Issue report rejected successfully!');
      setRejectionComments('');
      fetchIssueReports();
      fetchNotifications();
    } catch (error) {
      console.error('Reject issue report error:', error);
      setError(error.message);
      alert(`Failed to reject issue report: ${error.message}`);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  const handleSidebarClick = (section) => {
    setActiveSection(section);
    setShowAssetDetails(section === 'assets');
    setShowRequests(section === 'requests');
    setShowReports(section === 'reports');
    setShowNotifications(section === 'notifications');
    if (section === 'reports') fetchIssueReports();
    if (section === 'notifications') fetchNotifications();
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    await fetchAssets();
    setShowAssignAssetPopup(true);
  };

  if (error) return <div className="error-message">Error: {error}</div>;

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
              <span className="icon">⚠️</span> Issue Reports
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
          {activeSection === 'home' && (
            <div className="assets-section">
              <h2>Admin Dashboard</h2>
              <p>Welcome, {username}! Manage assets, users, requests, and issue reports from the sidebar.</p>
            </div>
          )}

          {showAssetDetails && activeSection === 'assets' && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setShowAssetDetails(false)}>⬅</span>
                <h2>Assets Details</h2>
                <button className="add-button" onClick={() => setShowAddAssetPopup(true)}>ADD</button>
              </div>
              {assets.length > 0 ? (
                <div className="assets-grid">
                  {assets.map((asset) => (
                    <div key={asset._id} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <h3>{asset.name}</h3>
                      <p>Asset Code: {asset.assetCode}</p>
                      <p>Model: {asset.model}</p>
                      <p>Status: {asset.status}</p>
                      {asset.assignedTo && (
                        <>
                          <p>Assigned To: {asset.assignedTo.username}</p>
                          <p>User ID: {asset.assignedTo.userId}</p>
                        </>
                      )}
                      {asset.qrCode && <img src={`http://localhost:5000${asset.qrCode}`} alt="QR Code" style={{ width: '100px' }} />}
                      <button className="delete-button" onClick={() => handleDeleteAsset(asset)}>
                        Delete Asset
                      </button>
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
                <button className="add-button" onClick={() => setShowAddUserPopup(true)}>Add User</button>
              </div>
              {users.hods.length > 0 || users.users.length > 0 ? (
                <div className="assets-grid">
                  {[...users.hods, ...users.users].map((user) => (
                    <div key={user._id} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <h3>{user.username}</h3>
                      <p>Email: {user.email}</p>
                      <p>Role: {user.role}</p>
                      <p>Department: {user.departmentname || 'N/A'}</p>
                      <p>Assigned Asset: {user.assignedAsset || 'None'}</p>
                      <p>Asset Name: {user.assetName || 'N/A'}</p>
                      <p>Asset Model: {user.assetModel || 'N/A'}</p>
                      <button className="assign-button" onClick={() => handleUserClick(user)}>
                        Assign Asset
                      </button>
                      {user.assignedAsset && (
                        <button className="remove-button" onClick={() => handleRemoveAssignment(user)}>
                          Remove Asset
                        </button>
                      )}
                      <button className="delete-button" onClick={() => handleDeleteUser(user)}>
                        Delete User
                      </button>
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
                      <p>Timestamp: {new Date(request.timestamp).toLocaleString()}</p>
                      <button className="approve-button" onClick={() => handleApproveRequest(request)}>
                        Approve
                      </button>
                      <button className="reject-button" onClick={() => handleRejectRequest(request)}>
                        Reject
                      </button>
                      {request.status === 'HOD Approved' && (
                        <div className="input-group">
                          <label htmlFor={`rejectionComments-${request._id}`}>Rejection Comments</label>
                          <textarea
                            id={`rejectionComments-${request._id}`}
                            value={rejectionComments}
                            onChange={(e) => setRejectionComments(e.target.value)}
                            placeholder="Reason for rejection"
                          />
                        </div>
                      )}
                      {request.status === 'Admin Rejected' && (
                        <p><strong>Rejection Comments:</strong> {request.rejectionComments}</p>
                      )}
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
                      <p>Status: {report.status}</p>
                      <p>Timestamp: {new Date(report.timestamp).toLocaleString()}</p>
                      <button className="approve-button" onClick={() => handleApproveIssueReport(report)}>
                        Approve
                      </button>
                      <button className="reject-button" onClick={() => handleRejectIssueReport(report)}>
                        Reject
                      </button>
                      {report.status === 'HOD Approved' && (
                        <div className="input-group">
                          <label htmlFor={`rejectionComments-${report._id}`}>Rejection Comments</label>
                          <textarea
                            id={`rejectionComments-${report._id}`}
                            value={rejectionComments}
                            onChange={(e) => setRejectionComments(e.target.value)}
                            placeholder="Reason for rejection"
                          />
                        </div>
                      )}
                      {report.status === 'Rejected' && (
                        <p><strong>Rejection Comments:</strong> {report.rejectionComments}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No issue reports found.</p>
              )}
            </div>
          )}

          {activeSection === 'maintenance' && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setActiveSection('home')}>⬅</span>
                <h2>Maintenance</h2>
              </div>
              <p>Maintenance tracking is not yet implemented. View assets under maintenance in the Assets section.</p>
            </div>
          )}

          {activeSection === 'notifications' && showNotifications && (
            <div className="assets-section">
              <div className="section-header">
                <span className="back-arrow" onClick={() => setShowNotifications(false)}>⬅</span>
                <h2>Notifications</h2>
              </div>
              {notifications.length > 0 ? (
                <div className="assets-grid">
                  {notifications.map((notif, index) => (
                    <div key={index} className="asset-card">
                      <div className="asset-placeholder"></div>
                      <p>{notif.message}</p>
                      <p>Timestamp: {new Date(notif.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No notifications found.</p>
              )}
            </div>
          )}

          {showAddAssetPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="popup-header">
                  <span className="back-arrow" onClick={() => setShowAddAssetPopup(false)}>⬅</span>
                  <h2>Add Asset</h2>
                </div>
                <form onSubmit={handleAddAsset}>
                  <div className="input-group">
                    <label htmlFor="assetName">Asset Name</label>
                    <input
                      type="text"
                      id="assetName"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="assetType">Asset Type</label>
                    <input
                      type="text"
                      id="assetType"
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="assetBrand">Brand</label>
                    <input
                      type="text"
                      id="assetBrand"
                      value={newAsset.brand}
                      onChange={(e) => setNewAsset({ ...newAsset, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="assetModel">Model</label>
                    <input
                      type="text"
                      id="assetModel"
                      value={newAsset.model}
                      onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="dateOfBuying">Date of Buying</label>
                    <input
                      type="date"
                      id="dateOfBuying"
                      value={newAsset.dateOfBuying}
                      onChange={(e) => setNewAsset({ ...newAsset, dateOfBuying: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="assetStatus">Status</label>
                    <select
                      id="assetStatus"
                      value={newAsset.status}
                      onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="departmentid">Department ID</label>
                    <input
                      type="text"
                      id="departmentid"
                      value={newAsset.departmentid}
                      onChange={(e) => setNewAsset({ ...newAsset, departmentid: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-button">Submit</button>
                </form>
              </div>
            </div>
          )}

          {showAddUserPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="popup-header">
                  <span className="back-arrow" onClick={() => setShowAddUserPopup(false)}>⬅</span>
                  <h2>Add User</h2>
                </div>
                <form onSubmit={handleAddUser}>
                  <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      required
                    >
                      <option value="user">Employee</option>
                      <option value="hod">HOD</option>
                      
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="departmentid">Department ID</label>
                    <input
                      type="text"
                      id="departmentid"
                      value={newUser.departmentid}
                      onChange={(e) => setNewUser({ ...newUser, departmentid: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="departmentname">Department Name</label>
                    <input
                      type="text"
                      id="departmentname"
                      value={newUser.departmentname}
                      onChange={(e) => setNewUser({ ...newUser, departmentname: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-button">Submit</button>
                </form>
              </div>
            </div>
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
                        console.log('Selected Asset:', asset);
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

export default AdminDashboard;