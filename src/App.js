import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
