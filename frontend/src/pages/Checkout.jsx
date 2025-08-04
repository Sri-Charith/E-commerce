import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './CSS/Checkout.css';

const Checkout = () => {
  const { cartItems, products, getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    state: '',
    district: '',
    pincode: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(shippingInfo.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.district.trim()) newErrors.district = 'District is required';
    if (!shippingInfo.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shippingInfo.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      // Store shipping info in localStorage for payment processing
      localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
      // Navigate to payment page
      navigate('/payment');
    }
  };

  const calculateOrderSummary = () => {
    const subtotal = getTotalCartAmount();
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateOrderSummary();

  return (
    <div className="checkout">
      <div className="checkout-container">
        <div className="checkout-left">
          <h2>Shipping Information</h2>
          <form className="shipping-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="district">District *</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={shippingInfo.district}
                  onChange={handleInputChange}
                  className={errors.district ? 'error' : ''}
                />
                {errors.district && <span className="error-message">{errors.district}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={shippingInfo.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode"
                className={errors.pincode ? 'error' : ''}
              />
              {errors.pincode && <span className="error-message">{errors.pincode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Complete Address *</label>
              <textarea
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                placeholder="House/Flat No., Street, Landmark"
                rows="3"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
          </form>
        </div>

        <div className="checkout-right">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="order-items">
              {cartItems.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                return (
                  <div key={index} className="order-item">
                    <img src={product.image} alt={product.name} />
                    <div className="item-details">
                      <h4>{product.name}</h4>
                      <p>Size: {item.size}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${product.new_price * item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="total-row">
                <span>Tax (18% GST):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="total-row total-final">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="proceed-payment-btn"
              onClick={handleProceedToPayment}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
