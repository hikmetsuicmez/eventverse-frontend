import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Favorites from '../pages/Favorites';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import EventForm from '../components/EventForm';
import EventDetail from '../pages/EventDetail';
import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Settings from '../pages/Settings';

// Korumalı Route bileşeni
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Public Route bileşeni (giriş yapmış kullanıcıları dashboard'a yönlendirir)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <EventForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AppRoutes; 