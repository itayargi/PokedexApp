export enum ScreenName {
  Splash = "Splash",
  PokemonList = "PokemonList",
  CapturedPokemon = "CapturedPokemon",
  FilterSort = "FilterSort",
  HomeScreen = "HomeScreen",
}
export enum SortByNumber {
  Ascending = "asc",
  Descending = "desc",
}

export enum ServiceName {
  GetPokemons = "GetPokemons",
  LoadCapturedPokemon = 'LoadCapturedPokemon',
  SaveAsContact = 'SaveAsContact',
  ReleasePokemon = 'ReleasePokemon'
}
export enum AsyncStorageItem {
  CURRENT_PAGE_KEY = 'CURRENT_PAGE_KEY'
}
export enum PokemonStatus {
  Catch = 'Catch',
  Release = 'Release'
}