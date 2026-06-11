import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationBell = () => {
  const loggedInUserPhone = localStorage.getItem('userPhone') || '';
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Pull notification document states from our integrated server endpoint
  const fetchAlertsContainer = async () => {
    if (!loggedInUserPhone) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${loggedInUserPhone}`);
      setNotifications(response.data);
    } catch (err) {
      console.error("Error syncing notifications bell logs:", err);
    }
  };

  useEffect(() => {
    fetchAlertsContainer();
    const alertPollingInterval = setInterval(fetchAlertsContainer, 5000); // Check for new notifications every 5 seconds
    return () => clearInterval(alertPollingInterval);
  }, [loggedInUserPhone]);

  // Handle clicking the bell to mark all current notifications as read
  const handleToggleDropdownAndClearBadges = async () => {
    setShowDropdown(!showDropdown);
    
    // Filter out unread alerts to see if we need to call the clear API
    const unreadAlerts = notifications.filter(n => !n.isRead);
    if (!showDropdown && unreadAlerts.length > 0) {
      try {
        await axios.patch(`http://localhost:5000/api/notifications/clear/${loggedInUserPhone}`);
        // Instantly switch state arrays locally so the red badge turns off immediately
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Failed to clear notification badges:", err);
      }
    }
  };

  // Count how many notifications are still unread to display on the red dot
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* THE INTERACTIVE BELL ICON BOX CONTAINER */}
      <div className="notification-bell-container" onClick={handleToggleDropdownAndClearBadges}>
        <span style={{ fontSize: '1.25rem' }}>🔔</span>
        {unreadCount > 0 && (
          <div className="notification-badge-dot">
            {unreadCount}
          </div>
        )}
      </div>

      {/* DYNAMIC DROP-DOWN CONTEXT WINDOW LAYOUT CARD */}
      {showDropdown && (
        <div className="notification-dropdown-box">
          <div style={{ padding: '4px 16px 8px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Notifications</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{notifications.length} alerts</span>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {notifications.map((alert) => (
              <div 
                key={alert._id} 
                className={`notification-item-row ${!alert.isRead ? 'unread' : ''}`}
              >
                <div>{alert.message}</div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {notifications.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No notifications at the moment.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationBell;