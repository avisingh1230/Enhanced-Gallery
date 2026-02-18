import { Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function Details() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Details" }} />
      <Text style={styles.text}>Details Screen</Text>
      <Text style={styles.value}>Name: {name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  value: {
    marginTop: 8,
    fontSize: 16,
  },
});
