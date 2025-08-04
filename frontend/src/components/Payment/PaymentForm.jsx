import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { ShopContext } from '../../Context/ShopContext';
import './PaymentForm.css';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51QVvQHCFGGKhLBjK_your_publishable_key_here');

const CheckoutForm = ({ shippingInfo, totalAmount, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, products } = useContext(ShopContext);
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
      // Create payment intent on backend
      const response = await fetch('http://localhost:4000/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'usd',
          shippingInfo: shippingInfo,
          cartItems: cartItems
        })
      });

      const { clientSecret, paymentIntentId } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: JSON.parse(localStorage.getItem('user'))?.email || '',
            phone: shippingInfo.phone,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.district,
              state: shippingInfo.state,
              postal_code: shippingInfo.pincode,
              country: 'IN'
            }
          }
        }
      });

      if (error) {
        setPaymentError(error.message);
        onPaymentError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const confirmResponse = await fetch('http://localhost:4000/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            shippingInfo: shippingInfo,
            cartItems: cartItems,
            totalAmount: totalAmount
          })
        });

        const confirmData = await confirmResponse.json();

        if (confirmData.success) {
          onPaymentSuccess(paymentIntent.id);
        } else {
          setPaymentError('Payment succeeded but order creation failed');
          onPaymentError('Payment succeeded but order creation failed');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
      onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-section">
        <h3>Payment Information</h3>
        
        <div className="card-element-container">
          <label htmlFor="card-element">Credit or Debit Card</label>
          <CardElement
            id="card-element"
            options={cardElementOptions}
            className="card-element"
          />
        </div>

        {paymentError && (
          <div className="payment-error">
            {paymentError}
          </div>
        )}

        <div className="payment-summary">
          <div className="summary-row">
            <span>Total Amount:</span>
            <span className="amount">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`pay-button ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
        </button>

        <div className="payment-security">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </div>
    </form>
  );
};

const PaymentForm = ({ shippingInfo, totalAmount, onPaymentSuccess, onPaymentError }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        shippingInfo={shippingInfo}
        totalAmount={totalAmount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default PaymentForm;
