import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ContactList from "./ContactList";
import ContactForm from "./ContactForm";
import ImageSearch from "./ImageSearch";
import MainDashboard from "./searchfeatures/Maindashboard";
import Login from "./auth/login";
import Register from "./auth/register";

function PrivateRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load token on app start
    const session = localStorage.getItem("session_data");
    if (session) {
      const { access_token, expires_at } = JSON.parse(session);
      const isExpired = new Date(expires_at) < new Date();

      if (access_token && !isExpired) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("session_data");
        setIsAuthenticated(false);
      }
    }
    console.log("Session loaded:", session);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <MainDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <ContactForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/search-images"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <ImageSearch />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
