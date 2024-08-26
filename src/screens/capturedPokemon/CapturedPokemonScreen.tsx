import { pokemonStore } from "@/store/PokemonStore";
import { globalStyles } from "@/styles";
import { Pokemon } from "@/types/types";
import { observer } from "mobx-react-lite";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import ImageComponent from "@/components/image/ImageComponent";
import strings from "@/utils/strings";

const CapturedPokemonScreen = observer(() => {
  const capturedPokemonList = pokemonStore.capturePokemonArray;

  const renderItem = ({ item }: { item: Pokemon }) => (
    <View style={styles.pokemonItem}>
      <ImageComponent style={styles.pokemonImage} name={item.name} />
      <View style={styles.pokemonDetails}>
        <Text style={styles.pokemonName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.releaseButton}
          onPress={() => pokemonStore.releasePokemon(item)}
        >
          <Text style={styles.releaseButtonText}>Release</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>{strings.captureScreen_title}</Text>
      <FlatList
        data={capturedPokemonList}
        keyExtractor={(item) => `${item.number}_${item.name}`}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  pokemonItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pokemonImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 8,
  },
  pokemonDetails: {
    flex: 1,
    justifyContent: "center",
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  releaseButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  releaseButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CapturedPokemonScreen;
