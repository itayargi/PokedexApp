import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import { observer } from "mobx-react-lite";
import { pokemonStore } from "@/store/PokemonStore";
// import { pokemonStore } from "@/src/store/PokemonStore";

type Props = {};

const AppLoader = observer((props: Props) => {
  if (!pokemonStore.loading) return null;
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"} />
    </View>
  );
});

export default AppLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
});
