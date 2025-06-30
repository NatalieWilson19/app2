import { router, Tabs } from "expo-router";
import React, { useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useStore } from "@nanostores/react";
import { AuthStoreContext } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { chainGet } from "@/api/chain";
import { SavedStoreContext } from "@/store/saved";
import {
  BookOpen,
  MessageCircle,
  Route,
  ShoppingBag,
  UserCircle2,
} from "lucide-react-native";
// import { useColorScheme } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { AuthStatus } from "@/types/auth_status";
import ThemeBackground from "@/components/custom/ThemeBackground";
import { basicThemeColors } from "@/constants/Colors";

export default function TabLayout() {
  // const queryClient = useQueryClient();
  const { t } = useTranslation();
  const {
    authStatus,
    authStoreListBags: listBags,
    authUser,
    currentChain,
  } = useContext(AuthStoreContext);
  const { saved } = useContext(SavedStoreContext);
  const { chainUID: selectedChainUID } = saved;
  // const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    if (authUser) {
      const shouldRedirectGdpr =
        authUser.accepted_dpa === false || authUser.accepted_toh === false;
      if (shouldRedirectGdpr) {
        const isAnyHost = authUser.chains.some((uc) => uc.is_chain_admin);

        if (isAnyHost && shouldRedirectGdpr) router.replace("/(auth)/gdpr");
      }
    }

    // if no chain selected
    if (!selectedChainUID && authStatus == AuthStatus.LoggedIn) {
      router.replace("/(auth)/select-chain");
    }
  }, [selectedChainUID, authStatus]);

  useQuery({
    queryKey: [
      "auth",
      "user-chains",
      authUser?.uid,
      authUser?.chains?.join(","),
    ],
    async queryFn() {
      if (!authUser?.chains.length) {
        return [];
      }

      const promises = authUser.chains
        .filter((c) => c.is_approved)
        .map((c) => chainGet(c.chain_uid).then((res) => res.data));
      return await Promise.all(promises);
    },
    networkMode: "offlineFirst",
  });
  const bagTabBadge = useMemo(() => {
    const currentAuthUserUID = authUser?.uid;
    if (!listBags || !currentAuthUserUID) return 0;
    return listBags.reduce((v, b, i) => {
      if (b.bag.user_uid !== currentAuthUserUID) return v;
      if (b.isTooOld.isBagTooOldMe) return v + 1;
      return v;
    }, 0);
  }, [authUser?.uid, listBags]);

  const themeColor = useMemo(() => {
    const theme = currentChain?.theme || "";
    const color =
      (basicThemeColors as Record<string, string>)[theme] || "#5f9c8a";
    return color + "33";
  }, [currentChain?.theme]);

  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,

        // headerTransparent: true,
        tabBarInactiveBackgroundColor: themeColor,
        tabBarActiveBackgroundColor: themeColor,
        tabBarActiveTintColor: "#353535",
        tabBarInactiveTintColor: "#6b6b6b",
        tabBarBackground: () => (
          <Box className="absolute inset-0 bg-background-100">
            <ThemeBackground
              theme={currentChain?.theme || ""}
              className="absolute w-full"
              style={{ top: -14, height: 14 }}
            >
              <Text
                size="xs"
                bold
                className="text-center text-white"
                numberOfLines={1}
              >
                {currentChain?.name || t("selectALoop")}
              </Text>
            </ThemeBackground>
          </Box>
        ),
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          headerShown: false,
          tabBarLabel: t("rules"),
          tabBarIcon: ({ color }) => (
            <BookOpen size={28} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          lazy: false,
          title: t("addresses"),
          tabBarLabel: t("route"),
          tabBarIcon: ({ color }) => <Route size={28} color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="bags"
        options={{
          lazy: false,
          tabBarBadge: bagTabBadge || undefined,
          title: t("bags"),
          tabBarIcon: ({ color }) => (
            <ShoppingBag size={28} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("chat"),
          tabBarIcon: ({ color }) => (
            <MessageCircle size={28} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: t("info"),
          tabBarIcon: ({ color }) => (
            <UserCircle2 size={28} color={color as any} />
          ),
        }}
      />
    </Tabs>
  );
}
