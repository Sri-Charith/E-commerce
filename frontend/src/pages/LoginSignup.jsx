import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {

  const [state,setState] = useState("Login");
  const [loginType, setLoginType] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [formData,setFormData] = useState({username:"",email:"",password:""});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const changeHandler = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
    }

  const login = async () => {
    // Validate form data
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const dataObj = await response.json();
      console.log('Login response:', dataObj);
      
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        localStorage.setItem('user', JSON.stringify(dataObj.user));
        
        // Role-based redirect
        if (loginType === "admin") {
          if (dataObj.user.role === "admin") {
            // Redirect to admin panel
            window.location.href = "http://localhost:3000";
          } else {
            alert("Access denied. Admin privileges required.");
          }
        } else {
          // Regular user login - stay on shopping site
          window.location.replace("/");
        }
      } else {
        alert(dataObj.errors || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  }

  const signup = async () => {
    // Validate form data
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const signupData = {
        ...formData,
        role: state === "Admin Signup" ? "admin" : "user"
      };
      
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });
      
      const dataObj = await response.json();
      console.log('Signup response:', dataObj);
      
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        localStorage.setItem('user', JSON.stringify(dataObj.user));
        
        // Role-based redirect for signup
        if (dataObj.user.role === "admin") {
          window.location.href = "http://localhost:3000";
        } else {
          window.location.replace("/");
        }
      } else {
        alert(dataObj.errors || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  }

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <div className="loginsignup-header">
          <h1>{state}</h1>
          <p>Welcome back! Please sign in to your account</p>
        </div>

        {/* Signup Type Selection */}
        {(state === "Sign Up" || state === "Admin Signup") && (
          <div className="signup-type-selector">
            <div className="signup-type-buttons">
              <button 
                className={`type-btn ${state === "Sign Up" ? "active" : ""}`}
                onClick={() => setState("Sign Up")}
              >
                <span className="label">User Signup</span>
                <small>Create customer account</small>
              </button>
              <button 
                className={`type-btn ${state === "Admin Signup" ? "active" : ""}`}
                onClick={() => setState("Admin Signup")}
              >
                <span className="label">Admin Signup</span>
                <small>Create admin account</small>
              </button>
            </div>
          </div>
        )}

        {/* Role Selection for Login */}
        {state === "Login" && (
          <div className="login-type-selector">
            <h3>Select Login Type</h3>
            <div className="login-type-buttons">
              <button 
                className={`type-btn ${loginType === "user" ? "active" : ""}`}
                onClick={() => setLoginType("user")}
              >
                <span className="label">Customer</span>
                <small>Shop & Browse Products</small>
              </button>
              <button 
                className={`type-btn ${loginType === "admin" ? "active" : ""}`}
                onClick={() => setLoginType("admin")}
              >
                <span className="label">Admin</span>
                <small>Manage Products & Orders</small>
              </button>
            </div>
          </div>
        )}
        
        <div className="loginsignup-fields">
          {(state==="Sign Up" || state==="Admin Signup") && (
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Your full name" 
                name="username" 
                value={formData.username} 
                onChange={changeHandler}
                required
              />
            </div>
          )}
          
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email address" 
              name="email" 
              value={formData.email} 
              onChange={changeHandler}
              required
            />
          </div>
          
          <div className="input-group password-group">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              name="password" 
              value={formData.password} 
              onChange={changeHandler}
              required
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <button 
          className="continue-btn"
          onClick={()=>{state==="Login"?login():signup()}}
        >
          {state === "Login" ? 
            `Sign In as ${loginType === "admin" ? "Admin" : "Customer"}` : 
            state === "Admin Signup" ? "Create Admin Account" : "Create Account"
          }
        </button>

        <div className="loginsignup-switch">
          {state==="Login"?
          <p>Don't have an account? <span onClick={()=>{setState("Sign Up")}}>Sign up here</span></p>
          :(state==="Sign Up" || state==="Admin Signup")?
          <p>Already have an account? <span onClick={()=>{setState("Login")}}>Sign in here</span></p>
          :<p>Already have an account? <span onClick={()=>{setState("Login")}}>Sign in here</span></p>}
        </div>

        {/* Demo Credentials */}
        {state === "Login" && loginType === "admin" && (
          <div className="demo-credentials">
            <h4>🔑 Demo Admin Credentials</h4>
            <p><strong>Email:</strong> admin@ecommerce.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        )}

        <div className="loginsignup-agree">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <label htmlFor="terms">
            By continuing, I agree to the terms of use & privacy policy.
          </label>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
