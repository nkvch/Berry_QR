import { Formik } from 'formik';
import { View } from 'react-native';
import styles from '../styles/styles';
import FetchSelect from './FetchSelect';
import { Button } from 'react-native';
import { Badge, Button as PaperButton } from 'react-native-paper';
import { Input } from '@rneui/themed';
import { useState } from 'react';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibraryAsync } from 'expo-image-picker';
import ImageUpload from './ImageUpload';
import PhoneInput from 'react-native-phone-input';
import DropDownPicker from 'react-native-dropdown-picker';
import applyCallbackIfExists from '../utils/applyCallback';

const renderField = (fieldData, {
  values,
  handleChange,
  setFieldValue: setFieldValueWithoutCallback,
  onChangeCallback,
  handleBlur,
}) => {
  const [field, config] = fieldData;
  const { label, type, index, open, setOpen } = config;

  const callback = onChangeCallback ? (_field, _value) => onChangeCallback({
    ...values,
    [_field]: _value,
  }) : null

  const setFieldValue = applyCallbackIfExists(setFieldValueWithoutCallback, callback);

  let fieldToRender;

  switch (type) {
    case 'file':
      fieldToRender = (
        <ImageUpload
          onChange={file => setFieldValue(field, file)}
          value={values[field]}
        />
        // <FileUploader
        //   handleChange={file => setFieldValue(field, file)}
        //   label={label}
        //   name={field}
        //   hoverTitle="Drop"
        //   types={['JPG', 'PNG', 'GIF']}
        // >
        //   <DroppableImageContainer image={values[field]}/>
        // </FileUploader>
      );
      break;
    case 'multiple-select':
      const { multipleSelectConfig: { multipleOptions } } = config;

      fieldToRender = (
        <DropDownPicker
          key={`multipleselect${index}`}
          multiple
          translation={{ PLACEHOLDER: label, SEARCH_PLACEHOLDER: 'Search...', NOTHING_TO_SHOW: 'No results', SELECTED_ITEMS_COUNT_TEXT: '{count} flags picked' }}
          items={multipleOptions}
          value={values[field]}
          style={[styles.mb(5)]}
          open={open}
          min={0}
          max={5}
          setOpen={setOpen}
          setValue={prevCb => {
            setFieldValue(field, prevCb(values[field]));
          }}
          listMode="MODAL"
        />
      );
      break;
    case 'select':
      const { selectConfig: { options } } = config;

      fieldToRender = (
        <DropDownPicker
          key={`select${index}`}
          translation={{ PLACEHOLDER: label, SEARCH_PLACEHOLDER: 'Search...', NOTHING_TO_SHOW: 'No results' }}
          items={options}
          value={values[field]}
          style={[styles.mb(5)]}
          open={open}
          setOpen={setOpen}
          setValue={_value => {
            let value;

            if (_value) {
                value = typeof _value === 'function' ? _value() : _value;
            }

            if (value) {
              setFieldValue(field, value);
            } else {
              setFieldValue(field, undefined);
            }
          }}
          listMode="MODAL"
        />
      );
      break;
    case 'fetch-select':
      const {
        fetchSelectConfig: { url, columns, showInOption, returnValue, icon, customFilters },
        onChangeCallback,
      } = config;

      fieldToRender = (
        <FetchSelect
          index={`dropdown${index}`}
          url={url}
          columns={columns}
          label={label}
          style={[styles.mb(5), styles.fetchSelect(open)]}
          onChange={_value => {
            let value;

            if (_value) {
                value = typeof _value === 'function' ? _value() : _value;
            }

            if (typeof onChangeCallback === 'function') {
              onChangeCallback(value)
            }

            if (value) {
              setFieldValue(field, value);
            } else {
              setFieldValue(field, undefined);
            }
          }}
          showInOption={showInOption}
          value={values[field]}
          returnValue={returnValue}
          icon={icon}
          open={open}
          setOpen={setOpen}
          customFilters={customFilters}
        />
      );

      break;
    case 'datetime':
      const { mode, setMode } = config;

      fieldToRender = (
        <View style={[styles.dateTimeContainer, styles.mb(10)]} key={`datetimeholder${index}`}>
          {
            open && (
              <RNDateTimePicker
                key={`picker${index}`}
                testID="dateTimePicker"
                value={values[field] || new Date()}
                mode={mode}
                display="default"
                is24Hour
                onChange={({ type }, strDate) => {
                  if (type === 'set') {
                    setFieldValue(field, new Date(strDate))
                  }
                  setOpen(false);
                }}
              />
            )
          }
          <View style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: 100, alignContent: 'space-between', justifyContent: 'center' }}>
          <PaperButton
            onPress={() => { setMode('date'); setOpen(true); }}
            icon="calendar"
            color="black"
            mode="outlined"
            style={[styles.mb(10), { width: '75%' }]}
            key={`date${index}`}
          >
            {values[field]?.toDateString ? values[field]?.toDateString() : label }
          </PaperButton>
          <PaperButton
            onPress={() => { setMode('time'); setOpen(true); }}
            icon="clock"
            color="black"
            mode="outlined"
            style={[{ width: '75%' }]}
            key={`time${index}`}
          >
            {values[field]?.toLocaleTimeString ? values[field]?.toLocaleTimeString() : label}
          </PaperButton>
          <PaperButton
            onPress={() => setFieldValue(field, undefined)}
            color="black"
            mode="outlined"
            icon="close"
            style={[styles.mb(10), { width: '20%' }]}
            key={`dateclear${index}`}
          />
          </View>
        </View>
      );
      break;
    // case 'phone':
    //   fieldToRender = (
    //     <PhoneInput
    //       countriesList={['by']}
    //       name={field}
    //       onChangePhoneNumber={c => console.log(c)}
    //       initialValue={values[field]}
    //       // pickerItemStyle=
    //     />
    //     // <PhoneInput
    //     //   country={'by'}
    //     //   name={field}
    //     //   onChange={phoneNumber => setFieldValue(field, phoneNumber)}
    //     //   value={values[field]}
    //     //   specialLabel={label}
    //     //   isValid={(value, country) => country.iso2 === 'by' && !!value.match(/^\d{12}$/)}
    //     //   style={{
    //     //     marginBottom: '8px',
    //     //   }}
    //     //   inputStyle={{
    //     //     width: '100%',
    //     //   }}
    //     // />
    //   );
      break;
    default:
      fieldToRender = (
        <Input
          placeholder={label}
          onChangeText={handleChange(field)}
          onBlur={handleBlur(field)}
          value={values[field]}
          secureTextEntry={type === 'password'}
          key={`textinput${index}`}
        />
      );
      break;
  }

  return fieldToRender;
};

