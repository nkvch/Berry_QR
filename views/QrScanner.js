import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from '../styles/styles';
import getLocalDateTime from '../utils/getLocalDateTime';

import NewPortion from './NewPortion';
import { Dialog } from '@rneui/base';

function QrScanner({ jumpTo, isActive }) {
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

  useEffect(() => {
    setScanned(!isActive);
  }, [isActive]);

  return (
    <View style={styles.main}>
      <View style={styles.block}>
        { hasPermission === null && <Dialog.Loading /> }
        { hasPermission === false && <Text>{'Телефон не разрешил нам попользоваться камерой :( '}</Text> }
        {
          hasPermission && !scanned && (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
              style={styles.QrScanner}
            />
          )
        }
        {hasPermission && scanned && <Button title={'Сканировать еще раз'} onPress={() => setScanned(false)} />}
      </View>
    </View>
  );
}

export default QrScanner;
