import React, { useState } from 'react';
import SignIn from '../views/SignIn';
import QrScanner from '../views/QrScanner';
import styles from '../styles/styles';
import Home from '../views/Home';
import { BottomNavigation, Appbar } from 'react-native-paper';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignInRoute = () => <SignIn />;

const HomeRoute = () => <Home />;

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

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    signin: SignInRoute,
    scanner: QrScanner,
  });

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
        navigationState={{ index, routes: menuItems }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={{ backgroundColor: '#FFF' }}
      />
    </>
  )
};

export default Wrapper;
