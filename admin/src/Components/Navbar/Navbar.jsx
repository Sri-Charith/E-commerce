import React from 'react'
import './Navbar.css'
import navlogo from '../Assets/nav-logo.svg'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className='nav-left'>
        <img src={navlogo} className='nav-logo' alt="" />
        <span className='nav-title'>Admin Panel</span>
      </div>
      
      <div className='nav-right'>
        <div className='user-info'>
          <span className='welcome-text'>Welcome, Admin</span>
        </div>
      </div>
    </div>
  )
}

export default Navbar
