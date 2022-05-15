import React, { useContext, useEffect, useState } from 'react';
import Context from '../state/context';
import { Text, Dialog, Input, Image, Avatar } from '@rneui/themed';
import useApi from '../utils/hooks/useApi';
import { View } from 'react-native';
import FetchSelect from '../components/FetchSelect';
import { api } from '../api';
import styles from '../styles/styles';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { DatePickerAndroidStatic } from 'react-native';
import getLocalDateTime from '../utils/getLocalDateTime';
import { Formik } from 'formik';
import { Icon } from '@rneui/themed';
import { Button } from 'react-native-paper';
import { Button as NativeButton } from 'react-native';
import request from '../utils/request';

const url = '/employees/by-berry-id';

const employeeColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Имя',
    type: 'text',
  },
};

const productColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  productName: {
    name: 'Имя',
    type: 'text',
  },
};

const NewPortion = ({
  berryId,
}) => {
  const { loading, data, fetchError } = useApi({ url }, { berryId });
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');

  const initialSelectsOpen = {
    employees: false,
    products: false,
  };

  const [selectsOpen, setSelectsOpen] = useState(initialSelectsOpen);
  
  const initialValues = {
    employeeId: null,
    productId: null,
    amount: '',
    dateTime: getLocalDateTime(),
  };

  const [values, setValues] = useState(initialValues);

  const { id } = data || {};

  useEffect(() => setValues(prevValues => ({
    ...prevValues,
    employeeId: id,
  })), [id]);

  const handleChange = fieldName => value => setValues(prevValues => ({
    ...prevValues,
    [fieldName]: typeof value === 'function' ? value() : value,
  }));

  const onChangeDateTimePicker = handleChange => (_, date) => {
    handleChange('dateTime')(date);
    console.log(date);
    setShowPicker(false);
  };

  const onDatePress = () => {
    setMode('date');
    setShowPicker(true); 
  };

  const onTimePress = () => {
    setMode('time');
    setShowPicker(true); 
  };

  const setSelectOpen = fieldName => open => setSelectsOpen({
    ...initialSelectsOpen,
    [fieldName]: open,
  });

  const onSubmit = () => {
    request({
      url: '/history',
      method: 'POST',
      body: {
        ...values,
        amount: parseFloat(values.amount),
      },
      callback: (status, response) => {
        if (status === 'ok') {
          // notification.open({
          //   type: 'success',
          //   title: 'Данные успешно записаны',
          // });
          // router.push('/observe');
        } else if (status === 'error') {
          // notification.open({
          //   type: status,
          //   title: response.message,
          // });
        }
      }
    });
  };
  
  return (
    <View style={styles.main}>
      <View style={styles.block}>
        {
          berryId && loading ? <Dialog.Loading /> : (
            <View style={styles.flexColumn}>
              <FetchSelect
                url="/employees"
                columns={employeeColumns}
                showInOption={['firstName', 'lastName']}
                onChange={handleChange('employeeId')}
                value={values.employeeId}
                open={selectsOpen.employees}
                setOpen={setSelectOpen('employees')}
                style={[styles.mb(5), styles.fetchSelect(selectsOpen.employees)]}
              />
              <FetchSelect
                url="/products"
                columns={productColumns}
                showInOption={['productName']}
                onChange={handleChange('productId')}
                value={values.productId}
                open={selectsOpen.products}
                setOpen={setSelectOpen('products')}
                style={[styles.mb(5), styles.fetchSelect(selectsOpen.products)]}
              />
              <Input
                placeholder="Количество (кг)"
                value={values.amount}
                keyboardType="number-pad"
                onChangeText={handleChange('amount')}
              />
              {
                showPicker && (
                  <RNDateTimePicker
                    testID="dateTimePicker"
                    value={values.dateTime}
                    mode={mode}
                    display="default"
                    is24Hour
                    onChange={onChangeDateTimePicker(handleChange)}
                    timeZoneOffsetInMinutes={0}
                  />
                )
              }
              <View style={[styles.dateTimeContainer, styles.mb(150)]}>
                <Button
                  onPress={onDatePress}
                  icon="calendar"
                  color="black"
                  mode="outlined"
                  style={styles.mb(10)}
                >
                  {values.dateTime.toDateString()}
                </Button>
                <Button
                  onPress={onTimePress}
                  icon="clock"
                  color="black"
                  mode="outlined"
                >
                  {`${values.dateTime.getUTCHours()}:${values.dateTime.getMinutes()}`}
                </Button>
              </View>
              <NativeButton
                onPress={onSubmit}
                title="Сохранить"
                style={styles.widthPercent(100)}
              />
            </View>
          )
        }
      </View>
    </View>
  );
};

export default NewPortion;
