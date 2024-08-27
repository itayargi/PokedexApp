import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { observer } from "mobx-react-lite";
import { pokemonStore } from "@/store/PokemonStore";
import { Pokemon } from "@/types/types";
import { globalStyles } from "@/styles";
import { navigate } from "@/navigation/navigationRef";
import { PokemonStatus, ScreenName } from "@/utils/enum";
import ImageComponent from "@/components/image/ImageComponent";
import imageIndex from "assets/images/imageIndex";
import { sizes } from "@/utils/functionUtils";
import strings from "@/utils/strings";
import ActionButton from "@/components/buttons/ActionButton";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/utils/colors";

const PokemonListScreen = observer(() => {
  const flatListRef = useRef<FlatList>(null);
  const currentPage = pokemonStore.currentPage;
  const isNextBtnDisabled =
    pokemonStore.pokemonList.length < 20 ||
    pokemonStore.noMorePokemons ||
    pokemonStore.loading;
  const isPriviousDisabled =
    pokemonStore.pokemonList.length === 0 ||
    (currentPage <= 1 && !pokemonStore.noMorePokemons) ||
    pokemonStore.loading;
  // Scroll to the top when currentPage changes
  React.useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [currentPage]);

  const handleNextPage = async () => {
    if (pokemonStore.loading || pokemonStore.noMorePokemons) return;
    await pokemonStore.getPokemons();
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1 && !pokemonStore.loading) {
      await pokemonStore.getPokemons(pokemonStore.currentPage - 1);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Pokemon }) => (
      <View style={styles.pokemonItem}>
        <ImageComponent name={item.name} />
        <View style={styles.pokemonDetails}>
          <Text style={styles.pokemonName}>{item.name}</Text>
          <Text>
            {strings.pokemone_type} {item.type_one}
            {item.type_two ? ` / ${item.type_two}` : ""}
          </Text>
          <Text>
            {strings.pokemone_number} {item.number}
          </Text>
          <Text>
            {strings.pokemone_hp} {item.hit_points}
          </Text>
          <Text>
            {strings.pokemone_attack} {item.attack}
          </Text>
          <Text>
            {strings.pokemone_defence} {item.defense}
          </Text>
          <ActionButton
            title={item.captured ? PokemonStatus.Release : PokemonStatus.Catch}
            colors={
              item.captured ? colors.releaseGradient : colors.catchGradient
            }
            onPress={() =>
              item.captured
                ? pokemonStore.releasePokemon(item)
                : pokemonStore.saveAsContact(item)
            }
          />
        </View>
      </View>
    ),
    []
  );
  const EmptyComponent = () => {
    return pokemonStore.requestsError.GetPokemons?.title ? (
      <>
        <Image source={imageIndex.error()} style={styles.error} />
      </>
    ) : (
      <>
        <Text style={styles.noPosts}>{strings.no_posts}</Text>
      </>
    );
  };
  return (
    <View style={[globalStyles.container, { paddingTop: 0 }]}>
      <TouchableOpacity onPress={() => navigate(ScreenName.FilterSort)}>
        <LinearGradient
          colors={colors.filterGradient}
          style={styles.headerButtonsContainer}
        >
          <Text style={styles.headerButtonText}>{strings.filter_btn_text}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={pokemonStore.pokemonList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        bounces={false}
        initialNumToRender={10}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        ListEmptyComponent={EmptyComponent}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination Controls */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            isPriviousDisabled && styles.disabledButton,
          ]}
          onPress={handlePreviousPage}
          disabled={isPriviousDisabled}
        >
          <Text style={styles.paginationButtonText}>
            {strings.previous_page_btn}
          </Text>
        </TouchableOpacity>
        <Text style={styles.pageNumberText}>
          {strings.page} {currentPage}
        </Text>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            isNextBtnDisabled && styles.disabledButton,
          ]}
          onPress={handleNextPage}
          disabled={isNextBtnDisabled}
        >
          <Text style={styles.paginationButtonText}>
            {strings.next_page_btn}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  headerButtonsContainer: {
    alignItems: "center",
    height: 50,
    marginTop: 0,
    backgroundColor: "#007BFF",
    width: sizes.pageWidth,
    justifyContent: "center",
    alignSelf: "center",
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  pokemonItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#f8f8f8",
  },
  pageNumberText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  paginationButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
  },
  paginationButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ddd",
  },
  error: {
    width: "100%",
    height: sizes.pageHeight * 0.5,
  },
  noPosts: {
    textAlign: "center",
    fontSize: 18,
  },
});

export default PokemonListScreen;
