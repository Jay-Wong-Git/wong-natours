/* eslint-disable */
// import '@babel/polyfill';

import { login, logout } from './login';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { updateSettings } from './updateSettings';

const loginForm = document.querySelector('.form--login');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

const logoutButton = document.querySelector('.nav__el--logout');
if (logoutButton) {
  logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

const userDataForm = document.querySelector('.form-user-data');
if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--update-data').textContent = 'Updating...';
    document.querySelector('.btn--update-data').disabled = true;

    const form = new FormData();
    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);
    await updateSettings('data', form);

    document.querySelector('.btn--update-data').textContent = 'Save settings';
    document.querySelector('.btn--update-data').disabled = false;
  });
}

const userPasswordForm = document.querySelector('.form-user-password');
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--update-password').textContent = 'Updating...';
    document.querySelector('.btn--update-password').disabled = true;
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings('password', {
      passwordCurrent,
      password,
      passwordConfirm,
    });
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--update-password').textContent =
      'Save password';
    document.querySelector('.btn--update-password').disabled = false;
  });
}

const bookTourButton = document.getElementById('btn-book-tour');
if (bookTourButton) {
  bookTourButton.addEventListener('click',async (e) => {
    // e.preventDefault();
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
  });
}
