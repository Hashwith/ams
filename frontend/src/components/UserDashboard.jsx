import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import logo from '../assets/logo.png';
import { Html5Qrcode } from 'html5-qrcode';

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, departmentid, token, username } = location.state || { userType: 'unknown', departmentid: null, token: null, username: '' };
  const [assets, setAssets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAssetDetailsPopup, setShowAssetDetailsPopup] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [issueMessage, setIssueMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('UserDashboard loaded with:', { userType, departmentid, token, username });
    fetchAssets().catch(setError);
    fetchNotifications().catch(setError);
  }, [userType, departmentid, token, username]);

  useEffect(() => {
    let html5QrCode;
    if (showQRScanner) {
      html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            try {
              const assetCode = decodedText.split('Code:')[1];
              const response = await fetch(`http://localhost:5000/api/assets/${assetCode}`, {
                headers: { 'x-auth-token': token },
              });
              if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
              const asset = await response.json();
              setSelectedAsset(asset);
              setShowAssetDetailsPopup(true);
              setShowQRScanner(false);
              html5QrCode.stop();
            } catch (err) {
              setError(`Failed to fetch asset: ${err.message}`);
            }
          },
          (err) => {
            console.error('QR scan error:', err);
          }
        )
        .catch((err) => {
          setError(`QR scanner initialization failed: ${err.message}`);
        });
    }
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch((err) => console.error('Failed to stop QR scanner:', err));
      }
    };
  }, [showQRScanner, token]);

  const fetchAssets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user-assets', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
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
      setNotifications(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRequestAsset = async (e) => {
    e.preventDefault();
    if (!selectedAsset) {
      alert('Please select an asset');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/asset-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ username, assetCode: selectedAsset.assetCode }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      alert('Asset request sent!');
      setShowRequestPopup(false);
      setSelectedAsset(null);
      fetchNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleScanQR = () => {
    setShowQRScanner(true);
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !issueMessage) {
      alert('Please provide an issue description');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          username,
          assetCode: selectedAsset.assetCode,
          message: issueMessage,
          departmentid,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      alert('Issue reported successfully!');
      setShowAssetDetailsPopup(false);
      setSelectedAsset(null);
      setIssueMessage('');
      fetchNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  const goHome = () => {
    navigate('/');
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
          <p className="tagline">User Dashboard</p>
        </div>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="user-profile" onClick={goHome}>👤 {username}</div>
        </div>
      </header>
      <div className="dashboard-content">
        <aside className="sidebar">
          <nav>
            <button className="sidebar-button" onClick={handleScanQR}>
              <span className="icon">📷</span> Scan QR Code
            </button>
            <button className="sidebar-button" onClick={() => setShowRequestPopup(true)}>
              <span className="icon">➕</span> Request Asset
            </button>
            <button className="sidebar-button" onClick={fetchAssets}>
              <span className="icon">📋</span> My Assets
            </button>
            <button className="sidebar-button" onClick={fetchNotifications}>
              <span className="icon">🔔</span> Notifications
            </button>
          </nav>
        </aside>
        <main className="main-content">
          <div className="assets-section">
            <h2>Dashboard</h2>
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
              <p>No assets assigned.</p>
            )}
            {notifications.length > 0 && (
              <div className="assets-grid">
                <h3>Notifications</h3>
                {notifications.map((notif, index) => (
                  <div key={index} className="asset-card">
                    <p>{notif.message}</p>
                    <p>{new Date(notif.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showQRScanner && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="popup-header">
                  <span className="back-arrow" onClick={() => setShowQRScanner(false)}>⬅</span>
                  <h2>Scan QR Code</h2>
                </div>
                <div id="qr-reader" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}

          {showAssetDetailsPopup && selectedAsset && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="popup-header">
                  <span className="back-arrow" onClick={() => setShowAssetDetailsPopup(false)}>⬅</span>
                  <h2>Asset Details</h2>
                </div>
                <div className="asset-details">
                  <p><strong>Name:</strong> {selectedAsset.name}</p>
                  <p><strong>Asset Code:</strong> {selectedAsset.assetCode}</p>
                  <p><strong>Type:</strong> {selectedAsset.type}</p>
                  <p><strong>Brand:</strong> {selectedAsset.brand}</p>
                  <p><strong>Model:</strong> {selectedAsset.model}</p>
                  <p><strong>Status:</strong> {selectedAsset.status}</p>
                  {selectedAsset.qrCode && (
                    <img src={`http://localhost:5000${selectedAsset.qrCode}`} alt="QR Code" style={{ width: '100px' }} />
                  )}
                </div>
                <form onSubmit={handleReportIssue}>
                  <div className="input-group">
                    <label htmlFor="issueMessage">Report Issue</label>
                    <textarea
                      id="issueMessage"
                      value={issueMessage}
                      onChange={(e) => setIssueMessage(e.target.value)}
                      placeholder="Describe the issue with the asset"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-button">Report Issue</button>
                </form>
              </div>
            </div>
          )}

          {showRequestPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="popup-header">
                  <span className="back-arrow" onClick={() => setShowRequestPopup(false)}>⬅</span>
                  <h2>Request Asset</h2>
                </div>
                <form onSubmit={handleRequestAsset}>
                  <div className="input-group">
                    <label htmlFor="assetSelect">Select Asset</label>
                    <select
                      id="assetSelect"
                      value={selectedAsset ? selectedAsset.assetCode : ''}
                      onChange={(e) => {
                        const asset = assets.find((a) => a.assetCode === e.target.value) || { assetCode: e.target.value };
                        setSelectedAsset(asset);
                      }}
                      required
                    >
                      <option value="">Select an asset...</option>
                      {assets.filter((asset) => asset.status === 'Available').map((asset) => (
                        <option key={asset._id} value={asset.assetCode}>
                          {asset.name} ({asset.assetCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="submit-button">Request</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;