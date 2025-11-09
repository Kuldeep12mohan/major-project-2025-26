import { BrowserRouter as Router,Routes,Route, BrowserRouter } from 'react-router-dom';
import StudentAuthPage from './pages/student/StudentAuthPage';
import HomePage from "./pages/HomePage"
import StudentDashboard from "./pages/student/StudentDashboard"
import AvailableCourse from "./pages/student/AvailableCourse"
import MyRegistration from "./pages/student/MyRegistration"
import TeacherAuthPage from "./pages/teacher/TeacherAuthPage"
import TeacherDashboard from "./pages/teacher/TeacherDashboard"
import AdminLoginPage from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import { PendingRegistration } from './pages/teacher/PendingRegistration';
function App() {
  
  return(
    <Router>
      <Routes>
        <Route element={<StudentAuthPage/>} path='/auth-student'/>
        <Route element={<HomePage/>} path='/'/>
        <Route element={<StudentDashboard/>} path='/dashboard'/>
        <Route element={<AvailableCourse/>} path='/available-courses'/>
        <Route element={<TeacherAuthPage/>} path='/auth-teacher'/>
        <Route element={<TeacherDashboard/>} path='/teacher-dashboard'/>
        <Route path="/admin/login" element={<AdminLoginPage/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path='/my-registrations' element={<MyRegistration/>}/>
        <Route path='/teacher/requests' element={<PendingRegistration/>}/>
      </Routes>
    </Router>
  );
}

export default App
