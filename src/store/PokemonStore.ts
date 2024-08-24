import { makeAutoObservable, action, runInAction, observable } from "mobx";
import axiosInstance from "../api/interceptor";
import { Pokemon, PokemonStoreInterface } from "../types/types";
import { SortByNumber } from "@/utils/enum";
import * as Contacts from "expo-contacts";
import { Alert } from "react-native";

class PokemonStore implements PokemonStoreInterface {
  pokemonList: Pokemon[] = [];
  capturedPokemonSet: Set<string> = new Set(); // Use a Set to store captured Pokémon names
  availableTypes: string[] = [];
  loading = false;
  currentPage = 0;
  selectedType: string | undefined = undefined;
  sortOrder: SortByNumber | undefined = undefined;
  searchQuery: string = "";

  constructor() {
    makeAutoObservable(this, {
      loading: observable,
      availableTypes: observable,
      pokemonList: observable,
      capturedPokemonSet: observable,
      selectedType: observable,
      sortOrder: observable,
      searchQuery: observable,
      fetchPokemon: action,
      setPokemonList: action,
      fetchNextPage: action,
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
    await this.fetchPokemon();
  }

  generateUniqueId = (pokemon: Pokemon): string => {
    return `${pokemon.number}_${pokemon.name}`;
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
      id: this.generateUniqueId(pokemon),
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

  fetchPokemon = async (typeFilter?: string, searchQuery?: string) => {
    try {
      this.setLoading(true);
      let url = "/pokemon";
      const params: string[] = [];

      if (typeFilter) {
        params.push(`type=${typeFilter}`);
      }
      if (searchQuery) {
        params.push(`search=${searchQuery}`);
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axiosInstance.get<Pokemon[]>(url);
      runInAction(() => {
        this.appendPokemonList(response.data);
        this.setLoading(false);
      });
    } catch (error) {
      console.error("Failed to fetch Pokémon data:", error);
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  async loadCapturedPokemon() {
    try {
      const response = await axiosInstance.get<string[]>("/captured");
      runInAction(() => {
        this.capturedPokemonSet = new Set(response.data);
        this.capturedPokemonList = response.data;
      });
    } catch (error) {
      console.error("Failed to load captured Pokémon:", error);
    }
  }

  fetchNextPage = async () => {
    if (this.loading) return;
    this.setLoading(true);
    try {
      const response = await axiosInstance.get<Pokemon[]>(
        `/pokemon?page=${this.currentPage + 1}`
      );
      runInAction(() => {
        this.appendPokemonList(response.data);
        this.currentPage++;
        this.setLoading(false);
      });
    } catch (error) {
      console.error("Failed to fetch next page of Pokémon:", error);
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

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
      await axiosInstance.post("/capture", { name: pokemon.name });
      runInAction(() => {
        if (!this.capturedPokemonSet.has(pokemon.name)) {
          this.capturedPokemonSet.add(pokemon.name);
          this.updateCapturedStatus(pokemon.name, true);
        }
      });
    } catch (error) {
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
    const contacts = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name],
    });

    const contact = contacts.data.find((c) => c.name === pokemon.name);
    if (contact && contact.id) {
      try {
        await Contacts.removeContactAsync(contact.id);
        runInAction(() => {
          this.capturedPokemonSet.delete(pokemon.name);
          this.updateCapturedStatus(pokemon.name, false);
        });
        Alert.alert(
          "Released",
          `${pokemon.name} has been removed from your contacts.`
        );
      } catch (error) {
        console.error("Failed to release contact:", error);
        Alert.alert("Error", "Failed to release contact.");
      }
    } else {
      Alert.alert(
        "Not Found",
        `${pokemon.name} is not found in your contacts.`
      );
    }
  }

  updateCapturedStatus(name: string, captured: boolean) {
    this.pokemonList = this.pokemonList.map((pokemon) =>
      pokemon.name === name ? { ...pokemon, captured } : pokemon
    );
  }
}

export const pokemonStore = new PokemonStore();
