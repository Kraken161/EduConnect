import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const loggedInUser = localStorage.getItem('userName'); 

  // --- NEW PHASE 2 MODAL STATES ---
  const [selectedBookingForAcceptance, setSelectedBookingForAcceptance] = useState(null);
  const [acceptMode, setAcceptMode] = useState('now'); // 'now' or 'later'
  const [waitTime, setWaitTime] = useState(10); // 10 to 60 minutes slider
  const [meetingLink, setMeetingLink] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings');
      const myBookings = response.data.filter(b => b.teacherName === loggedInUser);
      setBookings(myBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

useEffect(() => {
    fetchBookings();
  }, [fetchBookings]); 

 
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}`, { status: newStatus });
      fetchBookings(); 
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };


  const handleConfirmAcceptance = async (e) => {
    e.preventDefault();
    
   
    if (acceptMode === 'now' && !meetingLink.trim()) {
      alert("Please provide a valid meeting link (e.g., Zoom URL) to start the class immediately.");
      return;
    }

    try {
      const payload = {
        status: 'Confirmed',
        meetingLink: meetingLink.trim(),
        waitTime: acceptMode === 'now' ? 0 : waitTime
      };

      // Sends data to the Phase 1 upgraded backend route
      await axios.patch(`http://localhost:5000/api/bookings/${selectedBookingForAcceptance._id}`, payload);
      
      // Reset modal states and close
      setSelectedBookingForAcceptance(null);
      setMeetingLink("");
      setWaitTime(10);
      setAcceptMode('now');
      fetchBookings(); 
    } catch (err) {
      console.error("Error accepting booking:", err);
      alert("Failed to confirm booking. Check server connection.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this booking request?")) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`);
        fetchBookings();
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  return (
    <div style={{ padding: '10px', position: 'relative' }}>
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px' }}>Student</th>
              <th style={{ padding: '12px' }}>Date/Time</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{booking.studentName}</td>
                <td style={{ padding: '12px', color: '#64748b' }}>{booking.date} <br/> <span style={{ fontSize: '0.85rem' }}>{booking.time}</span></td>
                
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '5px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: booking.status === 'Pending' ? '#fef3c7' : booking.status === 'Confirmed' ? '#dcfce7' : '#fee2e2',
                    color: booking.status === 'Pending' ? '#d97706' : booking.status === 'Confirmed' ? '#166534' : '#b91c1c',
                    whiteSpace: 'nowrap'
                  }}>
                    {booking.status}
                  </span>
                </td>
                
                <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                  {booking.status === 'Pending' && (
  <>
    {/* OVERHAULED: Conditional Button Logic */}
    <button 
      onClick={() => {
        // If it's a Chat Request, handle it directly (without the modal)
        if (booking.date === "Chat Request Thread") {
            handleStatusChange(booking._id, 'Confirmed'); // Confirms directly
            alert("Chat Request Accepted!");
        } else {
            // Only open the modal for actual Demo Bookings
            setSelectedBookingForAcceptance(booking);
        }
      }} 
      style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
    >
      Accept
    </button>
    <button 
      onClick={() => handleStatusChange(booking._id, 'Cancelled')} 
      style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
    >
      Decline
    </button>
  </>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
          <p>No current session request entries found.</p>
        </div>
      )}

      {/* --- PHASE 2: THE INTERACTIVE ACCEPTANCE MODAL --- */}
      {selectedBookingForAcceptance && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <h3 style={{ color: '#1e40af', margin: '0 0 16px 0', fontSize: '1.25rem' }}>
              Confirm Demo with {selectedBookingForAcceptance.studentName}
            </h3>
            
            <form onSubmit={handleConfirmAcceptance}>
              
              {/* Option Toggles */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setAcceptMode('now')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: acceptMode === 'now' ? '2px solid #22c55e' : '1px solid #cbd5e1', backgroundColor: acceptMode === 'now' ? '#dcfce7' : 'white', color: acceptMode === 'now' ? '#166534' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  🚀 Start Now
                </button>
                <button 
                  type="button"
                  onClick={() => setAcceptMode('later')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: acceptMode === 'later' ? '2px solid #1e40af' : '1px solid #cbd5e1', backgroundColor: acceptMode === 'later' ? '#eff6ff' : 'white', color: acceptMode === 'later' ? '#1e40af' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  ⏳ Select Time
                </button>
              </div>

              {/* The Dynamic Slider (Only shows if 'Select Time' is chosen) */}
              {acceptMode === 'later' && (
                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Wait Time: <span style={{ color: '#1e40af', fontSize: '1.1rem' }}>{waitTime} Minutes</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="60" 
                    step="10" 
                    value={waitTime} 
                    onChange={(e) => setWaitTime(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#1e40af' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    <span>10m</span>
                    <span>30m</span>
                    <span>60m</span>
                  </div>
                </div>
              )}

              {/* Zoom Link Input - Dynamically Required */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Live Class Link (Zoom/Meet) {acceptMode === 'now' && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input 
                  type="url" 
                  placeholder="https://zoom.us/j/..." 
                  required={acceptMode === 'now'} // Only force the link if starting now
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                {acceptMode === 'later' && (
                   <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                     Optional. You can drop the link in your 1-on-1 chat later.
                   </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 2, backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  Confirm & Dispatch
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedBookingForAcceptance(null);
                    setAcceptMode('now');
                    setMeetingLink("");
                  }} 
                  style={{ flex: 1, backgroundColor: '#94a3b8', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;