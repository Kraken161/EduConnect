import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Chats = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'student';
  const loggedInUserName = localStorage.getItem('userName') || '';
  const loggedInUserPhone = localStorage.getItem('userPhone') || '';

  // Data Stream Pipelines
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [newChannelName, setNewChannelName] = useState("");

  // Target assignment maps for Channel Whitelists (Only visible to teachers)
  const [studentToWhitelist, setStudentToWhitelist] = useState("");

  const messagesEndRef = useRef(null);

  // Sync available text threads from database cluster
  const fetchChatRosters = async () => {
    try {
      const response = await axios.get(
        `https://educonnect-backend-qmdv.onrender.com/api/chats/${loggedInUserPhone}?userName=${loggedInUserName}`
      );
      setChatRooms(response.data);
      if (response.data.length > 0 && !activeRoom) {
        setActiveRoom(response.data[0]);
      } else if (activeRoom) {
        // Maintain focus on the currently selected active room to see updates
        const refreshedRoom = response.data.find(r => r._id === activeRoom._id);
        if (refreshedRoom) setActiveRoom(refreshedRoom);
      }
    } catch (err) {
      console.error("Error loading message tracks:", err);
    }
  };

  useEffect(() => {
    fetchChatRosters();
    const livePollingInterval = setInterval(fetchChatRosters, 4000); // Polls every 4 seconds for new messages
    return () => clearInterval(livePollingInterval);
  }, [activeRoom]);

  useEffect(() => {
    // Smooth scroll down to the absolute latest text message inside the canvas view
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages]);

  // SEND MESSAGE HANDLER
  const handleSendMessage = async (e, pinStatus = false) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || !activeRoom) return;

    try {
      const messagePayload = {
        sender: loggedInUserName,
        senderPhone: loggedInUserPhone,
        text: typedMessage.trim(),
        isPinned: pinStatus,
        targetMembers: activeRoom.allowedMembers // Target roster for alerts distribution
      };

      await axios.post(
        `https://educonnect-backend-qmdv.onrender.com/api/chats/${activeRoom._id}/messages`, 
        messagePayload
      );
      
      setTypedMessage("");
      fetchChatRosters();
    } catch (err) {
      alert("Transmission failure.");
    }
  };

  // CREATE GROUP SUBJECT CHANNEL (Teacher Control only)
  const handleCreateSubjectChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const payload = {
        teacherName: loggedInUserName,
        teacherPhone: loggedInUserPhone,
        subjectChannelName: newChannelName.trim()
      };
      await axios.post('https://educonnect-backend-qmdv.onrender.com/api/chats/channels', payload);
      setNewChannelName("");
      alert("📚 New subject channel room created successfully!");
      fetchChatRosters();
    } catch (err) {
      alert("Failed to build channel path.");
    }
  };

  // ADD MENTORED STUDENT TO SUBJECT CHANNEL WHITELIST (Teacher Control only)
  const handleAddStudentToChannel = async (e) => {
    e.preventDefault();
    if (!studentToWhitelist.trim() || !activeRoom || !activeRoom.isGroup) return;

    try {
      await axios.patch(
        `https://educonnect-backend-qmdv.onrender.com/api/chats/channels/${activeRoom._id}/add-student`,
        { studentPhone: studentToWhitelist.trim() }
      );
      
      // Fire confirmation alert into notification bell database
      await axios.post('https://educonnect-backend-qmdv.onrender.com/api/notifications', {
        recipientPhone: studentToWhitelist.trim(),
        message: `📚 You have been explicitly whitelisted and added to Mentor ${loggedInUserName}'s "${activeRoom.subjectChannelName}" Group Channel!`
      });

      alert("Student whitelisted into subject channel roster successfully!");
      setStudentToWhitelist("");
      fetchChatRosters();
    } catch (err) {
      alert("Failed to bind student to channel tracking array.");
    }
  };

  // Find the currently pinned message if it exists in the active room
  const pinnedMessage = activeRoom?.messages?.find(m => m.isPinned);

  return (
    <div className="premium-dashboard-wrapper">
      
      {/* COMPACT PINTEREST LEFT NAVIGATION RAIL */}
      <aside className="pinterest-sidebar">
        <div>
          <div className="sidebar-brand-title">EduConnect</div>
          <nav className="sidebar-navigation-links">
            <button className="sidebar-nav-item" onClick={() => navigate(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}>🏠 Dashboard Overview</button>
            {userRole === 'student' && <button className="sidebar-nav-item" onClick={() => navigate('/search-mentors')}>🔍 Search Tutors</button>}
            <button className="sidebar-nav-item active">💬 Class Chats</button>
            <button className="sidebar-nav-item" onClick={() => navigate(userRole === 'teacher' ? '/teacher-settings' : '/student-settings')}>⚙️ Portal Settings</button>
          </nav>
        </div>
      </aside>

      {/* RE-ARRANGED WORKSPACE CONTAINER CANVAS */}
      <main className="dashboard-main-content">
        <header style={{ marginBottom: '24px', textAlign: 'left' }}>
          <h2>Class Chats Hub</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Coordinate lessons, retrieve direct Zoom links, and manage group subject channels.</p>
        </header>

        <div className="chat-workspace-container">
          
          {/* LEFT SIDE CHANNELS AND ACTIVE USER THREAD RAIL TRACK */}
          <section className="chat-channels-sidebar-rail">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Active Rooms</h4>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chatRooms.map(room => (
                <button 
                  key={room._id}
                  className={`channel-list-item-btn ${activeRoom?._id === room._id ? 'active' : ''}`}
                  onClick={() => setActiveRoom(room)}
                >
                  {room.isGroup ? `📚 ${room.subjectChannelName}` : `👤 Thread: ${room.teacherName}`}
                </button>
              ))}
              {chatRooms.length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'left' }}>No message channels active yet.</p>}
            </div>

            {/* TEACHER ONLY UTILITIES PANEL TRACK (Channel builders) */}
            {userRole === 'teacher' && (
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginTop: '12px' }}>
                <form onSubmit={handleCreateSubjectChannel}>
                  <input 
                    type="text" 
                    placeholder="New Subject Channel..." 
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    style={{ padding: '6px', fontSize: '0.8rem', borderRadius: '4px', marginBottom: '6px' }}
                  />
                  <button type="submit" className="primary-btn" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}>
                    + Add Channel
                  </button>
                </form>
              </div>
            )}
          </section>

          {/* RIGHT SIDE DESK ARENA CANVAS WINDOW */}
          <section className="messaging-desk-canvas">
            {activeRoom ? (
              <>
                {/* ACTIVE ROOM SUBHEADER CONTROL BAR */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, color: '#1e40af' }}>
                    {activeRoom.isGroup ? `Group Room: ${activeRoom.subjectChannelName}` : `Private Workspace: ${activeRoom.teacherName}`}
                  </h4>

                  {/* TEACHER ONLY WHITELIST INJECT FORM */}
                  {userRole === 'teacher' && activeRoom.isGroup && (
                    <form onSubmit={handleAddStudentToChannel} style={{ display: 'flex', gap: '6px', margin: 0 }}>
                      <input 
                        type="tel" 
                        placeholder="Student Phone..." 
                        value={studentToWhitelist}
                        onChange={(e) => setStudentToWhitelist(e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '0.78rem', width: '130px', borderRadius: '4px', margin: 0 }}
                      />
                      <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        + Add Student
                      </button>
                    </form>
                  )}
                </div>

                {/* THE SYSTEM DYNAMIC PINNED TEXT ANNOUNCEMENT BANNER */}
                {pinnedMessage && (
                  <div className="pinned-announcement-header-banner">
                    <div>
                      <strong>📌 Pinned Lesson Announcement:</strong> {pinnedMessage.text}
                      <span style={{ fontSize: '0.75rem', display: 'block', color: '#a16207', marginTop: '2px' }}>Posted by Instructor • Broadcasted to Student Alert Bells</span>
                    </div>
                  </div>
                )}

                {/* MESSAGES LOG BUBBLES CONTAINER TRACK */}
                <div className="messages-scroller-window">
                  {activeRoom.messages?.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`individual-chat-bubble ${msg.sender === loggedInUserName ? 'outgoing' : 'incoming'}`}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 'bold', opacity: 0.8, marginBottom: '2px' }}>
                        {msg.sender}
                      </div>
                      
                      {/* Detects and converts any Zoom URL string cleanly into clickable live links */}
                      {msg.text.includes('zoom.us') || msg.text.includes('http') ? (
                        <a href={msg.text} target="_blank" rel="noreferrer" style={{ color: msg.sender === loggedInUserName ? '#ffffff' : '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>
                          🔗 Click Here to Join Live Class Meeting
                        </a>
                      ) : (
                        <div>{msg.text}</div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* INTERACTIVE COMPOSER CHAT FOOTER INPUT TRAY */}
                <form onSubmit={(e) => handleSendMessage(e, false)} className="chat-input-footer-tray">
                  <input 
                    type="text" 
                    placeholder="Type a message or paste a live class Zoom link here..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button type="submit" className="primary-btn">
                    Send
                  </button>

                  {/* TEACHER ONLY OPTION TO PIN TEXT AS EXTENDED BULK ALERTS */}
                  {userRole === 'teacher' && (
                    <button 
                      type="button" 
                      onClick={() => handleSendMessage(null, true)}
                      className="primary-btn" 
                      style={{ backgroundColor: '#eab308' }}
                      title="Sends text message and pins it to the room top banner and student notification bells."
                    >
                      📌 Pin & Broadcast
                    </button>
                  )}
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                <p>Please select a conversation room thread path from the left rail to view chat history logs.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default Chats;