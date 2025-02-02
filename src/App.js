import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Events from './pages/Events';
import EventForm from './components/EventForm';
import EventDetail from './pages/EventDetail';
import Favorites from './pages/Favorites';
import UpdateEvent from './pages/UpdateEvent';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: '#0A1929'
          }}>
            <Navbar />
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/users/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
                <Route path="/events/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
                <Route path="/events/:id/edit" element={<PrivateRoute><UpdateEvent /></PrivateRoute>} />
                <Route path="/create-event" element={<PrivateRoute><EventForm /></PrivateRoute>} />
                <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
              </Routes>
            </Box>
            <Footer />
            <Toaster position="top-right" />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
