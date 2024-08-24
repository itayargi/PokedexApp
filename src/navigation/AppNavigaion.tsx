import * as React from "react";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ScreenName } from "../utils/enum";
import Splash from "../screens/splash/Splash";
import PokemonListScreen from "../screens/pokemonList/PokemonListScreen";
import CapturedPokemonScreen from "../screens/capturedPokemon/CapturedPokemonScreen";
import { navigationRef } from "./navigationRef";


const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer independent ref={navigationRef}>
    <Stack.Navigator initialRouteName={ScreenName.Splash}>
      <Stack.Screen name={ScreenName.Splash} component={Splash} />
      <Stack.Screen
        name={ScreenName.PokemonList}
        component={PokemonListScreen}
      />
      <Stack.Screen
        name={ScreenName.CapturedPokemon}
        component={CapturedPokemonScreen}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
