import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { ScreenName } from "@/utils/enum";
import { wait } from "@/utils/functionUtils";
import { navigate } from "@/navigation/navigationRef";
import imageIndex from "assets/images/imageIndex";
import { pokemonStore } from "@/store/PokemonStore";

type Props = {};

const Splash = (props: Props) => {
  useEffect(() => {
    const onInit = async () => {
      pokemonStore.setLoading(true);
      await pokemonStore.fetchPokemon();
      await pokemonStore.loadCapturedPokemon(); // Load captured Pokémon from the server
      wait(1500).then(() => {
        pokemonStore.setLoading(false);
        navigate(ScreenName.PokemonList);
      });
    };
    onInit();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        resizeMode="stretch"
        source={imageIndex.splash()}
        style={styles.image}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
