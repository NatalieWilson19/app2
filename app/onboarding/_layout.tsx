import { AuthStoreContext } from "@/store/auth";
import { SavedStoreContext } from "@/store/saved";
import { AuthStatus } from "@/types/auth_status";
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";

export default function OnboardingStackLayout() {
  const { authStatus } = useContext(AuthStoreContext);
  const { saved } = useContext(SavedStoreContext);
  const { chainUID: currentChainUID } = saved;
  if (authStatus === AuthStatus.LoggedIn) {
    if (currentChainUID) {
      console.info("back to home");
      return <Redirect href="/(auth)/(tabs)/(index)" />;
    } else {
      console.info("back to select-chain");
      return <Redirect href="/(auth)/select-chain" />;
    }
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="step1" options={{}} />
      <Stack.Screen name="step2" options={{}} />
      <Stack.Screen name="login" options={{}} />
    </Stack>
  );
}
