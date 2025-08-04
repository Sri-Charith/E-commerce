import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import PaymentForm from '../Components/Payment/PaymentForm';
import './CSS/Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, products, getTotalCartAmount } = useContext(ShopContext);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, error
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    // Get shipping info from localStorage
    const savedShippingInfo = localStorage.getItem('shippingInfo');
    
    if (!savedShippingInfo) {
      alert('Shipping information not found. Please go back to checkout.');
      navigate('/checkout');
      return;
    }

    // Check if user is logged in
    const authToken = localStorage.getItem('auth-token');
    if (!authToken) {
      alert('Please login to continue with payment.');
      navigate('/login');
      return;
    }

    // Check if cart is not empty
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty!');
      navigate('/cart');
      return;
    }

    setShippingInfo(JSON.parse(savedShippingInfo));
  }, [navigate, cartItems]);

  const calculateOrderSummary = () => {
    const subtotal = getTotalCartAmount();
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  };

  const handlePaymentSuccess = (paymentIntentId) => {
    setPaymentStatus('success');
    setPaymentMessage(`Payment successful! Order ID: ${paymentIntentId}`);
    
    // Clear shipping info from localStorage
    localStorage.removeItem('shippingInfo');
    
    // Redirect to success page after 3 seconds
    setTimeout(() => {
      navigate('/payment-success', { 
        state: { 
          orderId: paymentIntentId,
          shippingInfo: shippingInfo,
          orderTotal: calculateOrderSummary().total
        }
      });
    }, 3000);
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('error');
    setPaymentMessage(`Payment failed: ${error}`);
  };

  if (!shippingInfo) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment information...</p>
      </div>
    );
  }

  const { subtotal, shipping, tax, total } = calculateOrderSummary();

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Your Payment</h1>
          <p>Review your order and enter payment details</p>
        </div>

        <div className="payment-content">
          <div className="payment-left">
            {paymentStatus === 'pending' && (
              <PaymentForm
                shippingInfo={shippingInfo}
                totalAmount={total}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}

            {paymentStatus === 'success' && (
              <div className="payment-success">
                <div className="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                <p>{paymentMessage}</p>
                <p>Redirecting to confirmation page...</p>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="payment-error">
                <div className="error-icon">❌</div>
                <h3>Payment Failed</h3>
                <p>{paymentMessage}</p>
                <button 
                  onClick={() => setPaymentStatus('pending')}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="payment-right">
            <div className="order-review">
              <h3>Order Summary</h3>
              
              <div className="shipping-details">
                <h4>Shipping Address</h4>
                <p><strong>{shippingInfo.firstName} {shippingInfo.lastName}</strong></p>
                <p>{shippingInfo.phone}</p>
                <p>{shippingInfo.address}</p>
                <p>{shippingInfo.district}, {shippingInfo.state} - {shippingInfo.pincode}</p>
              </div>

              <div className="order-items">
                <h4>Items ({cartItems.length})</h4>
                {cartItems.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <div key={index} className="order-item">
                      <img src={product.image} alt={product.name} />
                      <div className="item-details">
                        <h5>{product.name}</h5>
                        <p>Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        ${(product.new_price * item.quantity).toFixed(2)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
