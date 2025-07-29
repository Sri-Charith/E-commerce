import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import cart_icon from '../assets/cart_icon.png';
import { ShopContext } from '../../context/ShopContextProvider'; // Make sure this path is correct


const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const navigate = useNavigate();
  const { cartItems } = useContext(ShopContext);

  // Updated cart count logic for new cartItems structure
  const totalItems = Object.values(cartItems).reduce((sum, sizeObj) => {
    if (typeof sizeObj === 'object' && sizeObj !== null) {
      return sum + Object.values(sizeObj).reduce((s, qty) => s + qty, 0);
    }
    return sum;
  }, 0);

  const handleLogin = () => {
    navigate('/login');
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
  <button onClick={handleLogin}>Login</button>

  <Link to="/cart">
    <div className="cart-icon-wrapper">
      <img src={cart_icon} alt="cart" />
      <div className="nav-cart-count">{totalItems}</div>
    </div>
  </Link>
</div>

      </div> 
    </div>   
  );
};

export default Navbar;
