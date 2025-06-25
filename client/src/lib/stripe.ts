import { loadStripe } from '@stripe/stripe-js';

// Get publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RYyBO04uCBKkJtweqRQH19acbABDnlarnrSoRBG9vUq05xd2M3SAtsQV1t19oxoyePD3ekkUvPu0K855IINub6200tjSykymw';

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey);

// Payment utilities
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw error;
  }
};

// Product types for TypeScript
export type StripeProductType = 'consultation' | 'full_service';

export interface StripeCheckoutData {
  productType: StripeProductType;
  eligibilityType?: string;
  userComplexity?: 'simple' | 'moderate' | 'complex';
} 