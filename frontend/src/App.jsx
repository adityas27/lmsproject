import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/Login";
import Signup from './components/Signup';
import StudentDashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import PrivateRoute from './PrivateRoute';
import "./index.css";
import EditProfile from './components/EditProfile';
import CourseList from './components/Courses/CourseList';
import CourseDetails from './components/Courses/CourseDetails';
import ModuleContentDetail from './components/Courses/ModuleContent';
import AddModuleForm from './components/Courses/AddModuleForm';
import AddModuleContent from './components/Courses/AddModuleContent';
import EditModule from './components/Courses/EditModule';
import AddCourseForm from './components/Courses/AddCourse';
import Profile from './components/Profile';
import PendingCertificates from './components/PendingCert';
import AssignmentPanel from './components/Courses/AssignmentPanel';
import ModuleDetails from './components/Courses/ModuleDetails';
import Footer from './components/Footer';
import AdminPanelTabs from './components/Admin/AdminPanel';
import SearchCourse from './components/Courses/Search';
import ApplyTeacher from './components/Admin/ApplyTeacher'
import NotFoundPage from './components/404';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="" element={<CourseList />} />
        <Route path="/apply/teacher" element={
          <PrivateRoute>
            <ApplyTeacher />
          </PrivateRoute>
        } />
        <Route path="/courses/:slug" element={
          <PrivateRoute>
            <CourseDetails />
          </PrivateRoute>
        } />
        <Route path="/search" element={<SearchCourse />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <StudentDashboard />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
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

        <Route path="/pending/certificates/applications/" element={
          <PrivateRoute>
            <PendingCertificates />
          </PrivateRoute>
        } />

        <Route path="/courses/:slug/add-module" element={
          <PrivateRoute>
            <AddModuleForm />
          </PrivateRoute>
        } />
        <Route path="/modules/:slug/edit" element={
          <PrivateRoute>
            <EditModule />
          </PrivateRoute>
        } />
        <Route path="/courses/:courseSlug/modules/:moduleSlug/add-content" element={
          <PrivateRoute>
            <AddModuleContent />
          </PrivateRoute>
        } />
        <Route path="/courses/add-new" element={
          <PrivateRoute>
            <AddCourseForm />
          </PrivateRoute>
        } />
        <Route path="/module/:moduleId/assignment/:assignmentId/" element={
          <PrivateRoute>
            <AssignmentPanel />
          </PrivateRoute>
        } />
        <Route path="/module/:slug" element={
          <PrivateRoute>
            <ModuleDetails />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminPanelTabs />
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFoundPage />} /> {/* This catches all undefined routes */}
      </Routes>
      
      <Footer />
    </Router>
  );
}

export default App;
