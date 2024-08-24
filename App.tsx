import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import AppNavigator from "./src/navigation/AppNavigaion";
import AppLoader from "@/components/loader/AppLoader";

export default function App() {
  return (
    <View style={styles.container}>
      <AppNavigator />
      <AppLoader />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
