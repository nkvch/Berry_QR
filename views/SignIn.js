import React, { useContext, useState } from 'react';
import { View, Text } from 'react-native';
// import { Input, Button } from 'react-native-elements';
import { Input, Button } from '@rneui/themed';
import styles from '../styles/styles';
import request from '../utils/request';
import { Formik } from 'formik';
import Context from '../state/context';

const url = '/users';

const SignIn = () => {
  const { login } = useContext(Context);

  const initialValues = {
    username: '',
    password: '',
  };

  const onSubmit = values => {
    request({
      url: '/auth',
      method: 'POST',
      body: values,
      callback: (status, response) => {
        if (status === 'ok') {
          const { token, ...user } = response.data;
          console.log({ token, ...user });

          login(token, user);
        } else if (status === 'error') {
          console.log(response);
        }
      }
    });
  };

  return (
    <Formik
      {...{
        initialValues,
        onSubmit,
      }}>
      {
        ({ handleChange, handleBlur, handleSubmit, values }) => (
            <View style={styles.main}>
              <View style={styles.block}>
                <Input
                  placeholder='Имя пользователя'
                  value={values.username}
                  onBlur={handleBlur('username')}
                  onChangeText={handleChange('username')}
                />
                <Input
                  placeholder='Пароль'
                  value={values.password}
                  secureTextEntry
                  onBlur={handleBlur('password')}
                  onChangeText={handleChange('password')}
                />
                <Button
                  title="Войти"
                  onPress={handleSubmit}
                />
              </View>
            </View>
          )
      }
    </Formik>
  );
};

export default SignIn;

