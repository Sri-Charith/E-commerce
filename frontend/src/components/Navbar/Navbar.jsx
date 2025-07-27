import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- import useNavigate
import './Navbar.css';
import logo from '../assets/logo.png';
import cart_icon from '../assets/cart_icon.png';

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const navigate = useNavigate(); // <-- initialize navigate

  const handleLogin = () => {
    navigate('/login'); // <-- navigate to login page
  };

  return (
    <div className='navbar-container'>
      <div className='navbar'>
        <div className='nav-logo'>
          <img src={logo} alt="logo" />
          <p>SHOPPER</p>
        </div>

        <ul className='nav-menu'>
          <li onClick={() => setMenu("shop")}>
            <Link to='/'>Shop</Link>
            {menu === "shop" && <hr />}
          </li>
          <li onClick={() => setMenu("mens")}>
            <Link to='/mens'>Men</Link>
            {menu === "mens" && <hr />}
          </li>
          <li onClick={() => setMenu("womens")}>
            <Link to='/womens'>Women</Link>
            {menu === "womens" && <hr />}
          </li>
          <li onClick={() => setMenu("kids")}>
            <Link to='/kids'>Kids</Link>
            {menu === "kids" && <hr />}
          </li>
        </ul>

        <div className="nav-login-cart">
          <button onClick={handleLogin}>Login</button> {/* updated here */}

          <div className="cart-icon-wrapper">
            <img src={cart_icon} alt="cart" />
            <div className="nav-cart-count">0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
