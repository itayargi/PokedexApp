import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { observer } from "mobx-react-lite";
import { pokemonStore } from "@/store/PokemonStore";
import { Picker } from "@react-native-picker/picker";
import { goBack } from "@/navigation/navigationRef";
import { SortByNumber } from "@/utils/enum"; // Import the enum

const FilterSortScreen = observer(() => {
  const handleTypeChange = (type: string | undefined) => {
    pokemonStore.setSelectedType(type);
  };

  const handleSortChange = (order: SortByNumber) => {
    pokemonStore.setSortOrder(order);
  };

  const handleSearchQueryChange = (query: string) => {
    pokemonStore.setSearchQuery(query);
  };

  const applyAndGoBack = async () => {
    await pokemonStore.fetchPokemon(
      pokemonStore.selectedType,
      pokemonStore.searchQuery
    );
    if (pokemonStore.sortOrder) {
      pokemonStore.sortPokemonList(pokemonStore.sortOrder);
    }
    goBack();
  };

  const resetFilters = () => {
    pokemonStore.resetFilters();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter Pokémon</Text>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Filter by Type:</Text>
        <Picker
          selectedValue={pokemonStore.selectedType}
          style={styles.picker}
          onValueChange={handleTypeChange}
        >
          <Picker.Item label="All" value={undefined} />
          {pokemonStore.availableTypes.map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Search by Name or Attribute:</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Enter Pokémon name or attribute..."
        value={pokemonStore.searchQuery}
        onChangeText={handleSearchQueryChange}
      />

      <Text style={styles.label}>Sort by Number:</Text>
      <View style={styles.sortButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            pokemonStore.sortOrder === SortByNumber.Ascending &&
              styles.activeSortButton,
          ]}
          onPress={() => handleSortChange(SortByNumber.Ascending)}
        >
          <Text style={styles.sortButtonText}>Ascending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            pokemonStore.sortOrder === SortByNumber.Descending &&
              styles.activeSortButton,
          ]}
          onPress={() => handleSortChange(SortByNumber.Descending)}
        >
          <Text style={styles.sortButtonText}>Descending</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={resetFilters}
        >
          <Text style={styles.buttonText}>Reset Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.applyButton]}
          onPress={applyAndGoBack}
        >
          <Text style={styles.buttonText}>Apply and Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  dropdownContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  picker: {
    height: 180, 
    width: "100%",
  },
  searchInput: {
    height: 50,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sortButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  sortButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#007BFF",
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeSortButton: {
    backgroundColor: "#28a745",
  },
  sortButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  spacer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: "#d9534f",
  },
  applyButton: {
    backgroundColor: "#5cb85c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FilterSortScreen;
