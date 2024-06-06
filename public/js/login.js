/* eslint-disable */
import axios from 'axios';

import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8888/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login successfully!');
      setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.msg);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('http://localhost:8888/api/v1/users/logout');
    if (res.data.status === 'success') {
      showAlert('success', 'Logout successfully!');
      setTimeout(() => {
        // location.reload(true);
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.msg);
  }
};
