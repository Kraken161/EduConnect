import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchMentors from './pages/SearchMentors';
import SignupChoice from './pages/SignupChoice';
import StudentSignup from './pages/StudentSignup';
import TeacherSignup from './pages/TeacherSignup';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard'; // This is your main page
import TeacherProfile from './pages/TeacherProfile';
import EditProfile from './pages/EditProfile';
import Navbar from './components/Navbar';
// import Dashboard from './components/Dashboard'; // We can comment this out to avoid confusion
import Login from './pages/Login';
import './App.css';
import Settings from './pages/Settings';
import Chats from './pages/Chats';
function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup-choice" element={<SignupChoice />} />
        <Route path="/signup-student" element={<StudentSignup />} />
        <Route path="/signup-teacher" element={<TeacherSignup />} />
        
        {/* FIX: Use one clear route for the teacher dashboard */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        {/* DYNAMIC ROUTE: This ":id" is the key. 
          When you click on Birochan, the URL becomes /profile/birochan-id
        */}
        <Route path="/profile/:id" element={<TeacherProfile/>} />
        
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/search-mentors" element={<SearchMentors />} />
        <Route path="/student-settings" element={<Settings />} />
        <Route path="/teacher-settings" element={<Settings />} />
        <Route path="/student-chats" element={<Chats />} />
        <Route path="/teacher-chats" element={<Chats />} />
      </Routes>

      <footer style={{ 
        textAlign: 'center', 
        padding: '40px', 
        marginTop: '50px', 
        color: '#64748b', 
        borderTop: '1px solid #e2e8f0' 
      }}>
        <p>© 2026 EduConnect Assam - Empowering Students and Teachers</p>
        <p style={{ fontSize: '0.8rem' }}>Connecting learners from Guwahati to Dibrugarh.</p>
      </footer>
    </Router>
  );
}

export default App;