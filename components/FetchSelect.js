import { useEffect, useState } from 'react';
import useApi from '../utils/hooks/useApi';
import Debouncer from '../utils/debouncer';
import styles from '../styles/styles';
import DropDownPicker from 'react-native-dropdown-picker';
import { Avatar } from '@rneui/themed';
import { api } from '../api';


const debouncer = new Debouncer(500);

const FetchSelect = props => {
  const { url, value, columns, label, onChange, showInOption, icon, returnValue, open, setOpen, style, index, customFilters } = props;

  const [search, setSearch] = useState('');

  const searchColumns = Object.entries(columns)
    .filter(([, { type }]) => ['text', 'number'].includes(type))
    .map(([key]) => key);

  const selectColumns = Object.keys(columns);

  const { loading, data } = useApi({ url }, {
    page: 1,
    qty: 30,
    search,
    searchColumns,
    selectColumns,
    ...(customFilters),
  });

  const items = data?.pageData.map(row => ({
    label: showInOption.map(o => row[o]).join(' '),
    value: row[returnValue],
    icon: () => <Avatar source={{ uri: `${api}${row[icon]}` }} />,
  })) || [];

  useEffect(() => {
    if (items.length === 1) {
      onChange(items[0].value);
    }
  }, [items.length]);

  const handleInputChange = val => debouncer.debounce(() => setSearch(val))

  return (
    <DropDownPicker
      onClose={() => setSearch('')}
      onSelectItem={() => setSearch('')}
      closeOnBackPressed={() => setSearch('')}
      key={index}
      translation={{ PLACEHOLDER: label, SEARCH_PLACEHOLDER: 'Поиск...', NOTHING_TO_SHOW: 'Нет результатов' }}
      items={items}
      value={value}
      open={open}
      setOpen={setOpen}
      setValue={onChange}
      loading={loading}
      searchable
      disableLocalSearch
      onChangeSearchText={handleInputChange}
      style={style}
      listMode="MODAL"
    />
  )
};

export default FetchSelect;
