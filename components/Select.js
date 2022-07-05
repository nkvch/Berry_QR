import DropDownPicker from 'react-native-dropdown-picker';


const Select = props => {
  const { value, label, onChange, options, open, setOpen, style, index } = props;

  return (
    <DropDownPicker
      key={index}
      translation={{ PLACEHOLDER: label, SEARCH_PLACEHOLDER: 'Поиск...', NOTHING_TO_SHOW: 'Нет результатов' }}
      items={options}
      value={value}
      open={open}
      setOpen={setOpen}
      setValue={onChange}
      style={style}
      listMode="MODAL"
    />
  )
};

export default Select;
