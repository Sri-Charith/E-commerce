import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, shippingInfo, orderTotal } = location.state || {};

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    // Navigate to orders page (you can implement this later)
    alert('Orders page coming soon!');
  };

  if (!orderId) {
    return (
      <div className="payment-success-page">
        <div className="success-container">
          <div className="error-message">
            <h2>Order information not found</h2>
            <p>Please contact support if you completed a payment.</p>
            <button onClick={handleContinueShopping} className="continue-button">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">
            <div className="checkmark">✓</div>
          </div>
          
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Thank you for your order. Your payment has been processed successfully.
          </p>

          <div className="order-details">
            <div className="detail-card">
              <h3>Order Information</h3>
              <div className="detail-row">
                <span>Order ID:</span>
                <span className="order-id">{orderId}</span>
              </div>
              <div className="detail-row">
                <span>Total Amount:</span>
                <span className="amount">${orderTotal?.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span>Payment Status:</span>
                <span className="status paid">Paid</span>
              </div>
            </div>

            {shippingInfo && (
              <div className="detail-card">
                <h3>Shipping Address</h3>
                <div className="shipping-info">
                  <p><strong>{shippingInfo.firstName} {shippingInfo.lastName}</strong></p>
                  <p>{shippingInfo.phone}</p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.district}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                </div>
              </div>
            )}
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <div className="steps-grid">
              <div className="step">
                <div className="step-icon">📧</div>
                <h4>Confirmation Email</h4>
                <p>You'll receive an order confirmation email shortly</p>
              </div>
              <div className="step">
                <div className="step-icon">📦</div>
                <h4>Processing</h4>
                <p>Your order will be processed within 1-2 business days</p>
              </div>
              <div className="step">
                <div className="step-icon">🚚</div>
                <h4>Shipping</h4>
                <p>You'll receive tracking information once shipped</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={handleContinueShopping} className="continue-button">
              Continue Shopping
            </button>
            <button onClick={handleViewOrders} className="orders-button">
              View Orders
            </button>
          </div>

          <div className="support-info">
            <p>Need help? Contact our support team at <strong>support@yourstore.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
