import { createNavigationContainerRef } from "@react-navigation/native";
import { AppNavigationParams } from "../types/types";
import { ScreenName } from "../utils/enum";

export const navigationRef =
  createNavigationContainerRef<AppNavigationParams>();

//navigation function
export const navigate = (route: ScreenName, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(route, params);
  }
};

export const resetAndNavigate = (route: ScreenName, params = {}) => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: route, params }],
    });
  }
};

export const goBack = () => {
  if (navigationRef.isReady()) navigationRef.goBack();
};

export const getCurrentRoute = () => {
  if (!navigationRef.isReady()) {
    return undefined;
  }
  let route: any = navigationRef.getRootState();
  while ("routes" in route) {
    route = route.routes[route.index ?? 0];
  }

  return route?.name;
};
