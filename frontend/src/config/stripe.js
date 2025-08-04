import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51QVvQHCFGGKhLBjKYour_publishable_key_here');

export default stripePromise;
