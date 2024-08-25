import { ErrorType, ScreenName, SortByNumber } from "../utils/enum";

export interface Pokemon {
  captured: boolean;
  number: number;
  name: string;
  type_one: string;
  type_two?: string;
  total: number;
  hit_points: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
  generation: number;
  legendary: boolean;
  id: string;
}

export interface PokemonStoreInterface {
  capturePokemonArray: Pokemon[];
  capturedPokemonSet: Set<string>;
  availableTypes: string[];
  loading: boolean;
  currentPage: number;
  selectedType: string | undefined;
  sortOrder: SortByNumber | undefined;
  searchQuery: string;
  noMorePokemons: boolean;
  requestsError: IError;

  fetchPokemonData: () => Promise<void>;
  loadCapturedPokemon: () => Promise<void>;
  resetFilters: () => Promise<void>;
  sortPokemonList: (order: SortByNumber) => void;
  filterPokemonList: (type: string) => void;
  markAsCaptured: (pokemon: Pokemon) => Promise<void>;
  releasePokemon: (pokemon: Pokemon) => Promise<void>;
  setCurrentPage: (number: number) => void;
  setSelectedType: (type: string | undefined) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: SortByNumber | undefined) => void;
}
export type AppNavigationParams = {
  [ScreenName.Splash]: undefined;
  [ScreenName.FilterSort]: undefined;
  [ScreenName.HomeScreen]: undefined;
  [ScreenName.PokemonList]: undefined;
  [ScreenName.CapturedPokemon]: undefined;
};
export type IError = {
  [key in ErrorType]: {
    title: string;
    subTitle?: string;
  };
};
