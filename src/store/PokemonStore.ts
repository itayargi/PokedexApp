import { makeAutoObservable, action, runInAction, observable } from "mobx";
import axiosInstance from "../api/interceptor";
import {
  IError,
  IErrorState,
  Pokemon,
  PokemonStoreInterface,
} from "../types/types";
import { AsyncStorageItem, ServiceName, SortByNumber } from "@/utils/enum";
import * as Contacts from "expo-contacts";
import { Alert } from "react-native";
import strings from "@/utils/strings";
import { logDev } from "@/utils/functionUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

class PokemonStore implements PokemonStoreInterface {
  pokemonList: Pokemon[] = [];
  capturePokemonArray: Pokemon[] = [];
  capturedPokemonSet: Set<string> = new Set();
  availableTypes: string[] = [];
  loading = false;
  currentPage: number = 0;
  selectedType: string | undefined = undefined;
  sortOrder: SortByNumber | undefined = undefined;
  searchQuery: string = "";
  noMorePokemons: boolean = false;
  requestsError: IErrorState = {} as IErrorState;

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
      requestsError: observable,
      setPokemonList: action,
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
      updateError: action,
      clearErrorByService: action,
    });
  }

  setPokemonList(pokemonList: Pokemon[]) {
    this.pokemonList = pokemonList;
  }

  setSelectedType(type: string | undefined) {
    this.selectedType = type;
  }

  updateError(error: IError) {
    this.requestsError[error.serviceName] = error;
  }

  clearErrorByService(serviceName: ServiceName) {
    this.requestsError[serviceName] = null;
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  setSortOrder(order: SortByNumber | undefined) {
    this.sortOrder = order;
  }

  async resetFilters() {
    runInAction(() => {
      this.selectedType = undefined;
      this.sortOrder = undefined;
      this.searchQuery = "";
    });
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
      id: `${pokemon.number}_${pokemon.name}`,
      captured: this.capturedPokemonSet.has(pokemon.name),
    }));

    const types: string[] = [
      ...new Set(
        newList.flatMap((pokemon) => [pokemon.type_one, pokemon.type_two])
      ),
    ].filter(Boolean);

    runInAction(() => {
      this.setPokemonList(newList);
      this.setAvailableTypes(types);
    });
  }

  async loadCapturedPokemon() {
    try {
      const response = await axiosInstance.get<Pokemon[]>("/captured");
      runInAction(() => {
        this.capturedPokemonSet.clear();
        this.clearErrorByService(ServiceName.LoadCapturedPokemon);
        response.data.forEach((pokemon) =>
          this.capturedPokemonSet.add(pokemon.name)
        );
        this.capturePokemonArray = response.data;
        this.updateCapturedStatus();
      });
    } catch (error) {
      this.handleRequestError(ServiceName.LoadCapturedPokemon, error);
      logDev("error loadCapturedPokemon", error);
    }
  }

  setCurrentPage(number: number) {
    this.currentPage = number;
    AsyncStorage.setItem(AsyncStorageItem.CURRENT_PAGE_KEY, number.toString());
  }
  async loadCurrentPage() {
    try {
      const savedPage = await AsyncStorage.getItem(
        AsyncStorageItem.CURRENT_PAGE_KEY
      );
      if (savedPage) {
        this.setCurrentPage(parseInt(savedPage, 10) -1);
      }
    } catch (error) {
      console.error("Failed to load current page:", error);
    }
  }
  async getPokemons(page?: number) {
    try {
      this.setLoading(true);
      const params: Record<string, string | undefined> = {
        type: this.selectedType,
        search: this.searchQuery,
        page: page?.toString() || (this.currentPage + 1).toString(),
        limit: "20",
      };
      const response = await axiosInstance.get<Pokemon[]>("/pokemon", {
        params,
      });

      runInAction(() => {
        this.setCurrentPage(page !== undefined ? page : this.currentPage + 1);
        this.clearErrorByService(ServiceName.GetPokemons);
        if (response.data.length > 0) {
          this.appendPokemonList(response.data);
          this.noMorePokemons = false;
        } else {
          this.noMorePokemons = true;
          this.appendPokemonList(response.data);

        }
        this.setLoading(false);
      });
    } catch (error) {
      this.handleRequestError(ServiceName.GetPokemons, error);
      logDev("error getPokemons", error);
      this.setLoading(false);
    }
  }

  async getPokemonAndCaptured() {
    this.setLoading(true);
    await this.loadCapturedPokemon();
    await this.getPokemons();
    this.setLoading(false);
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
      this.handleRequestError(ServiceName.LoadCapturedPokemon, error);
      logDev("error markAsCaptured", error);
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
      this.handleRequestError(ServiceName.SaveAsContact, error);
      Alert.alert("Error", "Failed to save contact.");
    }
  }

  async releasePokemon(pokemon: Pokemon) {
    try {
      const contacts = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name],
      });

      const contact = contacts.data.find((c) => c.name === pokemon.name);
      if (contact && contact.id) {
        await Contacts.removeContactAsync(contact.id);
      }

      const res = await axiosInstance.post("/release", { name: pokemon.name });
      if (res.status === 200) {
        runInAction(() => {
          if (this.capturedPokemonSet.has(pokemon.name)) {
            this.capturedPokemonSet.delete(pokemon.name);
          }

          this.capturePokemonArray = this.capturePokemonArray.filter(
            (p) => p.name !== pokemon.name
          );

          this.updateCapturedStatus(pokemon.name, false);
        });
        Alert.alert(
          "Released",
          `${pokemon.name} has been removed from your contacts and released.`
        );
      }
    } catch (error) {
      this.handleRequestError(ServiceName.ReleasePokemon, error);
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

  handleRequestError(serviceName: ServiceName, error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    const errorObj: IError = {
      title: strings.errorTitle,
      subTitle: errorMessage,
      serviceName,
    };
    this.updateError(errorObj);
    logDev(`Error in ${serviceName}:`, errorMessage);
  }
}

export const pokemonStore = new PokemonStore();
