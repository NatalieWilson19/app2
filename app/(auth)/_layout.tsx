import { Redirect, Stack } from "expo-router";
import React, { JSX, useEffect } from "react";
// import { useColorScheme } from "@/hooks/useColorScheme";
import { useTranslation } from "react-i18next";
// import { LogLevel, OneSignal } from "react-native-onesignal";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/store/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chainGet } from "@/api/chain";
import { savedStore } from "@/store/saved";
import { userGetAllByChain } from "@/api/user";
import { catchErrThrow401 } from "@/utils/handleRequests";
import { bagGetAllByChain } from "@/api/bag";
import { routeGetOrder } from "@/api/route";
import { Platform } from "react-native";
import { OneSignal } from "react-native-onesignal";
import { oneSignalStore } from "@/store/onesignal";
import { bulkyItemGetAllByChain } from "@/api/bulky";
import { AuthStatus } from "@/types/auth_status";

const isPlatformMobile = ["ios", "android"].includes(Platform.OS);
const oneSignalKey = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

export default function TabLayout() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const auth = useStore(authStore);
  const saved = useStore(savedStore);
  const selectedChainUID = saved.chainUID;

  const queryChain = useQuery({
    queryKey: ["auth", "chain", selectedChainUID],
    async queryFn() {
      // test with one request before asking for the rest
      const resChain = await chainGet(selectedChainUID, {
        addHeaders: true,
        addIsAppDisabled: true,
        addRoutePrivacy: true,
        addRules: true,
        addTheme: true,
        addTotals: true,
      })
        .then((res) => res.data)
        .catch(catchErrThrow401);
      const [resChainUsers, resChainRoute] = await Promise.all([
        userGetAllByChain(selectedChainUID)
          .then((res) => res.data)
          .catch(catchErrThrow401),
        routeGetOrder(selectedChainUID)
          .then((res) => res.data)
          .catch(catchErrThrow401),
      ]);
      if (
        typeof resChain === "string" ||
        typeof resChainUsers === "string" ||
        typeof resChainRoute === "string"
      )
        throw "Server is responding incorrectly";
      authStore.setState((s) => ({
        ...s,
        currentChain: resChain,
        currentChainUsers: resChainUsers,
        currentChainRoute: resChainRoute,
      }));

      return { resChain, resChainUsers };
    },
    enabled: Boolean(selectedChainUID && auth.authUser),
  });
  useQuery({
    queryKey: ["auth", "chain-bags", selectedChainUID],
    async queryFn() {
      // test with one request before asking for the rest
      const [resBags, resBulky] = await Promise.all([
        bagGetAllByChain(selectedChainUID, auth.authUser!.uid)
          .then((res) => res.data)
          .catch(catchErrThrow401),
        bulkyItemGetAllByChain(selectedChainUID, auth.authUser!.uid)
          .then((res) => res.data)
          .catch(catchErrThrow401),
      ]);
      if (typeof resBags === "string" || typeof resBulky === "string")
        throw "Server responds incorrectly";
      authStore.setState((s) => ({
        ...s,
        currentBags: resBags,
        currentBulky: resBulky,
      }));

      return null;
    },
    enabled: Boolean(selectedChainUID && auth.authUser),
  });
  useEffect(() => {
    if (queryChain.error) queryClient.clear();
  }, [queryChain.error]);

  // one signal
  useEffect(() => {
    if (!auth.authUser) return;
    if (!(oneSignalKey && isPlatformMobile)) return;
    if (!oneSignalStore.state.isInitialized) {
      OneSignal.initialize(oneSignalKey);
      OneSignal.Notifications.requestPermission(true);
      oneSignalStore.setState((s) => ({ ...s, isInitialized: true }));
    }
    if (!oneSignalStore.state.isLoggedIn) {
      OneSignal.login(auth.authUser!.uid);
      oneSignalStore.setState((s) => ({ ...s, isLoggedIn: true }));
    }
  }, [auth.authUser]);

  if (auth.authStatus === AuthStatus.LoggedOut) {
    console.info("back to onboarding");
    return <Redirect href="/onboarding/step1" />;
  }

  const screens: Array<JSX.Element> = [];

  if (auth.currentChain !== null) {
    screens.push(
      <Stack.Screen
        name="(tabs)"
        key="(tabs)"
        options={{
          headerShown: false,
        }}
      />,
      <Stack.Screen
        name="bags/edit/[bagId]"
        key="bags/edit/[bagId]"
        options={{
          title: t("edit"),
          headerBackTitle: t("bags"),
        }}
      />,
      <Stack.Screen
        name="bags/create"
        key="bags/create"
        options={{
          title: t("createBag"),
          headerBackTitle: t("bags"),
        }}
      />,
      <Stack.Screen
        name="bags/select"
        key="bags/select"
        options={{
          title: t("changeBagHolder"),
          headerTitleAlign: "center",
          presentation: "modal",
          headerBackTitle: t("bags"),
        }}
      />,
      <Stack.Screen
        name="bulky/create"
        key="bulky/create"
        options={{
          title: t("createBulkyItem"),
          headerBackTitle: t("bags"),
        }}
      />,
      <Stack.Screen
        name="bulky/edit/[bulkyId]"
        key="bulky/edit/[bulkyId]"
        options={{
          title: t("createBulkyItem"),
          headerBackTitle: t("bags"),
        }}
      />,
      <Stack.Screen
        key="chat/in-app/channel-create"
        name="chat/in-app/channel-create"
        options={{
          presentation: "modal",
          headerTitleAlign: "center",
          headerBackVisible: false,
        }}
      />,
      <Stack.Screen
        key="chat/in-app/channel-edit"
        name="chat/in-app/channel-edit"
        options={{
          headerTitleAlign: "center",
          presentation: "modal",
          headerBackVisible: false,
        }}
      />,
      <Stack.Screen
        key="info/select-theme"
        name="info/select-theme"
        options={{
          title: t("setLoopTheme"),
          presentation: "modal",
          headerBackVisible: true,
          headerBackTitle: t("info"),
        }}
      />,
      <Stack.Screen
        name="rules/change"
        key="rules/change"
        options={{
          title: t("customLoopRules"),
          headerBackTitle: t("rules"),
        }}
      />,
    );
  } else {
    screens.push(
      <Stack.Screen
        key="select-chain"
        name="select-chain"
        options={{
          headerTitle: t("selectALoop"),
          headerBackButtonDisplayMode: "generic",
          headerBackTitle: t("back"),
          headerShown: true,
        }}
      />,
    );
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      {screens}
      <Stack.Screen
        name="gdpr"
        options={{
          headerTitle: t("gdpr"),
          headerBackVisible: false,
          headerShown: true,
        }}
      />
    </Stack>
  );
}
