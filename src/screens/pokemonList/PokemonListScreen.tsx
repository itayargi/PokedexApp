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
import { ScreenName } from "@/utils/enum";
import ImageComponent from "@/components/image/ImageComponent";
import imageIndex from "assets/images/imageIndex";
import { sizes } from "@/utils/functionUtils";

const PokemonListScreen = observer(() => {
  const flatListRef = useRef<FlatList>(null);
  const currentPage = pokemonStore.currentPage;
  const isNextBtnDisabled =
    pokemonStore.pokemonList.length < 20 ||
    pokemonStore.noMorePokemons ||
    pokemonStore.loading;
  const isPriviousDisabled =
    (currentPage <= 1 && !pokemonStore.noMorePokemons) || pokemonStore.loading;
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
        <Text>No posts...</Text>
      </>
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
      </View>

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
          <Text style={styles.paginationButtonText}>Previous Page</Text>
        </TouchableOpacity>
        <Text style={styles.pageNumberText}>Page: {currentPage}</Text>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            isNextBtnDisabled && styles.disabledButton,
          ]}
          onPress={handleNextPage}
          disabled={isNextBtnDisabled}
        >
          <Text style={styles.paginationButtonText}>Next Page</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  headerButtonsContainer: {
    alignItems: "center",
    height: 40,
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
    width:'100%',
    height:sizes.pageHeight * 0.5,
  },
});

export default PokemonListScreen;
