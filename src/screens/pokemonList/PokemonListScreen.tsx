import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Button } from "react-native";
import { observer } from "mobx-react-lite";
import { pokemonStore } from "@/store/PokemonStore";
import { Pokemon } from "@/types/types";
import { globalStyles } from "@/styles";
import { navigate } from "@/navigation/navigationRef";
import { ScreenName } from "@/utils/enum";
import ImageComponent from "@/components/image/ImageComponent";

const PokemonListScreen = observer(() => {
  useEffect(() => {
    pokemonStore.fetchPokemon();
  }, []);

  const renderItem = ({ item }: { item: Pokemon }) => (
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
        <Button
          title={item.captured ? "Release" : "Catch"}
          onPress={() =>
            item.captured
              ? pokemonStore.releasePokemon(item)
              : pokemonStore.markAsCaptured(item)
          }
        />
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Button
        title="Filter and Sort"
        onPress={() => navigate(ScreenName.FilterSort)}
      />

      <FlatList
        data={pokemonStore.pokemonList}
        keyExtractor={(item) => pokemonStore.generateUniqueId(item)}
        renderItem={renderItem}
        bounces={false}
        initialNumToRender={10}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
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
});

export default PokemonListScreen;
