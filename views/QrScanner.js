import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from '../styles/styles';
import getLocalDateTime from '../utils/getLocalDateTime';

import NewPortion from './NewPortion';

function QrScanner({ jumpTo }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();

      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data: berryId }) => {
    setScanned(true);
    // TODO validate
    jumpTo('newportion', { berryId });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.main}>
      <View style={styles.block}>
        {
          !scanned && (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
              style={styles.QrScanner}
            />
          )
        }
      </View>
      {scanned && <Button title={'Сканировать еще раз'} onPress={() => setScanned(false)} />}
    </View>
  );
}

export default QrScanner;