const Form = ({ onSubmit, submitText, fieldsData, submitable, resetable, resetText, hidden, intable, resetFilters, onChangeCallback }) => {
  const [openedSelect, setOpenedSelect] = useState(null);
  const [dateTimeMode, setDateTimeMode] = useState('date');

  const _fieldsData = Object.entries(fieldsData)
    .map(([field, config], idx) => {
      config.index = idx;

      if (['fetch-select', 'datetime', 'select', 'multiple-select'].includes(config.type)) {
        config = {
          ...config,
          open: idx === openedSelect,
          setOpen: open => open ? setOpenedSelect(idx) : setOpenedSelect(null),
          ...(config.type === 'datetime' && {
            mode: dateTimeMode,
            setMode: setDateTimeMode,
          }),
        };
      }

      return [field, config];
    });

  return (
    <Formik
      {...({
        initialValues: Object.fromEntries(
          _fieldsData.map(([field, { defaultValue }]) => ([field, defaultValue || '']))
        ),
        onSubmit,
      })}
    >
      {
        ({ values, handleChange, handleSubmit, setFieldValue, handleBlur, resetForm }) => (
          <View style={hidden && { display: 'none' }}>
              { 
                _fieldsData.map(
                  fieldData => renderField(fieldData, { values, handleChange, setFieldValue, handleBlur, onChangeCallback })
                )
              }
              {
                submitable !== false && (
                  <Button
                    key={`submitbutton`}
                    title={submitText}
                    onPress={handleSubmit}
                  />
                )
              }
              {
                (resetable || intable) && (
                  <View style={styles.mt(10)}>
                    <Button
                      key={`resetbutton`}
                      title={intable ? 'Clear' : resetText}
                      onPress={() => {
                        resetForm();

                        if (intable) {
                          resetFilters();
                        }
                      }}
                    />
                  </View>
                )
              }
          </View>
        )
      }
    </Formik>
  );
};

export default Form;
