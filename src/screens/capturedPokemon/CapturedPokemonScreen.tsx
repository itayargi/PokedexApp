import BG from "@/components/bg/BG";
import ActionButton from "@/components/buttons/ActionButton";
import ImageComponent from "@/components/image/ImageComponent";
import { pokemonStore } from "@/store/PokemonStore";
import { globalStyles } from "@/styles";
import { Pokemon } from "@/types/types";
import colors from "@/utils/colors";
import { PokemonStatus } from "@/utils/enum";
import strings from "@/utils/strings";
import { observer } from "mobx-react-lite";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const CapturedPokemonScreen = observer(() => {
  const capturedPokemonList = pokemonStore.capturePokemonArray;

  const renderItem = ({ item }: { item: Pokemon }) => (
    <BG colorsArray={colors.captureItemGradient} style={styles.pokemonItem}>
      <ImageComponent style={styles.pokemonImage} name={item.name} />
      <View style={styles.pokemonDetails}>
        <Text style={styles.pokemonName}>{item.name}</Text>
        <ActionButton
          title={PokemonStatus.Release}
          onPress={() => pokemonStore.releasePokemon(item)}
        />
      </View>
    </BG>
  );

  return (
    <BG colorsArray={colors.releaseGradient} style={styles.screenBackground}>
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
    </BG>
  );
});

const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pokemonItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  pokemonImage: {
    width: 70,
    height: 70,
    marginRight: 15,
    borderRadius: 8,
  },
  pokemonDetails: {
    flex: 1,
    justifyContent: "center",
  },
  pokemonName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CapturedPokemonScreen;
