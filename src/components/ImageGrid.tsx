import React from 'react';
import { FlatList, Image, StyleSheet, Dimensions, View } from 'react-native';
import { SavedImage } from '../types';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;

export const ImageGrid = ({ images }: { images: SavedImage[] }) => {
  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id.toString()}
      numColumns={COLUMN_COUNT}
      renderItem={({ item }) => (
        <Image source={{ uri: item.local_uri }} style={styles.image} />
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 2 },
  image: {
    width: width / COLUMN_COUNT - 4,
    height: width / COLUMN_COUNT - 4,
    margin: 2,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});