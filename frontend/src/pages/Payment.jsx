import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import PaymentForm from '../Components/Payment/PaymentForm';
import './CSS/Payment.css';

const Payment = () => {
  const { cartItems, products, getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Get shipping info from localStorage
  const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
  
  const calculateTotal = () => {
    const subtotal = getTotalCartAmount();
    const tax = subtotal * 0.18; // 18% GST
    return subtotal + tax;
  };

  const orderDetails = {
    customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
    customerEmail: 'customer@example.com', // Demo email
    total: calculateTotal().toFixed(2),
    items: cartItems.length
  };

  const handlePaymentSuccess = (paymentData) => {
    alert(`Payment Successful! Order ID: ${paymentData.orderId}`);
    // Clear cart and redirect
    localStorage.removeItem('shippingInfo');
    navigate('/');
  };

  if (showPaymentForm) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-content">
            <div className="payment-left">
              <div className="payment-header">
                <h1>Complete Your Payment</h1>
                <p>Secure checkout powered by Stripe</p>
              </div>
              <PaymentForm 
                orderDetails={orderDetails} 
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
            <div className="payment-right">
              <div className="order-review">
                <h3>Order Summary</h3>
                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>${getTotalCartAmount().toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax (18% GST):</span>
                    <span>${(getTotalCartAmount() * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>Total:</span>
                    <span>${orderDetails.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-left">
            <div className="payment-summary">
              <h2>Order Summary</h2>
        
        <div className="order-details">
          <div className="shipping-info">
            <h3>Shipping Information</h3>
            <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
            <p>{shippingInfo.address}</p>
            <p>{shippingInfo.district}, {shippingInfo.state} - {shippingInfo.pincode}</p>
            <p>Phone: {shippingInfo.phone}</p>
          </div>

          <div className="order-items">
            <h3>Items ({cartItems.length})</h3>
            {cartItems.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={index} className="order-item">
                  <img src={product.image} alt={product.name} />
                  <div className="item-details">
                    <p>{product.name}</p>
                    <p>Size: {item.size} | Qty: {item.quantity}</p>
                    <p>${(product.new_price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${getTotalCartAmount().toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (18% GST):</span>
              <span>${(getTotalCartAmount() * 0.18).toFixed(2)}</span>
            </div>
            <div className="total-row total-final">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

              <button 
                className="proceed-payment-btn"
                onClick={() => setShowPaymentForm(true)}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
          
          <div className="payment-right">
            <div className="order-review">
              <h3>Quick Summary</h3>
              <div className="order-totals">
                <div className="total-row">
                  <span>Items:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${getTotalCartAmount().toFixed(2)}</span>
                </div>
                <div className="total-row total-final">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
