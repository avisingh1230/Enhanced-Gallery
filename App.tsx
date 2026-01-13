// import React, { useEffect, useState } from 'react';
// import { SafeAreaView, Button, StyleSheet, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
// import { initDB, saveImageUri, fetchImages } from './src/database/db';
// import { ImageGrid } from './src/components/ImageGrid';
// import { SavedImage } from './src/types';

// export default function App() {
//   const [images, setImages] = useState<SavedImage[]>([]);

//   useEffect(() => {
//     initDB().then(loadImages);
//   }, []);

//   const loadImages = async () => {
//     const data = await fetchImages();
//     setImages(data);
//   };

//   const pickImage = async () => {
//     // 1. Pick
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const sourceUri = result.assets[0].uri;
//       const fileName = sourceUri.split('/').pop();
//       const newPath = `${FileSystem.documentDirectory}${fileName}`;

//       try {
//         // 2. Copy to permanent storage
//         await FileSystem.copyAsync({
//           from: sourceUri,
//           to: newPath,
//         });

//         // 3. Store in SQLite
//         await saveImageUri(newPath);
        
//         // Refresh UI
//         loadImages();
//       } catch (error) {
//         Alert.alert("Error", "Failed to save image locally");
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={styles.screen}>
//       <Button title="Add Image" onPress={pickImage} />
//       <ImageGrid images={images} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, paddingTop: 50 },
// });

import React, { useEffect, useState } from 'react';
import { SafeAreaView, Button, StyleSheet, View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths, copyAsync } from 'expo-file-system';

// Importing from your structure
import { initDB, saveImageUri, fetchImages } from './src/database/db'
import { ImageGrid } from './src/components/ImageGrid';
import { SavedImage } from './src/types/index';

export default function App() {
  const [images, setImages] = useState<SavedImage[]>([]);

  // Initialize DB and load data on mount
  useEffect(() => {
    initDB();
    refreshGallery();
  }, []);

  const refreshGallery = () => {
    const data = fetchImages();
    setImages(data);
  };

  const handleAddImage = async () => {
    // 1. Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    try {
      const sourceUri = result.assets[0].uri;
      // Extract filename (e.g., "image.jpg")
      const fileName = sourceUri.split('/').pop() || `img_${Date.now()}.jpg`;

      // 2. Initialize the Source File (the temp file from picker)
      const tempFile = new File(sourceUri);

      // 3. Initialize the Destination File (the permanent location)
      // Following your example: new File(Directory, 'filename')
      const permanentFile = new File(Paths.document, fileName);

      // 4. Copy the file
      // As per your example: sourceFile.copy(destinationFile)
      tempFile.copy(permanentFile);

      // 5. Store the permanent URI in SQLite
      // permanentFile.uri gives you the new persistent path
      saveImageUri(permanentFile.uri);

      // Refresh UI
      setImages(fetchImages());
    } catch (error) {
      console.error(error);
      Alert.alert("Save Error", "Could not save image to permanent storage.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="Add Image" onPress={handleAddImage} />
      </View>
      <ImageGrid images={images} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
});