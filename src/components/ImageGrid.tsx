import React from 'react';
import { FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SavedImage } from '../types/index';

const { width } = Dimensions.get('window');
const gap = 2;
const itemSize = (width - gap * 4) / 3;

interface Props {
  images: SavedImage[];
  onPressImage: (selectedImage: SavedImage) => void; // Added prop
}

export const ImageGrid = ({ images, onPressImage }: Props) => {
  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onPressImage(item)}>
          <Image source={{ uri: item.local_uri }} style={styles.image} />
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: itemSize,
    height: itemSize,
    margin: gap,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
});