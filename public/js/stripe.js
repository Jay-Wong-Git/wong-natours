/* eslint-disable */
import axios from 'axios';

import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51POuYa03zvd0O8GdWddZ1myIwZPLRJR79aYouFuYRqZZnNRdx0mFMRIiYvTj7TNKuGNqX87EHcJWAKPUtMqW4w9D005G5ZQnMC',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const res = await axios(
      `http://127.0.0.1:8888/api/v1/bookings/checkout-session/${tourId}`,
    );
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: res.data.session.id });
  } catch (err) {
    showAlert('error', err.response.data.msg);
  }
};
