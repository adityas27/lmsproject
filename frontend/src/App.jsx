import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/Login";
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import PrivateRoute from './PrivateRoute';
import "./index.css";
import EditProfile from './components/EditProfile';
import CourseList from './components/Courses/CourseList';
import CourseDetails from './components/Courses/CourseDetails';
import ModuleContentDetail from './components/Courses/ModuleContent';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:slug" element={<CourseDetails />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/edit_profile" element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        } />

        <Route path="/module-contents/:id" element={
          <PrivateRoute>
            <ModuleContentDetail />
          </PrivateRoute>
          } />

      </Routes>
    </Router>
  );
}

export default App;
