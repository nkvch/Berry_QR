//import { API } from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageLib from '@react-native-async-storage/async-storage';

import { api as apiUrl } from '../api';

const request = async obj => {
  const { url, method, body, searchParams, callback, withFiles } = obj;

  if (!url) {
    return null;
  }

  let urlWithParams;
  const requestOptions = {
    method: method || 'GET',
    body: withFiles ? body : JSON.stringify(body),
    headers: {
      ...(!withFiles && {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    },
  };

  const token = await AsyncStorageLib.getItem('jwt');

  if (token) {
    requestOptions.headers.Authorization = `Bearer ${token}`;
  }

  if (searchParams) {
    const params = new URLSearchParams(searchParams);

    urlWithParams = `${url}?${params.toString()}`;
  }

  const fetchUrl = apiUrl + '/api' + (urlWithParams || url);

  return fetch(fetchUrl, requestOptions)
    .then(response => response.json())
    .then(({ status, ...data }) => {
      callback(status, data);

      return data;
    })
    .catch(ex => {
      if (typeof callback === 'function') {
        callback('error', ex);
      }
    });
};

export default request;
