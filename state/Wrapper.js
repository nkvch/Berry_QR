import React, { useEffect, useState } from 'react';
import SignIn from '../views/SignIn';
import QrScanner from '../views/QrScanner';
import styles from '../styles/styles';
import Home from '../views/Home';
import { BottomNavigation, Appbar } from 'react-native-paper';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewPortion from '../views/NewPortion';
import Employees from '../views/Employees';
import Stats from '../views/Stats';

const getSafeNavigationIndex = (idx, routes) => {
  return routes.length > idx ? idx : 0;
};

const Wrapper = ({
  navigation,
  children,
  title,
  menuItems,
  subTitle,
}) => {
  const { barStyle } = styles;

  const tabOptions = {
    activeColor: 'rgb(0, 115, 182)',
    barStyle,
  };

  const [index, setIndex] = useState(0);
  const [props, setProps] = useState({
    home: {},
    signin: {},
    scanner: {},
    newportion: {},
    employees: { adding: false },
    stats: {},
    createEmp: {},
  });

  useEffect(() => {
    if (index >= menuItems.length) {
      setIndex(0);
    }
  }, [menuItems.length]);

  const jumpTo = (key, _props) => {
    const targetScreenIndex = menuItems.findIndex(item => item.key === key);

    setProps(prevProps => ({ ...prevProps, [key]: _props }));
    
    setIndex(targetScreenIndex);
  };

  const isActive = _key => menuItems[index]?.key === _key;

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <Home isActive={isActive('home')} jumpTo={jumpTo} {...props.home} />;
      case 'signin':
        return <SignIn isActive={isActive('signin')} jumpTo={jumpTo} {...props.signin} />;
      case 'scanner':
        return <QrScanner isActive={isActive('scanner')} jumpTo={jumpTo} {...props.scanner} />;
      case 'newportion':
        return <NewPortion isActive={isActive('newportion')} jumpTo={jumpTo} {...props.newportion} />;
      case 'employees':
        return <Employees isActive={isActive('employees')} jumpTo={jumpTo} {...props.employees} />;
      case 'stats':
        return <Stats isActive={isActive('stats')} jumpTo={jumpTo} {...props.stats} />
    }
  }

  return (
    <>
      <SafeAreaView>
        <Appbar style={styles.barStyle}>
          {/* <Appbar.Header style={styles.appBarHeader}>
            <Appbar.Content style={styles.barTextStyle} title="Berrymore" subtitle="Subtitle" />
          </Appbar.Header> */}
          {/* <Appbar.BackAction onPress={() => navigation.goBack()} /> */}
          <Text style={styles.title}>{ title }</Text>
        </Appbar>
      </SafeAreaView>
      <BottomNavigation
        navigationState={{ index: getSafeNavigationIndex(index, menuItems), routes: menuItems }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={{ backgroundColor: '#FFF' }}
      />
    </>
  )
};

export default Wrapper;
