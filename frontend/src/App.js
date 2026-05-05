import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicLayout from "@/components/PublicLayout";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Admissions from "@/pages/Admissions";
import Faculty from "@/pages/Faculty";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Alumni from "@/pages/Alumni";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Placements from "@/pages/Placements";
import Projects from "@/pages/Projects";
import AdminDashboard from "@/pages/AdminDashboard";
import FacultyDashboard from "@/pages/FacultyDashboard";
import StudentDashboard from "@/pages/StudentDashboard";

function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/courses" element={<Courses />} />
                            <Route path="/courses/:code" element={<CourseDetail />} />
                            <Route path="/admissions" element={<Admissions />} />
                            <Route path="/faculty" element={<Faculty />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/events/:id" element={<EventDetail />} />
                            <Route path="/alumni" element={<Alumni />} />
                            <Route path="/placements" element={<Placements />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                        </Route>

                        <Route path="/admin/*" element={
                            <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
                        } />
                        <Route path="/faculty-dashboard/*" element={
                            <ProtectedRoute roles={["faculty", "admin"]}><FacultyDashboard /></ProtectedRoute>
                        } />
                        <Route path="/student-dashboard/*" element={
                            <ProtectedRoute roles={["student", "admin"]}><StudentDashboard /></ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}

export default App;
