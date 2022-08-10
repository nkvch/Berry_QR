import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Button, Image, View } from "react-native";
import { Button as PaperButton } from "react-native-paper";
import styles from "../styles/styles";

const ImageUpload = ({ onChange, value }) => {
  const [uploaded, setUploaded] = useState( value ? true : false );

  const onPress = mode => async () => {
    const result = mode === 'camera' ? (await ImagePicker.launchCameraAsync()) : (await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    }));

    setUploaded(true);

    if (!result.cancelled) {
      const localUri = result.uri;
      const filename = localUri.split('/').pop();

      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      onChange({
        uri: localUri,
        name: filename,
        type,
      });
    }
  };

  return (
    <View>
      {
        uploaded && (
          <Image source={{ uri: value?.uri }} style={{ width: '100%', minHeight: 200, marginBottom: 8 }} resizeMode="contain" />
        )
      }
      <PaperButton
        onPress={onPress('upload')}
        icon="camera-burst"
        color="black"
        mode="outlined"
        style={styles.mb(10)}
      >
        { uploaded ? 'Upload another image' : 'Upload image' }
      </PaperButton>
      <PaperButton
        onPress={onPress('camera')}
        icon="camera"
        color="black"
        mode="outlined"
        style={styles.mb(10)}
      >
        {'Take a photo'}
      </PaperButton>
    </View>
  )
};

export default ImageUpload;
