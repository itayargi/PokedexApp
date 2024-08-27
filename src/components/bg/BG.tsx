import colors from "@/utils/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = {
  style?: StyleProp<ViewStyle>;
  colorsArray?: string[];
  children: React.ReactNode;
};

const BG = (props: Props) => {
  const { style, colorsArray, children } = props;
  const gradientColors = colorsArray ?? colors.releaseGradient;
  return (
    <LinearGradient colors={gradientColors} style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );
};

export default BG;

const styles = StyleSheet.create({
  gradient: {
    flexGrow: 1,
  },
});
