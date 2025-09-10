import { BrowserRouter as Router,Routes,Route, BrowserRouter } from 'react-router-dom';
import StudentAuthPage from './pages/StudentAuthPage';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  
  return(
    <Router>
      <Routes>
        <Route element={<StudentAuthPage/>} path='/'/>
        <Route element={<StudentDashboard/>} path='/dashboard'/>
      </Routes>
    </Router>
  );
}

export default App
