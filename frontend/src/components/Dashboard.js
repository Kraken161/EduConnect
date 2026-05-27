import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [zoomLinks, setZoomLinks] = useState({});
  const loggedInUser = localStorage.getItem('userName'); 

  const fetchBookings = async () => {
    try {
      const response = await axios.get('https://educonnect-backend-qmdv.onrender.com/api/bookings');
      const myBookings = response.data.filter(b => b.teacherName === loggedInUser);
      setBookings(myBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`https://educonnect-backend-qmdv.onrender.com/api/bookings/${id}`, { status: newStatus });
      fetchBookings(); 
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleSaveZoomLink = async (bookingId) => {
    const linkToSave = zoomLinks[bookingId];
    if (!linkToSave || !linkToSave.trim()) return alert("Please paste a valid Zoom link first!");

    try {
      await axios.patch(`https://educonnect-backend-qmdv.onrender.com/api/bookings/${bookingId}/zoom-link`, {
        meetingLink: linkToSave.trim()
      });
      alert("Zoom link successfully sent to student portal!");
      fetchBookings();
    } catch (err) {
      console.error("Error saving Zoom link:", err);
      alert("Failed to save Zoom link.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this booking request?")) {
      try {
        await axios.delete(`https://educonnect-backend-qmdv.onrender.com/api/bookings/${id}`);
        fetchBookings();
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px' }}>Student</th>
              <th style={{ padding: '12px' }}>Date/Time</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions / Zoom Link</th>
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
                      <button 
                        onClick={() => handleStatusChange(booking._id, 'Confirmed')} 
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
                  
                  {booking.status === 'Confirmed' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {booking.meetingLink ? (
                        <span style={{ fontSize: '0.85rem', color: '#2d8cff', fontWeight: 'bold' }}>✓ Link Shared</span>
                      ) : (
                        <>
                          <input 
                            type="text" 
                            placeholder="Paste Zoom link..." 
                            value={zoomLinks[booking._id] || ''} 
                            onChange={(e) => setZoomLinks({ ...zoomLinks, [booking._id]: e.target.value })}
                            style={{ padding: '6px 10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', width: '150px', margin: 0 }}
                          />
                          <button 
                            onClick={() => handleSaveZoomLink(booking._id)}
                            style={{ backgroundColor: '#2d8cff', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                          >
                            Send
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={() => handleDelete(booking._id)} 
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                  >
                    Delete
                  </button>
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
    </div>
  );
};

export default Dashboard;