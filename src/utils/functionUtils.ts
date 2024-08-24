import { pokemonStore } from "@/store/PokemonStore";
import { Pokemon } from "@/types/types";

export const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export const isPokemonCaptured = (pokemon: Pokemon) => {
  const id = pokemon.id;
  const isCaptured = pokemonStore.capturedPokemon.find((pok) => pok.id === id);
  return isCaptured !== undefined;
};
