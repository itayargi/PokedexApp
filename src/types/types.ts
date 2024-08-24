import { ScreenName } from "../utils/enum";

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
  pokemonList: Pokemon[];
  loading: boolean;
  fetchPokemon: () => Promise<void>;
}
export type AppNavigationParams = {
  [ScreenName.Splash]: undefined;
  [ScreenName.PokemonList]: undefined;
  [ScreenName.CapturedPokemon]: undefined;
};
