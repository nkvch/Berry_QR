import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from '../styles/styles';

import NewPortionDialog from './NewPortionDialog';

function QrScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [berryId, setBerryId] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();

      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setShowForm(true);
    // TODO validate
    setBerryId(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  console.log({ hasPermission, scanned });

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
        <NewPortionDialog show={showForm} berryId={berryId} dontShow={() => setShowForm(false)}/>
      </View>
      {scanned && <Button title={'Сканировать еще раз'} onPress={() => setScanned(false)} />}
    </View>
  );
}

export default QrScanner;
