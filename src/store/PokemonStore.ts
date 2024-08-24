import { makeAutoObservable, action, runInAction, observable } from "mobx";
import axiosInstance from "../api/interceptor";
import { Pokemon, PokemonStoreInterface } from "../types/types";
import { SortByNumber } from "@/utils/enum";
import { goBack } from "@/navigation/navigationRef";

class PokemonStore implements PokemonStoreInterface {
  pokemonList: Pokemon[] = [];
  capturedPokemon: Pokemon[] = [];
  availableTypes: string[] = [];
  loading = false;
  currentPage = 0;
  selectedType: string | undefined = undefined; // New state for filter type
  sortOrder: SortByNumber | undefined = undefined; // New state for sort order
  searchQuery: string = "";

  constructor() {
    makeAutoObservable(this, {
      loading: observable,
      availableTypes: observable,
      pokemonList: observable,
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
    });
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

  // Utility function to generate a unique ID for each Pokemon
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
    }));
    this.pokemonList = newList;
    // Extract unique types from the list of Pokémon
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

      // Clear the current list when fetching new data
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

  sortPokemonList = (order: "asc" | "desc") => {
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

  markAsCaptured = (pokemon: Pokemon) => {
    runInAction(() => {
      if (!this.capturedPokemon.some((p) => p.id === pokemon.id)) {
        pokemon.captured = true;
        this.capturedPokemon.push(pokemon);
      }
    });
  };

  releasePokemon = (pokemon: Pokemon) => {
    runInAction(() => {
      this.capturedPokemon = this.capturedPokemon.filter(
        (p) => p.id !== pokemon.id
      );
    });
  };
}

export const pokemonStore = new PokemonStore();
