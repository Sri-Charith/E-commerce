import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../../config/stripe';
import './PaymentForm.css';

const CheckoutForm = ({ orderDetails, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
        },
      });

      if (error) {
        setPaymentError(error.message);
        setIsProcessing(false);
        return;
      }

      // Simulate successful payment for demo purposes
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess({
          paymentMethodId: paymentMethod.id,
          orderId: 'ORDER_' + Date.now(),
          amount: orderDetails.total
        });
      }, 2000);

    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-section">
        <h3>Payment Information</h3>
        
        <div className="payment-info">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
        
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        {paymentError && (
          <div className="payment-error">
            {paymentError}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="pay-button"
        >
          {isProcessing ? '⏳ Processing...' : `💳 Pay $${orderDetails.total}`}
        </button>
        
        <div className="security-badges">
          <div className="security-badge">
            <span>🔒</span>
            <span>SSL Secured</span>
          </div>
          <div className="security-badge">
            <span>🛡️</span>
            <span>Stripe Protected</span>
          </div>
          <div className="security-badge">
            <span>✅</span>
            <span>PCI Compliant</span>
          </div>
        </div>
      </div>
    </form>
  );
};

const PaymentForm = ({ orderDetails, onPaymentSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm orderDetails={orderDetails} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
};

export default PaymentForm;
