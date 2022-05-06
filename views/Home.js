import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';
import { Button, ListItem } from '@rneui/themed';
import Context from '../state/context';

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
