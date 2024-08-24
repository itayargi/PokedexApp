import React, { useState } from "react";
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
import { SortByNumber } from "@/utils/enum";

const FilterSortScreen = observer(() => {
  // Local state to temporarily store the user's choices
  const [selectedType, setSelectedType] = useState<string | undefined>(
    pokemonStore.selectedType
  );
  const [sortOrder, setSortOrder] = useState<SortByNumber | undefined>(
    pokemonStore.sortOrder
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    pokemonStore.searchQuery
  );

  const applyAndGoBack = async () => {
    // Apply the changes to the store
    pokemonStore.setSelectedType(selectedType);
    pokemonStore.setSortOrder(sortOrder);
    pokemonStore.setSearchQuery(searchQuery);

    await pokemonStore.fetchPokemonData(true);
    if (sortOrder) {
      pokemonStore.sortPokemonList(sortOrder);
    }

    goBack();
  };

  const resetFilters = () => {
    pokemonStore.resetFilters();
    setSelectedType(undefined);
    setSortOrder(undefined);
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter Pokémon</Text>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Filter by Type:</Text>
        <Picker
          selectedValue={selectedType}
          style={styles.picker}
          onValueChange={setSelectedType}
        >
          <Picker.Item label="All" value={undefined} />
          {pokemonStore.availableTypes.map((type, index) => (
            <Picker.Item key={index} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Search by Name or Attribute:</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Enter Pokémon name or attribute..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Text style={styles.label}>Sort by Number:</Text>
      <View style={styles.sortButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === SortByNumber.Ascending && styles.activeSortButton,
          ]}
          onPress={() => setSortOrder(SortByNumber.Ascending)}
        >
          <Text style={styles.sortButtonText}>Ascending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === SortByNumber.Descending && styles.activeSortButton,
          ]}
          onPress={() => setSortOrder(SortByNumber.Descending)}
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
