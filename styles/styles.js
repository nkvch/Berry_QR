import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'rgb(0, 162, 255)',
  },
  title: {
    fontSize: 25,
    fontWeight: '300',
    marginLeft: 20,
  },
  text: {
    marginStart: 10,
  },
  block: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    // height: '94%',
  },
  blockBorderless: {
    backgroundColor: 'white',
    padding: 20,
    // height: '94%',
  },
  QrScanner: {
    height: 400,
  },
  barStyle: {
    backgroundColor: 'white',
  },
  appBarHeader: {
    backgroundColor: 'white',
  },
  barTextStyle: {
    color: 'black',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  QRcontainer: {
    // width: SCREEN_WIDTH - 80,
  },
  QRcamer: {
    width: SCREEN_WIDTH - 80,
  },
  qrScannerWrapper: {
    height: 450,
  },
  buttonsWrapper: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH - 80,
    marginRight: 80,
    marginBottom: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.315)',
  },
  switchButton: {
    flexDirection: 'column',
    padding: 10,
  },
  switchButtonText: {
    color: 'white',
  },
  validationError: {
    color: 'rgb(170, 44, 44)',
    backgroundColor: 'rgb(255, 213, 213)',
    borderRadius: 5,
    borderColor: 'rgb(170, 44, 44)',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  mb: num => ({
    marginBottom: num,
  }),
  mt: num => ({
    marginTop: num,
  }),
  dateTimeContainer: {
    display: 'flex',
    width: '100%'
  },
  fetchSelect: open => !open ? ({
    zIndex: 0,
  }) : ({}),
  stickBottom: {
    bottom: 0,
  },
  widthPercent: num => ({
    width: `${num}%`,
  }),
});
