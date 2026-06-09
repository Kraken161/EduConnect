import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from 'axios'; 

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [teacher, setTeacher] = useState({ name: "Loading...", bio: "Loading details..." });
  const loggedInStudent = localStorage.getItem('userName') || "Guest Student";

  // --- REVIEW SYSTEM STATES ---
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('https://educonnect-backend-qmdv.onrender.com/api/teachers');
        const found = response.data.find(t => t._id === id);
        
        if (found) {
          setTeacher(found);
          setReviews(found.reviews || []); 
          
          // UNIQUE VIEW TRACKER LOGIC
          if (loggedInStudent !== "Guest Student" && loggedInStudent !== found.name) {
            const viewers = found.viewedBy || [];
            
            // If this student's name is NOT in the array yet, count the view!
            if (!viewers.includes(loggedInStudent)) {
              await axiosInstance.patch(`https://educonnect-backend-qmdv.onrender.com/api/teachers/${found._id}`, {
                profileViews: (found.profileViews || 0) + 1,
                viewedBy: [...viewers, loggedInStudent] 
              });
            }
          }
        } else {
          setTeacher({ name: "Profile Not Found", bio: "This profile does not exist." });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [id, loggedInStudent]);

  // --- REVIEW LOGIC (ADD & DELETE) ---
  const handleReviewSubmit = async () => {
    if (userReview.trim() !== "") {
      const addedReview = { id: Date.now(), name: loggedInStudent, rating: selectedRating, text: userReview };
      const updatedReviews = [...reviews, addedReview];
      
      setReviews(updatedReviews); 
      setUserReview("");
      setSelectedRating(5);

      // SAVE PERMANENTLY TO DATABASE
      try {
        await axiosInstance.patch(`https://educonnect-backend-qmdv.onrender.com/api/teachers/${teacher._id}`, {
          reviews: updatedReviews
        });
      } catch (error) {
        console.error("Failed to save review to database");
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const updatedReviews = reviews.filter(rev => rev.id !== reviewId);
    setReviews(updatedReviews);

    try {
      await axiosInstance.patch(`https://educonnect-backend-qmdv.onrender.com/api/teachers/${teacher._id}`, {
        reviews: updatedReviews
      });
    } catch (error) {
      console.error("Failed to delete review from database");
    }
  };

  const renderStars = (num) => "★".repeat(num) + "☆".repeat(5 - num);

  // Professional Automated WhatsApp Message
  const whatsappMessage = encodeURIComponent(`Hello, my name is ${loggedInStudent}. I found your profile on EduConnect and would like to inquire about booking a class.`);

  // FIXED: ADDED THE STUDENT PHONE TRACER HERE
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // RETRIEVING THE ESSENTIAL PHONE TRACER TO PREVENT SCHEMA CRASHES
    const loggedInStudentPhone = localStorage.getItem('userPhone') || "";

    const bookingData = { 
      teacherName: teacher.name, 
      studentName: loggedInStudent, 
      studentPhone: loggedInStudentPhone, // INJECTED PARAMETER
      date: selectedDate, 
      time: selectedTime 
    };

    try {
      await axiosInstance.post('https://educonnect-backend-qmdv.onrender.com/api/bookings', bookingData);
      setBookingSuccess(true);
      setTimeout(() => { setIsBooking(false); setBookingSuccess(false); }, 3000);
    } catch (error) {
      console.error(error);
      alert("Booking save failed. Make sure student profile state has a valid session phone context.");
    }
  };

  return (
    <div className="home-container" style={{ position: 'relative' }}>
      <div className="glass-card" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          ← Back to Search
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#1e40af', margin: '0 0 5px 0' }}>{teacher.name}</h2>
          <span style={{ background: '#fef3c7', color: '#d97706', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            ★ {teacher.rating || "5.0"} Rating
          </span>
        </div>
        
        <p style={{ color: '#64748b', fontWeight: 'bold', margin: '5px 0' }}>{teacher.degree} {teacher.teachingLevel ? `• ${teacher.teachingLevel}` : ''}</p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0' }}>📍 {teacher.location}</p>
        {teacher.subjects && teacher.subjects.length > 0 && (
          <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '10px' }}><strong>Subjects:</strong> {teacher.subjects.join(", ")}</p>
        )}
        
        <hr style={{ border: '0.5px solid #e2e8f0', margin: '20px 0' }} />
        
        <h3 style={{ color: '#1e40af' }}>About Me</h3>
        <p style={{ lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>{teacher.bio || `I am a qualified mentor from ${teacher.location} specializing in ${teacher.degree}. I look forward to helping you succeed!`}</p>

        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button className="primary-btn" style={{ background: '#25D366', border: 'none' }} onClick={() => window.open(`https://wa.me/91${teacher.phone}?text=${whatsappMessage}`, '_blank')} disabled={teacher.name === "Profile Not Found"}>
            WhatsApp
          </button>
          <button className="primary-btn" style={{ background: '#1e40af' }} onClick={() => setIsBooking(true)} disabled={teacher.name === "Profile Not Found"}>
            Book a Demo Class
          </button>
        </div>

        {/* --- REVIEW UI SECTION --- */}
        <div style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
          <h3 style={{ color: '#1e40af' }}>Student Feedback ({reviews.length})</h3>
          
          {reviews.map((rev) => (
            <div key={rev.id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#1e40af' }}>{rev.name}</strong>
                  <span style={{ color: '#f59e0b', fontSize: '1.1rem', marginLeft: '10px' }}>{renderStars(rev.rating)}</span>
                </div>
                
                {rev.name === loggedInStudent && (
                  <button 
                    onClick={() => handleDeleteReview(rev.id)} 
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.95rem', margin: '8px 0 0 0', color: '#475569', fontStyle: 'italic' }}>"{rev.text}"</p>
            </div>
          ))}

          <div style={{ marginTop: '30px', background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>Rate this Mentor</h4>
            <div style={{ marginBottom: '10px', fontSize: '1.8rem', cursor: 'pointer', userSelect: 'none' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} style={{ color: star <= selectedRating ? '#f59e0b' : '#cbd5e1' }} onClick={() => setSelectedRating(star)}>
                  ★
                </span>
              ))}
            </div>
            <textarea 
              value={userReview} onChange={(e) => setUserReview(e.target.value)}
              placeholder="Write a review about your experience..." 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', marginBottom: '15px', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <button className="primary-btn" onClick={handleReviewSubmit} style={{ padding: '10px 20px' }}>
              Submit Review
            </button>
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {isBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            {!bookingSuccess ? (
              <>
                <h3 style={{ color: '#1e40af' }}>Schedule Demo</h3>
                <form onSubmit={handleBookingSubmit} style={{ marginTop: '20px' }}>
                  <input type="date" required value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <select required value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="">Select Time Slot</option>
                    <option>10:00 AM - 10:30 AM</option>
                    <option>04:00 PM - 04:30 PM</option>
                  </select>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="primary-btn" style={{ flex: 1 }}>Confirm</button>
                    <button type="button" className="primary-btn" style={{ flex: 1, background: '#94a3b8' }} onClick={() => setIsBooking(false)}>Cancel</button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '3rem', color: '#059669' }}>✓</div>
                <h3 style={{ color: '#059669' }}>Request Sent!</h3>
                <button className="primary-btn" onClick={() => { setIsBooking(false); setBookingSuccess(false); }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;