import React, { useEffect, useState, useRef } from 'react';
import { 
  SafeAreaView, Button, StyleSheet, View, Alert, 
  Modal, Image, TouchableWithoutFeedback, Animated, Dimensions, TouchableOpacity, Text
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { processImageDescription } from './src/services/imageProcessor';
import { initDB, fetchImages, deleteImageFromDb,  } from './src/database/db';
import { ImageGrid } from './src/components/ImageGrid';
import { SavedImage } from './src/types/index';
//services
import { saveImage } from './src/services/imageProcessor';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  
  // Animation value for the pop effect
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    async function initialize (){
      await initDB(false);
      refreshGallery();
    }
    initialize();
  }, []);

  const refreshGallery = () => {
    // let images  = fetchImages();
    // console.log(images)
    setImages(fetchImages());
  };

  const handleOpenImage = (image: SavedImage) => {
    setSelectedImage(image);
    // Animate scale from 0.7 to 1
    scaleAnim.setValue(0.7);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseImage = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setSelectedImage(null));
  };

  const handleDelete = () => {
    if (!selectedImage) return;

    Alert.alert(
      "Delete Image",
      "Are you sure you want to permanently delete this image?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              // 1. Delete Physical File using the new File API
              const fileToDelete = new File(selectedImage.local_uri);
              fileToDelete.delete();

              // 2. Delete from SQLite
              let deletedImage = await deleteImageFromDb(selectedImage.id);
              console.log(`Image Deleted with Id- ${deletedImage?.id} and Description: ${deletedImage?.description}`)

              // 3. Update UI
              handleCloseImage();
              refreshGallery();
            } catch (error) {
              console.error("Delete Error:", error);
              Alert.alert("Error", "Could not delete the file from storage.");
            }
          } 
        }
      ]
    );
  };

  const handleAddImage = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    try {
      const sourceUri = result.assets[0].uri;
      // 1. Save the Image
      await saveImage(sourceUri);

      // 2. UPDATE UI INSTANTLY
      refreshGallery(); 
      } catch (error) {
        console.error(error);
        Alert.alert("Save Error", "Could not save image.");
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="Add Image" onPress={handleAddImage} />
      </View>

      <ImageGrid images={images} onPressImage={handleOpenImage} />

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Dismiss by clicking background */}
          <TouchableWithoutFeedback onPress={handleCloseImage}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: selectedImage.local_uri }} 
                  style={styles.fullImage} 
                  resizeMode="contain"
                />
                
                {/* Footer Container for Description and Delete */}
                <View style={styles.modalFooter}>
                  <View style={styles.descriptionWrapper}>
                    <Text style={styles.descriptionText} numberOfLines={3}>
                      {selectedImage?.description || "No description available..."}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                {/* Close Button overlay */}
                <TouchableOpacity style={styles.closeButton} onPress={handleCloseImage}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
  },
  imageContainer: {
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.6)', // Subtle background to make text readable
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  descriptionWrapper: {
    flex: 1, // Takes up remaining space on the left
    marginRight: 10,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
  }
});