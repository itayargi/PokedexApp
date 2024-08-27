import { Dimensions, Platform } from "react-native";

export const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
export const logDev = (...args: any[]): void => {
  __DEV__ && console.log(...args);
};

export const sizes = {
  pageWidth: Dimensions.get("window").width,
  pageHeight: Dimensions.get("window").height,
};

export const IS_IOS = Platform.OS === "ios";
