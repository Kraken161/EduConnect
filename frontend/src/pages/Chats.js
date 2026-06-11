import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Chats = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'student';
  const loggedInUserName = localStorage.getItem('userName') || '';
  const loggedInUserPhone = localStorage.getItem('userPhone') || '';

  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [selectedGroupToAssign, setSelectedGroupToAssign] = useState("");
  
  const [msgContextMenu, setMsgContextMenu] = useState({ visible: false, x: 0, y: 0, msgId: null });
  const [headerContextMenu, setHeaderContextMenu] = useState({ visible: false, x: 0, y: 0 });
  
  // NEW: Context Menu state for right-clicking the sidebar connections
  const [sidebarContextMenu, setSidebarContextMenu] = useState({ visible: false, x: 0, y: 0, room: null });
  
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  };

  // FIXED: Using a container ref instead of an end ref to prevent whole-page jumping
  const chatContainerRef = useRef(null);

  const fetchChatRosters = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chats/${loggedInUserPhone}?userName=${loggedInUserName}`
      );
      setChatRooms(response.data);
      if (response.data.length > 0 && !activeRoom) {
        setActiveRoom(response.data[0]);
      } else if (activeRoom) {
        const refreshedRoom = response.data.find(r => r._id === activeRoom._id);
        if (refreshedRoom) setActiveRoom(refreshedRoom);
      }
    } catch (err) {
      console.error("Error loading message tracks:", err);
    }
  };

  useEffect(() => {
    fetchChatRosters();
    const livePollingInterval = setInterval(fetchChatRosters, 4000); 
    return () => clearInterval(livePollingInterval);
  }, [activeRoom?._id]);

  // FIXED SCROLL GLITCH: This guarantees ONLY the inner chat box scrolls, not the page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeRoom?.messages?.length]);

  const handleMsgRightClick = (e, msg) => {
    if (msg.sender !== loggedInUserName) return; 
    e.preventDefault(); 
    setMsgContextMenu({ visible: true, x: e.clientX, y: e.clientY, msgId: msg._id });
    setHeaderContextMenu({ visible: false, x: 0, y: 0 }); 
    setSidebarContextMenu({ visible: false, x: 0, y: 0, room: null });
  };

  const handleHeaderRightClick = (e) => {
    if (userRole !== 'student' || !activeRoom?.isGroup) return; 
    e.preventDefault();
    setHeaderContextMenu({ visible: true, x: e.clientX, y: e.clientY });
    setMsgContextMenu({ visible: false, x: 0, y: 0, msgId: null }); 
    setSidebarContextMenu({ visible: false, x: 0, y: 0, room: null });
  };

  // NEW: Right-click handler for Sidebar Direct Chats
  const handleSidebarRightClick = (e, room) => {
    if (room.isGroup) return; // Only allow removing 1-on-1 connections
    e.preventDefault();
    setSidebarContextMenu({ visible: true, x: e.clientX, y: e.clientY, room: room });
    setMsgContextMenu({ visible: false, x: 0, y: 0, msgId: null });
    setHeaderContextMenu({ visible: false, x: 0, y: 0 });
  };

  const closeAllMenus = () => {
    setMsgContextMenu({ visible: false, x: 0, y: 0, msgId: null });
    setHeaderContextMenu({ visible: false, x: 0, y: 0 });
    setSidebarContextMenu({ visible: false, x: 0, y: 0, room: null });
  };

  const handleSendMessage = async (e, pinStatus = false) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || !activeRoom) return;

    try {
      const messagePayload = {
        sender: loggedInUserName,
        senderPhone: loggedInUserPhone,
        text: typedMessage.trim(),
        isPinned: pinStatus,
        targetMembers: activeRoom.allowedMembers 
      };

      await axios.post(
        `http://localhost:5000/api/chats/${activeRoom._id}/messages`,
        messagePayload
      );

      setTypedMessage("");
      fetchChatRosters();
    } catch (err) {
      showToast("❌ Transmission failure.");
    }
  };

  const handleDeleteMessage = async (targetMsgId) => {
    closeAllMenus();
    if (!targetMsgId) return showToast("❌ Error: Message ID missing.");

    try {
      await axios.delete(`http://localhost:5000/api/chats/${activeRoom._id}/messages/${targetMsgId}`);
      showToast("🗑️ Message deleted successfully.");
      fetchChatRosters();
    } catch (err) {
      showToast("❌ Failed to delete message.");
    }
  };

  const handleLeaveClass = async () => {
    closeAllMenus();
    if (!window.confirm(`Are you sure you want to leave the ${activeRoom.subjectChannelName} class room?`)) return;
    
    try {
      await axios.patch(`http://localhost:5000/api/chats/channels/${activeRoom._id}/leave`, {
        studentPhone: loggedInUserPhone
      });
      showToast("👋 You have successfully left the class.");
      setActiveRoom(null); 
      fetchChatRosters(); 
    } catch (err) {
      showToast("❌ Failed to leave class.");
    }
  };

 
  const handleRemoveConnection = async () => {
    const targetRoom = sidebarContextMenu.room;
    closeAllMenus();
    
    if (!targetRoom) return;
    if (!window.confirm(`Are you sure you want to permanently remove this connection?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/chats/channels/${targetRoom._id}`);
      showToast("🚫 Connection removed permanently.");
      if (activeRoom && activeRoom._id === targetRoom._id) setActiveRoom(null);
      fetchChatRosters();
    } catch (err) {
      showToast("❌ Failed to remove connection.");
    }
  };

  const handleCreateSubjectChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const payload = {
        teacherName: loggedInUserName,
        teacherPhone: loggedInUserPhone,
        subjectChannelName: newChannelName.trim()
      };
      await axios.post('http://localhost:5000/api/chats/channels', payload);
      setNewChannelName("");
      showToast("📚 New class group created successfully!");
      fetchChatRosters();
    } catch (err) {
      showToast("❌ Failed to build channel path.");
    }
  };

