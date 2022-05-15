import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';
import Context from '../state/context';
import { Button } from 'react-native';

const Home = props => {
  const { logout } = useContext(Context);

  return (
    <View style={styles.main}>
      <View style={styles.block}>
        <Button
          title="Выйти"
          onPress={logout}
        />
      </View>
    </View>
  );
};

export default Home;
