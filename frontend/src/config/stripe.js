import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51RuD9vJNfOEP5jeYojYqwVOcbZ5kx3D3ViVlhQ5xIh4PGuYnFOiWvn8kD8teSywFvU0vbsfkMxsq8EPT80cw7ADv00WwTmitgF');

export default stripePromise;
