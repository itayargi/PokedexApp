import { pokemonStore } from "@/store/PokemonStore";
import { ScreenName } from "@/utils/enum";
import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CapturedPokemonScreen from "../capturedPokemon/CapturedPokemonScreen";
import PokemonListScreen from "../pokemonList/PokemonListScreen";
import { observer } from "mobx-react-lite";
import { View, Text, ActivityIndicator } from "react-native";
import strings from "@/utils/strings";

const Tab = createBottomTabNavigator();

const HomeScreen = observer(() => {
  const [initialized, setInitialized] = React.useState(false);

  useEffect(() => {
    const onInit = async () => {
      await pokemonStore.getPokemonAndCaptured();
      setInitialized(true); // Set initialized to true after data is loaded
      //   pokemonStore.setCurrentPage(1)
    };
    onInit();
  }, []);

  if (!initialized) {
    //render homescreen loader
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* <ActivityIndicator size="large" color="#007BFF" /> */}
        <Text>{strings.homeScreen_initLoader}</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
      })}
      initialRouteName={ScreenName.PokemonList}
    >
      <Tab.Screen
        name={ScreenName.PokemonList}
        component={PokemonListScreen}
        options={{
          tabBarLabel: strings.homeTabs_home,
        }}
      />
      <Tab.Screen
        name={ScreenName.CapturedPokemon}
        component={CapturedPokemonScreen}
        options={{
          tabBarLabel: strings.homeTabs_captured,
        }}
      />
    </Tab.Navigator>
  );
});

export default HomeScreen;
