import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  successUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app/premium?success=true'
    : 'http://localhost:5001/premium?success=true',
  cancelUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.vercel.app/premium?canceled=true' 
    : 'http://localhost:5001/premium?canceled=true',
};

// Product configurations
export const STRIPE_PRODUCTS = {
  consultation: {
    name: 'Attorney Consultation',
    description: '30-minute consultation with a licensed NY attorney',
    price: 14900, // $149.00 in cents
  },
  full_service: {
    name: 'Full Legal Service',
    description: 'Complete document preparation and legal assistance',
    price: 29900, // $299.00 in cents
  },
}; 