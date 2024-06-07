/* eslint-disable */
import axios from 'axios';

import { showAlert } from './alert';

// type: password, data
export const updateSettings = async (type, data) => {
  try {
    const path = `http://127.0.0.1:8888/api/v1/users/${type === 'data' ? 'updateMe' : 'updateMyPassword'}`;
    const res = await axios.patch(path, data);

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type === 'data' ? 'User data' : 'Password'} updated!`,
      );
      setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.msg);
  }
};
