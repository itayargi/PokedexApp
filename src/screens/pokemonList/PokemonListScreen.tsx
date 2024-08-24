import React, { useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, Button } from "react-native";
import { observer } from "mobx-react-lite";
import { pokemonStore } from "@/store/PokemonStore";
import { Pokemon } from "@/types/types";
import { globalStyles } from "@/styles";
// import { pokemonStore } from "@/src/store/PokemonStore";
// import { globalStyles } from "@/src/styles";
// import { Pokemon } from "@/src/types/types";

const PokemonListScreen = observer(() => {
  useEffect(() => {
    pokemonStore.fetchPokemon();
  }, []);

  const renderItem = ({ item }: { item: Pokemon }) => (
    <View style={styles.pokemonItem}>
      <Image
        source={{
          uri: `http://localhost:8080/icon/${item.name.toLowerCase()}`,
        }}
        style={styles.pokemonImage}
      />
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
      {pokemonStore.loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Button
            title="Sort Ascending"
            onPress={() => pokemonStore.sortPokemonList("asc")}
          />
          <Button
            title="Sort Descending"
            onPress={() => pokemonStore.sortPokemonList("desc")}
          />
          <Button
            title="Filter Fire Type"
            onPress={() => pokemonStore.filterPokemonList("Fire")}
          />
          <FlatList
            data={pokemonStore.pokemonList}
            keyExtractor={(item) => item.number.toString()}
            renderItem={renderItem}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              pokemonStore.fetchNextPage();
            }}
          />
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  pokemonItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pokemonImage: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  pokemonDetails: {
    justifyContent: "center",
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default PokemonListScreen;
