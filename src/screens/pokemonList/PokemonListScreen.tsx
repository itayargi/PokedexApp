import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import { observer } from "mobx-react-lite";
import { pokemonStore } from "@/store/PokemonStore";
import { Pokemon } from "@/types/types";
import { globalStyles } from "@/styles";
import { navigate } from "@/navigation/navigationRef";
import { ScreenName } from "@/utils/enum";
import ImageComponent from "@/components/image/ImageComponent";
import { isPokemonCaptured, wait } from "@/utils/functionUtils";

const PokemonListScreen = observer(() => {
  const goToCapturePokemon = () => {
    navigate(ScreenName.CapturedPokemon);
  };

  const renderItem = ({ item }: { item: Pokemon }) => {
    item.captured = isPokemonCaptured(item);
    return (
      <View style={styles.pokemonItem}>
        <ImageComponent name={item.name} />
        <View style={styles.pokemonDetails}>
          <Text style={styles.pokemonName}>{item.name}</Text>
          <Text>
            Type: {item.type_one}
            {item.type_two ? ` / ${item.type_two}` : ""}
          </Text>
          <Text>Number: {item.number}</Text>
          <Text>HP: {item.hit_points}</Text>
          <Text>Attack: {item.attack}</Text>
          <Text>Defense: {item.defense}</Text>
          <TouchableOpacity
            style={[
              styles.captureButton,
              item.captured && styles.releaseButton,
            ]}
            onPress={() =>
              item.captured
                ? pokemonStore.releasePokemon(item)
                : pokemonStore.saveAsContact(item)
            }
          >
            <Text style={styles.captureButtonText}>
              {item.captured ? "Release" : "Catch"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigate(ScreenName.FilterSort)}
        >
          <Text style={styles.headerButtonText}>Filter and Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={goToCapturePokemon}
        >
          <Text style={styles.headerButtonText}>Captured Pokémon</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pokemonStore.pokemonList}
        keyExtractor={(item) => pokemonStore.generateUniqueId(item)}
        renderItem={renderItem}
        bounces={false}
        initialNumToRender={10}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pokemonItem: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pokemonDetails: {
    justifyContent: "center",
    flex: 1,
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  captureButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: "#28a745",
    borderRadius: 8,
    alignItems: "center",
  },
  releaseButton: {
    backgroundColor: "#dc3545",
  },
  captureButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default PokemonListScreen;