const handleQuickAssignToClass = async () => {
    if (!selectedGroupToAssign || !activeRoom || activeRoom.isGroup) return;

    try {
     
      const response = await axios.patch(
        `http://localhost:5000/api/chats/channels/${selectedGroupToAssign}/add-student`,
        { studentPhone: activeRoom.studentPhone }
      );

      
      await axios.post('http://localhost:5000/api/notifications', {
        recipientPhone: activeRoom.studentPhone,
        message: `📚 You have been added to a Class Group Channel by Mentor ${loggedInUserName}!`
      });

      
      showToast("✅ Student successfully added to the class!");
      setSelectedGroupToAssign("");
      fetchChatRosters(); 
    } catch (err) {
      
      const backendErrorMessage = err.response?.data?.error || "Student already in class or binding failed.";
      showToast(`⚠️ Assignment Alert: ${backendErrorMessage}`);
    }
  };

  const getStudentDisplayName = (room) => {
    if (room.studentName && room.studentName !== "Student" && room.studentName !== "Guest Student") {
      return room.studentName;
    }
    return room.studentPhone;
  };

  const pinnedMessage = activeRoom?.messages?.find(m => m.isPinned);
  const groupChannels = chatRooms.filter(r => r.isGroup);
  const directChats = chatRooms.filter(r => !r.isGroup);

  return (
    // FIXED FOOTER ISSUE: Strict 100vh and hidden overflow locks the page structure perfectly
    <div className="premium-dashboard-wrapper" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: '#1e293b', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', zIndex: 9999, fontWeight: 'bold', animation: 'slideDown 0.3s ease-out' }}>
          {toast}
        </div>
      )}

      {/* --- ALL CONTEXT MENUS --- */}
      {msgContextMenu.visible && (
        <>
          <div onClick={closeAllMenus} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }} />
          <div style={{ position: 'fixed', top: msgContextMenu.y, left: msgContextMenu.x, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', borderRadius: '10px', zIndex: 999999, padding: '6px', minWidth: '160px' }}>
            <button onClick={() => handleDeleteMessage(msgContextMenu.msgId)} style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.target.style.background = '#fee2e2'} onMouseOut={(e) => e.target.style.background = 'transparent'}>🗑️ Delete Message</button>
          </div>
        </>
      )}

      {headerContextMenu.visible && (
        <>
          <div onClick={closeAllMenus} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }} />
          <div style={{ position: 'fixed', top: headerContextMenu.y, left: headerContextMenu.x, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', borderRadius: '10px', zIndex: 999999, padding: '6px', minWidth: '160px' }}>
            <button onClick={handleLeaveClass} style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.target.style.background = '#fee2e2'} onMouseOut={(e) => e.target.style.background = 'transparent'}>🚪 Leave Class</button>
          </div>
        </>
      )}

      {/* NEW: Sidebar Connection Context Menu */}
      {sidebarContextMenu.visible && (
        <>
          <div onClick={closeAllMenus} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }} />
          <div style={{ position: 'fixed', top: sidebarContextMenu.y, left: sidebarContextMenu.x, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', borderRadius: '10px', zIndex: 999999, padding: '6px', minWidth: '160px' }}>
            <button onClick={handleRemoveConnection} style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', borderRadius: '6px' }} onMouseOver={(e) => e.target.style.background = '#fee2e2'} onMouseOut={(e) => e.target.style.background = 'transparent'}>🚫 Remove Connection</button>
          </div>
        </>
      )}

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

      <main className="dashboard-main-content">
        <header style={{ marginBottom: '24px', textAlign: 'left' }}>
          <h2>Class Chats Hub</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Right-click connections, messages, or classes to manage them.</p>
        </header>

        <div className="chat-workspace-container">

          <section className="chat-channels-sidebar-rail" style={{ display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📚 My Classes</h4>
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {groupChannels.map(room => (
                  <button
                    key={room._id}
                    className={`channel-list-item-btn ${activeRoom?._id === room._id ? 'active' : ''}`}
                    onClick={() => setActiveRoom(room)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 12px' }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{room.subjectChannelName}</span>
                    <span style={{ fontSize: '0.65rem', color: activeRoom?._id === room._id ? '#e2e8f0' : '#64748b', marginTop: '2px' }}>
                      Mentor: {room.teacherName}
                    </span>
                  </button>
                ))}
                {groupChannels.length === 0 && <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>No classes joined.</p>}
              </div>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👤 Direct Chats</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {directChats.map(room => (
                  <button
                    key={room._id}
                    onContextMenu={(e) => handleSidebarRightClick(e, room)}
                    className={`channel-list-item-btn ${activeRoom?._id === room._id ? 'active' : ''}`}
                    onClick={() => setActiveRoom(room)}
                    title="Right-click to remove connection"
                  >
                    {userRole === 'teacher' ? `Student: ${getStudentDisplayName(room)}` : `Mentor: ${room.teacherName}`}
                  </button>
                ))}
                {directChats.length === 0 && <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>No direct chats active.</p>}
              </div>
            </div>

            {userRole === 'teacher' && (
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px', marginTop: 'auto' }}>
                <form onSubmit={handleCreateSubjectChannel}>
                  <input
                    type="text"
                    placeholder="Create New Class..."
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '0.8rem', borderRadius: '4px', marginBottom: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <button type="submit" className="primary-btn" style={{ width: '100%', padding: '8px', fontSize: '0.8rem', backgroundColor: '#1e40af' }}>
                    + Add Class Group
                  </button>
                </form>
              </div>
            )}
          </section>

          <section className="messaging-desk-canvas">
            {activeRoom ? (
              <>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h4 
                      onContextMenu={handleHeaderRightClick}
                      style={{ 
                        margin: 0, 
                        color: '#1e40af', 
                        cursor: (userRole === 'student' && activeRoom.isGroup) ? 'context-menu' : 'default',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={(userRole === 'student' && activeRoom.isGroup) ? "Right-click to leave class" : ""}
                    >
                      {activeRoom.isGroup ? `Group Room: ${activeRoom.subjectChannelName}` : (userRole === 'teacher' ? getStudentDisplayName(activeRoom) : activeRoom.teacherName)}
                    </h4>
                  </div>

                  {userRole === 'teacher' && !activeRoom.isGroup && (
                    <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '8px', overflow: 'hidden', border: '2px solid #1e40af' }}>
                      <select 
                        value={selectedGroupToAssign}
                        onChange={(e) => setSelectedGroupToAssign(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '0.85rem', border: 'none', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '600', outline: 'none', cursor: 'pointer', borderRight: '1px solid #1e40af' }}
                      >
                        <option value="">-- Select Class --</option>
                        {groupChannels.map(gc => (
                          <option key={gc._id} value={gc._id}>{gc.subjectChannelName}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleQuickAssignToClass} 
                        style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1e3a8a'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1e40af'}
                      >
                        + Assign
                      </button>
                    </div>
                  )}
                </div>

                {pinnedMessage && (
                  <div className="pinned-announcement-header-banner">
                    <div>
                      <strong>📌 Pinned Lesson Announcement:</strong> {pinnedMessage.text}
                      <span style={{ fontSize: '0.75rem', display: 'block', color: '#a16207', marginTop: '2px' }}>Posted by Instructor • Broadcasted to Student Alert Bells</span>
                    </div>
                  </div>
                )}

                {/* FIXED: Uses the container ref for safe, glitch-free scrolling */}
                <div className="messages-scroller-window" ref={chatContainerRef}>
                  {activeRoom.messages?.map((msg, idx) => (
                    <div 
                      key={msg._id || idx} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === loggedInUserName ? 'flex-end' : 'flex-start', marginBottom: '10px' }}
                    >
                      <div 
                        onContextMenu={(e) => handleMsgRightClick(e, msg)}
                        className={`individual-chat-bubble ${msg.sender === loggedInUserName ? 'outgoing' : 'incoming'}`}
                        style={{ cursor: msg.sender === loggedInUserName ? 'context-menu' : 'default' }}
                        title={msg.sender === loggedInUserName ? "Right-click to delete" : ""}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 'bold', opacity: 0.8, marginBottom: '2px' }}>
                          {msg.sender}
                        </div>

                        {msg.text.includes('zoom.us') || msg.text.includes('http') ? (
                          <a href={msg.text} target="_blank" rel="noreferrer" style={{ color: msg.sender === loggedInUserName ? '#ffffff' : '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>
                            🔗 Click Here to Join Live Class Meeting
                          </a>
                        ) : (
                          <div>{msg.text}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleSendMessage(e, false)} className="chat-input-footer-tray">
                  <input
                    type="text"
                    placeholder="Type a message or paste a live class Zoom link here..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button type="submit" className="primary-btn" style={{ backgroundColor: '#1e40af' }}>
                    Send
                  </button>

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