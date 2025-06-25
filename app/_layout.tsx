import { ThemeProvider } from "@react-navigation/native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import AuthProvider from "@/providers/AuthProvider";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import InitI18n from "@/utils/i18n";
import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import {
  AppState,
  AppStateStatus,
  Platform,
  useColorScheme,
} from "react-native";
import { useTranslation } from "react-i18next";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Colors } from "@/constants/Colors";
import "@/global.css";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });
  return eventSubscription.remove;
});
InitI18n();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const { t } = useTranslation();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? Colors.dark : Colors.light}>
      <ActionSheetProvider>
        <GluestackUIProvider mode="light">
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
              <SafeAreaView
                edges={{ bottom: "off", top: "additive" }}
                style={{ flex: 1, backgroundColor: "#ffffff" }}
              >
                <AuthProvider>
                  <SafeAreaProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                      }}
                    >
                      <Stack.Screen
                        name="(auth)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="onboarding"
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen
                        name="loading"
                        options={{
                          title: t("loading"),
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen
                        name="open-source"
                        options={{
                          title: t("openSource"),
                          headerShown: true,
                          headerBackTitle: t("back"),
                        }}
                      />
                      <Stack.Screen
                        name="privacy-policy"
                        options={{
                          title: t("privacyPolicy"),
                          headerShown: true,
                          headerLargeTitle: true,
                          headerBackTitle: t("back"),
                        }}
                      />
                      <Stack.Screen name="+not-found" />
                    </Stack>
                  </SafeAreaProvider>
                </AuthProvider>
              </SafeAreaView>
            </GestureHandlerRootView>
          </QueryClientProvider>
          <StatusBar style="auto" />
        </GluestackUIProvider>
      </ActionSheetProvider>
    </ThemeProvider>
  );
}
