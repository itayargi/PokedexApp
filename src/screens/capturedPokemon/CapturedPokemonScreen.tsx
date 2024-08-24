import { pokemonStore } from "@/store/PokemonStore";
import { globalStyles } from "@/styles";
import { Pokemon } from "@/types/types";
import { observer } from "mobx-react-lite";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const CapturedPokemonScreen = observer(() => {
  const capturedPokemonList = pokemonStore.capturePokemonArray;

  const renderItem = ({ item }: { item: Pokemon }) => (
    <View style={styles.pokemonItem}>
      <Text style={styles.pokemonName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Captured Pokémon</Text>
      <FlatList
        data={capturedPokemonList}
        keyExtractor={(item) => `${item.number}_${item.name}`}
        showsVerticalScrollIndicator={false}
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
