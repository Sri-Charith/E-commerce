import React, { useState, useEffect } from 'react';
import './AdminAuth.css';

const AdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    // First check for auth data in URL parameters (from frontend redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUser = urlParams.get('user');
    
    console.log('AdminAuth Debug - URL params:', {
      urlToken: urlToken ? 'exists' : 'missing',
      urlUser: urlUser ? 'exists' : 'missing'
    });
    
    if (urlToken && urlUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser));
        console.log('Parsed URL user data:', parsedUser);
        
        // Only accept admin users
        if (parsedUser.role === 'admin') {
          // Store in localStorage for future use
          localStorage.setItem('auth-token', urlToken);
          localStorage.setItem('user', urlUser);
          
          // Clean up URL parameters
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          console.log('Admin authentication successful from URL');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } else {
          console.log('URL user is not admin:', parsedUser.role);
        }
      } catch (error) {
        console.error('Error parsing URL auth data:', error);
      }
    }
    
    // Check for auth token and user data in localStorage
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    console.log('AdminAuth Debug - localStorage:', {
      token: token ? 'exists' : 'missing',
      userData: userData ? 'exists' : 'missing',
      rawUserData: userData
    });

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);
        console.log('User role:', user.role);
        
        // Check if user is admin
        if (user.role === 'admin') {
          console.log('Admin authentication successful');
          setIsAuthenticated(true);
        } else {
          console.log('User is not admin, role:', user.role);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
      }
    } else {
      console.log('Missing token or user data');
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  };

  const redirectToFrontend = () => {
    window.location.href = 'http://localhost:3000/login';
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">🔒</div>
          <h1>Access Restricted</h1>
          <p>This admin panel can only be accessed through the main website.</p>
          <p>Please log in as an admin user first.</p>
          <button onClick={redirectToFrontend} className="redirect-btn">
            Go to Main Website
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminAuth;
