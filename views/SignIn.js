import React, { useContext, useState } from 'react';
import { View, Text } from 'react-native';
// import { Input, Button } from 'react-native-elements';
import { Input } from '@rneui/themed';
import styles from '../styles/styles';
import request from '../utils/request';
import { Formik } from 'formik';
import Context from '../state/context';
import { Button } from 'react-native';
import Form from '../components/Form';

const fieldsData = {
  username: {
    label: 'Имя пользователя',
    type: 'text',
  },
  password: {
    label: 'Пароль',
    type: 'password',
  },
};
const SignIn = () => {
  const { login } = useContext(Context);

  const onSubmit = values => {
    request({
      url: '/auth',
      method: 'POST',
      body: values,
      callback: (status, response) => {
        if (status === 'ok') {
          const { token, ...user } = response.data;

          login(token, user);
        } else if (status === 'error') {
          console.log(response);
        }
      }
    });
  };

  return (
    <View style={styles.main}>
      <View style={styles.block}>
        <Form
          onSubmit={onSubmit}
          submitText="Войти"
          fieldsData={fieldsData}
        />
      </View>
    </View>
  );
};

export default SignIn;

