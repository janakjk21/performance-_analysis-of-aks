import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContactList from "./ContactList";
import ContactForm from "./ContactForm";
import ImageSearch from "./ImageSearch";
import MainDashboard from "./searchfeatures/Maindashboard";
import Login from "./auth/login";
import Register from "./auth/register";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard></MainDashboard>} />
        <Route path="/create" element={<ContactForm />} />
        <Route path="/search-images" element={<ImageSearch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />      </Routes>
    </Router>
  );
}

export default App;