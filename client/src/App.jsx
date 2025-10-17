import { BrowserRouter as Router,Routes,Route, BrowserRouter } from 'react-router-dom';
import StudentAuthPage from './pages/StudentAuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AvailableCourse from './pages/AvailableCourse';
import HomePage from './pages/HomePage';
import TeacherAuthPage from './pages/TeacherAuthPage';
import TeacherDashboard from './pages/TeacherDashboard';

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
      </Routes>
    </Router>
  );
}

export default App
