import DropDownPicker from 'react-native-dropdown-picker';


const Select = props => {
  const { value, label, onChange, options, open, setOpen, style, index } = props;

  return (
    <DropDownPicker
      key={index}
      translation={{ PLACEHOLDER: label, SEARCH_PLACEHOLDER: 'Search...', NOTHING_TO_SHOW: 'No results' }}
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
