import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  colors?: string[];
  textColor?: string;
  style?: object;
};

const ActionButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  colors = ["#ff7e5f", "#feb47b"], // Default gradient colors
  textColor = "#fff",
  style = {},
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[style, styles.button]}>
      <LinearGradient colors={colors} style={styles.gradient}>
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ActionButton;
