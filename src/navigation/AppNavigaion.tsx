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
import FilterSortScreen from "@/screens/filter/FilterSortScreen";
import { View } from "react-native";
import HomeScreen from "@/screens/homeScreen/HomeScreen";

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator screenOptions={{}} initialRouteName={ScreenName.Splash}>
      <Stack.Screen name={ScreenName.Splash} component={Splash} />
      <Stack.Screen
        name={ScreenName.FilterSort}
        component={FilterSortScreen}
        options={{ headerBackTitle: " " }}
      />
      <Stack.Screen
        name={ScreenName.HomeScreen}
        component={HomeScreen}
        options={{ headerLeft: () => null }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
