import React, { useContext } from 'react';
import Context from '../state/context';
import { Text, Dialog, Input, Image, Avatar } from '@rneui/themed';
import useApi from '../utils/hooks/useApi';
import { View } from 'react-native';
import FetchSelect from '../components/FetchSelect';
import { api } from '../api';
import styles from '../styles/styles';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import getLocalDateTime from '../utils/getLocalDateTime';
import { Formik } from 'formik';

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
  console.log(berryId);
  const { loading, data, fetchError } = useApi({ url }, { berryId });

  const { id, firstName, lastName, photoPath } = data || {};

  const initialValues = {
    employeeId: id || '',
    productId: '',
    amount: 0,
    dateTime: getLocalDateTime(),
  };

  console.log(initialValues);

  const onSubmit = () => {};
  
  return (
    <Formik
      {...{
        initialValues,
        onSubmit,
      }}
    >
    {
      ({ handleChange, handleSubmit, handleBlur, values }) => (
        <View style={styles.main}>
          <View style={styles.block}>
            {
              loading ? <Dialog.Loading /> : null
            }
            <View style={styles.flexColumn}>
              <FetchSelect
                url="/employees"
                columns={employeeColumns}
                onChange={handleChange('employeeId')}
                value={values.employeeId}
              />
              <FetchSelect
                url="/products"
                columns={productColumns}
                onChange={handleChange('productId')}
                value={values.productId}
              />
              <Input
                placeholder="Количество"
                value={values.amount}
                onChangeText={handleChange('amount')}
              />
              <RNDateTimePicker
                value={values.dateTime}
                onChange={(_, date) => handleChange('dateTime')(date)}
              />
            </View>
          </View>
        </View>
      )
    }
    </Formik>
  );
};

export default NewPortion;
