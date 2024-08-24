import { makeAutoObservable, action, runInAction, observable } from "mobx";
import axiosInstance from "../api/interceptor";
import { Pokemon, PokemonStoreInterface } from "../types/types";
import { SortByNumber } from "@/utils/enum";
import * as Contacts from "expo-contacts";
import { Alert } from "react-native";

class PokemonStore implements PokemonStoreInterface {
  pokemonList: Pokemon[] = [];
  capturePokemonArray: Pokemon[] = []; // Store full captured Pokemon objects
  capturedPokemonSet: Set<string> = new Set(); // Use a Set to store captured Pokémon names
  availableTypes: string[] = [];
  loading = false;
  currentPage = 0;
  selectedType: string | undefined = undefined;
  sortOrder: SortByNumber | undefined = undefined;
  searchQuery: string = "";
  noMorePokemons: boolean = false;

  constructor() {
    makeAutoObservable(this, {
      loading: observable,
      availableTypes: observable,
      pokemonList: observable,
      capturedPokemonSet: observable,
      selectedType: observable,
      sortOrder: observable,
      searchQuery: observable,
      capturePokemonArray: observable,
      setPokemonList: action,
      fetchPokemonData: action,
      sortPokemonList: action,
      filterPokemonList: action,
      markAsCaptured: action,
      releasePokemon: action,
      setLoading: action,
      appendPokemonList: action,
      setAvailableTypes: action,
      setSearchQuery: action,
      setSelectedType: action,
      setSortOrder: action,
      resetFilters: action,
      loadCapturedPokemon: action,
      updateCapturedStatus: action,
      setCurrentPage: action,
    });
  }

  setPokemonList(pokemonList: Pokemon[]) {
    this.pokemonList = pokemonList;
  }

