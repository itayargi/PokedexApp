import { makeAutoObservable, action, runInAction, observable } from "mobx";
import axiosInstance from "../api/interceptor";
import { Pokemon, PokemonStoreInterface } from "../types/types";
import { SortByNumber } from "@/utils/enum";
import { goBack } from "@/navigation/navigationRef";
import * as Contacts from "expo-contacts";
import { Alert } from "react-native";

class PokemonStore implements PokemonStoreInterface {
  pokemonList: Pokemon[] = [];
  capturedPokemon: Pokemon[] = [];
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
      capturedPokemon: observable,
      selectedType: observable,
      sortOrder: observable,
      searchQuery: observable,
      fetchPokemon: action,
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
    });

    this.loadCapturedPokemon(); // Load captured Pokémon on initialization
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
    goBack();
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
    const newList = pokeList.map((pokemon) => {
      const capturedPokemon = this.capturedPokemon.find(
        (p) => p.name === pokemon.name
      );
      return {
        ...pokemon,
        id: this.generateUniqueId(pokemon),
        captured: !!capturedPokemon, // Update the captured status
      };
    });
    this.pokemonList = newList;

    const types: string[] = [
      ...new Set(
        newList.flatMap((pokemon) => [pokemon.type_one, pokemon.type_two])
      ),
    ].filter(Boolean);

    this.setAvailableTypes(types);
  }

  fetchPokemon = async (typeFilter?: string, searchQuery?: string) => {
    try {
      this.setLoading(true);
      this.pokemonList = [];

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
        return order === "asc" ? a.number - b.number : b.number - a.number;
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

  async loadCapturedPokemon() {
    try {
      const response = await axiosInstance.get<string[]>("/captured");
      const capturedNames = response.data;

      // Match the names with full Pokemon data
      const capturedPokemons = this.pokemonList.filter((pokemon) =>
        capturedNames.includes(pokemon.name)
      );

      runInAction(() => {
        this.capturedPokemon = capturedPokemons.map((pokemon) => ({
          ...pokemon,
          captured: true,
        }));
      });
    } catch (error) {
      console.error("Failed to load captured Pokémon:", error);
    }
  }

  async markAsCaptured(pokemon: Pokemon) {
    try {
    const res =   await axiosInstance.post("/capture", { name: pokemon.name });
      runInAction(() => {
        if (!this.capturedPokemon.some((p) => p.name === pokemon.name)) {
          pokemon.captured = true;
          this.capturedPokemon.push(pokemon);
          this.updateCapturedStatus(pokemon.name, true); // Ensure the status is updated
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
          this.capturedPokemon = this.capturedPokemon.filter(
            (p) => p.name !== pokemon.name
          );
          this.updateCapturedStatus(pokemon.name, false); // Ensure the status is updated
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
