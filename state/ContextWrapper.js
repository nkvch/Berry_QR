import { useEffect, useState } from 'react';
import Context from './context';
import Wrapper from './Wrapper';
// import HomeIcon from '@mui/icons-material/Home';
// import EqualizerIcon from '@mui/icons-material/Equalizer';
// import PeopleIcon from '@mui/icons-material/People';
// import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
// import ExitToAppIcon from '@mui/icons-material/ExitToApp';
// import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import request from '../utils/request';
// import notifications from './components/notifications';
// import sleep from './utils/sleep';
// import AddTaskIcon from '@mui/icons-material/AddTask';
import AsyncStorageLib from '@react-native-async-storage/async-storage';

const unauthMenuOptions = [
  { key: 'signin', title: 'Войти', icon: 'exit-to-app' },
];

const authMenuOptions = [
  { key: 'scanner', title: 'Сканнер', icon: 'qrcode-scan' },
  { key: 'newportion', title: 'Новая порция', icon: 'plus'},
  { key: 'employees', title: 'Сотрудники', icon: 'account-multiple' },
  { key: 'stats', title: 'Статистика', icon: 'chart-bar' },
  { key: 'home', title: 'Домой', icon: 'home' },
];

const ContextWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subTitle, setSubTitle] = useState(null);

  const login = (token, user) => {
    // localStorage.setItem('jwt', token);
    AsyncStorageLib.setItem('jwt', token);
    setUser(() => user);
  };

  const logout = () => {
    // localStorage.removeItem('jwt');
    AsyncStorageLib.removeItem('jwt');
    setUser(() => null);
  };

  useEffect(() => {
    request({
      url: '/auth',
      callback: (status, response) => {
        if (status === 'ok') {
          const { token, ...userData } = response.data;

          login(token, userData);
        } else if (status === 'error') {
          console.log(response);
          logout();
        }
      }
    });
  }, []);

  // const updateSubTitle = async newSubTitle => {
  //   await sleep(500);
  //   setSubTitle(null);
  //   await sleep(600);
  //   setSubTitle(newSubTitle);
  // };

  return (
    <Context.Provider value={{ user, login, logout }}>
      <Wrapper
        title="Berrymore"
        menuItems={
          user
          ? authMenuOptions
          : unauthMenuOptions
        }
        subTitle={subTitle}
      >
          {children}
      </Wrapper>
    </Context.Provider>
  );
};

export default ContextWrapper;
