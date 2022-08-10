import React, { useContext, useEffect, useState } from 'react';
import Context from '../state/context';
import { Text, Dialog, Input, Image, Avatar } from '@rneui/themed';
import useApi from '../utils/hooks/useApi';
import { Alert, View } from 'react-native';
import styles from '../styles/styles';
import request from '../utils/request';
import Form from '../components/Form';
import useUser from '../utils/hooks/useUser';

const url = '/employees/by-berry-id';

const employeeColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Photo',
    type: 'image',
  },
  firstName: {
    name: 'First name',
    type: 'text',
  },
  lastName: {
    name: 'Last name',
    type: 'text',
  },
};

const productColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Photo',
    type: 'image',
  },
  productName: {
    name: 'Product name',
    type: 'text',
  },
};

const NewPortion = ({
  berryId,
}) => {
  const { loading, data, fetchError } = useApi({ url }, { berryId });
  const [saving, setSaving] = useState(false);
  const me = useUser();

  const getFieldsData = data => ({
    employeeId: {
      label: 'Choose employee',
      type: 'fetch-select',
      fetchSelectConfig: {
        url: '/employees',
        columns: employeeColumns,
        showInOption: ['firstName', 'lastName'],
        icon: 'photoPath',
        returnValue: 'id',
        ...(me.role === 'foreman' && {
          customFilters: {
            foremanId: me.id,
          },
        }),
      },
      defaultValue: data?.employeeId,
    },
    productId: {
      label: 'Choose product',
      type: 'fetch-select',
      fetchSelectConfig: {
        url: '/products',
        columns: productColumns,
        showInOption: ['productName'],
        icon: 'photoPath',
        returnValue: 'id',
      }
    },
    amount: {
      label: 'Product amount (kg)',
      type: 'number',
    },
    dateTime: {
      label: 'Date and time',
      type: 'datetime',
      defaultValue: new Date(),
    }
  });

  const { id } = data || {};

  const onSubmit = values => {
    request({
      url: '/history',
      method: 'POST',
      body: {
        ...values,
        amount: parseFloat(values.amount),
      },
      callback: (status, response) => {
        setSaving(false);
        if (status === 'ok') {
          const { amount, dateTime, employeeId, productId } = response.data;

          Alert.alert(
            'New record',
            `Data of portion ${amount} kg of product with ID ${productId} by employee with ID ${employeeId} at ${dateTime} was saved successfully.`,
            [{ text: 'ОК' }],
          );
        } else if (status === 'error') {
          Alert.alert(
            'Error',
            response.message,
            [{ text: 'ОК' }],
          );
        }
      }
    });
    setSaving(true);
  };
  
  return (
    <View style={styles.main}>
      <View style={styles.block}>
        {
          (berryId && loading || saving) ? <Dialog.Loading /> : (
            <Form
              fieldsData={getFieldsData({ employeeId: id })}
              onSubmit={onSubmit}
              submitText="Save"
            />
          )
        }
      </View>
    </View>
  );
};

export default NewPortion;
