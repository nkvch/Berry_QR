import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';
import Context from '../state/context';
import { Button } from 'react-native';
import { Card } from 'react-native-paper';

const getMyRoleName = {
  foreman: 'Foreman',
  admin: 'Admin',
};

const Home = props => {
  const { logout, user } = useContext(Context);

  return (
    <View style={styles.main}>
      <View style={styles.block}>
        <Card>
          <Card.Title title={`${user?.firstName} ${user?.lastName}`} subtitle={getMyRoleName[user?.role?.roleName]} />
          <Card.Actions>
            <Button
              title="Log out"
              onPress={logout}
            />
          </Card.Actions>
        </Card>
      </View>
    </View>
  );
};

export default Home;
