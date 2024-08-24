import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { globalStyles } from "@/styles";
import { pokemonStore } from "@/store/PokemonStore";
import { Pokemon } from "@/types/types";
// import { Pokemon } from "@/src/types/types";
// import { globalStyles } from "@/src/styles";
// import { pokemonStore } from "@/src/store/PokemonStore";

const CapturedPokemonScreen = observer(() => {
  const renderItem = ({ item }: { item: Pokemon }) => (
    <View style={styles.pokemonItem}>
      <Text style={styles.pokemonName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Captured Pokémon</Text>
      <FlatList
        data={pokemonStore.capturedPokemon}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderItem}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  pokemonItem: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default CapturedPokemonScreen;
