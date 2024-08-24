import { makeAutoObservable, action, runInAction, observable } from "mobx";
import axiosInstance from "../api/interceptor";
import { Pokemon, PokemonStoreInterface } from "../types/types";

class PokemonStore implements PokemonStoreInterface {
  pokemonList: Pokemon[] = [];
  capturedPokemon: Pokemon[] = [];
  loading = false;
  currentPage = 0;

  constructor() {
    makeAutoObservable(this, {
      loading: observable,
      fetchPokemon: action,
      fetchNextPage: action,
      sortPokemonList: action,
      filterPokemonList: action,
      markAsCaptured: action,
      releasePokemon: action,
      setLoading: action,
      appendPokemonList: action,
    });
  }

  // Utility function to generate a unique ID for each Pokemon
  generateUniqueId = (pokemon: Pokemon): string => {
    return `${pokemon.number}_${pokemon.name}`;
  };

  setLoading(status: boolean) {
    this.loading = status;
  }

  // Always appends new Pokémon to the existing list
  appendPokemonList(pokeList: Pokemon[]) {
    const newList = pokeList.map((pokemon) => ({
      ...pokemon,
      id: this.generateUniqueId(pokemon),
    }));
    this.pokemonList = [...this.pokemonList, ...newList];
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
        this.appendPokemonList(response.data); // Appending even on initial fetch
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
    if (this.loading) return; // Prevent multiple simultaneous requests
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
