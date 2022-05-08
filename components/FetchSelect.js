import { useState } from 'react';
import useApi from '../utils/hooks/useApi';
import Debouncer from '../utils/debouncer';
import styles from '../styles/styles';
import DropDownPicker from 'react-native-dropdown-picker';
import { Avatar } from '@rneui/themed';
import { api } from '../api';


const debouncer = new Debouncer(500);

const FetchSelect = props => {
  const { url, value, columns, label, onChange, showInOption, showInValue } = props;

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const searchTextColumns = Object.entries(columns)
    .filter(([, { type }]) => type === 'text')
    .map(([key]) => key);

  const searchNumberColumns = Object.entries(columns)
    .filter(([, { type }]) => type === 'number')
    .map(([key]) => key);

  const selectColumns = Object.keys(columns);

  const { loading, data } = useApi({ url }, {
    page: 1,
    qty: 10,
    search,
    searchTextColumns,
    searchNumberColumns,
    selectColumns,
  });

  const items = data?.pageData.map(({ id, productName, photoPath }) => ({
    label: productName,
    value: id,
    icon: () => <Avatar source={{ uri: `${api}${photoPath}` }} />,
  })) || [];

  console.log({url, data, loading});

  const handleInputChange = val => debouncer.debounce(() => setSearch(val))

  return (
    <DropDownPicker
      items={items}
      value={value}
      open={open}
      setOpen={setOpen}
      setValue={onChange}
      loading={loading}
      searchable
      disableLocalSearch
      onChangeSearchText={handleInputChange}
    />
  )
};

export default FetchSelect;
