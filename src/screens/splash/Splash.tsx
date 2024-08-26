import { resetAndNavigate } from "@/navigation/navigationRef";
import { pokemonStore } from "@/store/PokemonStore";
import { ScreenName } from "@/utils/enum";
import { wait } from "@/utils/functionUtils";
import imageIndex from "assets/images/imageIndex";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {};

const Splash = (props: Props) => {
  useEffect(() => {
    const onInit = async () => {
      await pokemonStore.loadCurrentPage();
      wait(2000).then(() => {
        resetAndNavigate(ScreenName.HomeScreen);
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