  setSelectedType(type: string | undefined) {
    this.selectedType = type;
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  setSortOrder(order: SortByNumber | undefined) {
    this.sortOrder = order;
  }

  async resetFilters() {
    this.selectedType = undefined;
    this.sortOrder = undefined;
    this.searchQuery = "";
    this.currentPage = 0;
    await this.fetchPokemonData(true);
  }

  generateUniqueId = (pokemon: Pokemon): string => {
    return `${pokemon.number}_${pokemon.name}_${new Date().getTime()}`;
  };

  setLoading(status: boolean) {
    this.loading = status;
  }

  setAvailableTypes(types: string[]) {
    this.availableTypes = types;
  }

  appendPokemonList(pokeList: Pokemon[]) {
    const newList = pokeList.map((pokemon) => ({
      ...pokemon,
      id: `${pokemon.number}_${pokemon.name}`, // Ensure unique and consistent ID
      captured: this.capturedPokemonSet.has(pokemon.name), // Use captured status from Set
    }));

    const types: string[] = [
      ...new Set(
        newList.flatMap((pokemon) => [pokemon.type_one, pokemon.type_two])
      ),
    ].filter(Boolean);

    this.setPokemonList(newList);
    this.setAvailableTypes(types);
  }

  async loadCapturedPokemon() {
    try {
      const response = await axiosInstance.get<Pokemon[]>("/captured");

      runInAction(() => {
        this.capturedPokemonSet.clear();
        response.data.forEach((pokemon) =>
          this.capturedPokemonSet.add(pokemon.name)
        );
        this.capturePokemonArray = response.data;
        this.updateCapturedStatus();
      });
    } catch (error) {
      console.error("Failed to load captured Pokémon:", error);
    }
  }

  setCurrentPage(number: number) {
    this.currentPage = number;
  }

  async fetchPokemonData(resetList = false) {
    try {
      this.setLoading(true);

      // Reset current page if we're resetting the list
      if (resetList) {
        this.currentPage = 0;
      }

      const params: Record<string, string | undefined> = {
        type: this.selectedType,
        search: this.searchQuery,
        page: (this.currentPage + 1).toString(),
        limit: "20",
      };

      const response = await axiosInstance.get<Pokemon[]>("/pokemon", {
        params,
      });
      runInAction(() => {
        if (response.data.length > 0) {
          // Increment the page only if data is fetched
          this.currentPage++;
          this.appendPokemonList(response.data);
          this.noMorePokemons = false; // More data might be available
        } else {
          this.noMorePokemons = true; // No more data available
        }
        this.setLoading(false);
      });
    } catch (error) {
      console.error("Failed to fetch Pokémon data:", error);
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  sortPokemonList = (order: SortByNumber) => {
    runInAction(() => {
      this.pokemonList = this.pokemonList.slice().sort((a, b) => {
        return order === SortByNumber.Ascending
          ? a.number - b.number
          : b.number - a.number;
      });
    });
  };

  filterPokemonList = (type: string) => {
    runInAction(() => {
      this.pokemonList = this.pokemonList.filter(
        (pokemon) => pokemon.type_one === type || pokemon.type_two === type
      );
    });
  };

  async markAsCaptured(pokemon: Pokemon) {
    try {
      this.setLoading(true);
      const res = await axiosInstance.post("/capture", { name: pokemon.name });
      if (res.status === 200) {
        runInAction(() => {
          if (!this.capturedPokemonSet.has(pokemon.name)) {
            this.capturedPokemonSet.add(pokemon.name);
            this.updateCapturedStatus(pokemon.name, true);
            this.capturePokemonArray = [...this.capturePokemonArray, pokemon];
          }
          this.setLoading(false);
        });
        
      }
    } catch (error) {
      this.setLoading(false);
      console.error("Failed to mark Pokémon as captured on server:", error);
    }
  }

  async saveAsContact(pokemon: Pokemon) {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Cannot access contacts without permission."
      );
      return;
    }

    const contact = {
      [Contacts.Fields.FirstName]: pokemon.name,
      [Contacts.Fields.Company]: "Pokémon",
      [Contacts.Fields.Note]: `Type: ${pokemon.type_one}${
        pokemon.type_two ? ` / ${pokemon.type_two}` : ""
      }, Number: ${pokemon.number}, HP: ${pokemon.hit_points}, Attack: ${
        pokemon.attack
      }, Defense: ${pokemon.defense}`,
      contactType: Contacts.ContactTypes.Person,
    };

    try {
      const contactId = await Contacts.addContactAsync(
        contact as Contacts.Contact
      );
      if (contactId) {
        this.markAsCaptured(pokemon);
        Alert.alert(
          "Success",
          `${pokemon.name} has been added to your contacts.`
        );
      }
    } catch (error) {
      console.error("Failed to save contact:", error);
      Alert.alert("Error", "Failed to save contact.");
    }
  }

  async releasePokemon(pokemon: Pokemon) {
    try {
      // First, remove the Pokémon from the contacts
      const contacts = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name],
      });

      const contact = contacts.data.find((c) => c.name === pokemon.name);
      if (contact && contact.id) {
        await Contacts.removeContactAsync(contact.id);
      }

      // Then, update the captured status on the server
      const res = await axiosInstance.post("/release", { name: pokemon.name });
      if (res.status === 200) {
        runInAction(() => {
          // Remove the Pokémon from the captured set locally
          if (this.capturedPokemonSet.has(pokemon.name)) {
            this.capturedPokemonSet.delete(pokemon.name);
          }

          // Update the captured Pokemon array to reflect the release
          this.capturePokemonArray = this.capturePokemonArray.filter(
            (p) => p.name !== pokemon.name
          );

          // Update the status in the list of all Pokémon
          this.updateCapturedStatus(pokemon.name, false);
        });
        Alert.alert(
          "Released",
          `${pokemon.name} has been removed from your contacts and released.`
        );
      }
    } catch (error) {
      console.error("Failed to release Pokémon:", error);
      Alert.alert("Error", "Failed to release Pokémon.");
    }
  }

  updateCapturedStatus(name?: string, captured?: boolean) {
    this.pokemonList = this.pokemonList.map((pokemon) =>
      pokemon.name === name
        ? {
            ...pokemon,
            captured: captured ?? this.capturedPokemonSet.has(pokemon.name),
          }
        : { ...pokemon, captured: this.capturedPokemonSet.has(pokemon.name) }
    );
  }
}

export const pokemonStore = new PokemonStore();
