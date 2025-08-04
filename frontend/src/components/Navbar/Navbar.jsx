import React, { useContext, useRef, useState, useEffect } from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { ShopContext } from '../../Context/ShopContext'
import nav_dropdown from '../Assets/nav_dropdown.png'

const Navbar = () => {

  let [menu,setMenu] = useState("shop");
  const {getTotalCartItems} = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuRef = useRef();

  useEffect(() => {
    // Check if user is logged in and get user info
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.replace("/");
  }

  return (
    <div className='nav'>
      <Link to='/' style={{ textDecoration: 'none' }} className="nav-logo">
        <img src={logo} alt="logo" />
        <p>SHOPPER</p>
      </Link>
      <img onClick={dropdown_toggle} className='nav-dropdown' src={nav_dropdown} alt="" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={()=>{setMenu("shop")}}><Link to='/' style={{ textDecoration: 'none' }}>Shop</Link>{menu==="shop"?<hr/>:<></>}</li>
        <li onClick={()=>{setMenu("mens")}}><Link to='/mens' style={{ textDecoration: 'none' }}>Men</Link>{menu==="mens"?<hr/>:<></>}</li>
        <li onClick={()=>{setMenu("womens")}}><Link to='/womens' style={{ textDecoration: 'none' }}>Women</Link>{menu==="womens"?<hr/>:<></>}</li>
        <li onClick={()=>{setMenu("kids")}}><Link to='/kids' style={{ textDecoration: 'none' }}>Kids</Link>{menu==="kids"?<hr/>:<></>}</li>
        {user && user.role === 'admin' && (
          <li className="admin-menu-item">
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                font: 'inherit', 
                cursor: 'pointer',
                textDecoration: 'none',
                padding: 0
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenu("admin");
                
                // Get current auth data
                const token = localStorage.getItem('auth-token');
                const userData = localStorage.getItem('user');
                
                if (token && userData) {
                  // Create a URL with auth data as query parameters
                  const adminUrl = 'http://localhost:3001';
                  const authParams = new URLSearchParams({
                    token: token,
                    user: userData
                  });
                  const fullUrl = `${adminUrl}?${authParams.toString()}`;
                  
                  const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer');
                  if (!newWindow) {
                    // Fallback if popup blocked
                    window.location.href = fullUrl;
                  }
                } else {
                  // No auth data, redirect to login
                  alert('Please login first to access admin panel');
                  window.location.href = '/login';
                }
              }}
            >
              🔧 Admin Panel
            </button>
            {menu==="admin"?<hr/>:<></>}
          </li>
        )}
      </ul>
      <div className="nav-login-cart">
        {user ? (
          <div className="user-section">
            <div className="user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
              <span className="user-avatar">{user.role === 'admin' ? '👨‍💼' : '👤'}</span>
              <span className="user-name">{user.name}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-details">
                  <p><strong>{user.name}</strong></p>
                  <p className="user-role">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                  <p className="user-email">{user.email}</p>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to='/login' style={{ textDecoration: 'none' }}>
            <button className="login-btn">Login</button>
          </Link>
        )}
        <Link to="/cart"><img src={cart_icon} alt="cart"/></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  )
}

export default Navbar
