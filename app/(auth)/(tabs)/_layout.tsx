import { router, Tabs } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useStore } from "@tanstack/react-store";
import { authStore, authStoreListBags } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { chainGet } from "@/api/chain";
import { savedStore } from "@/store/saved";
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

export default function TabLayout() {
  // const queryClient = useQueryClient();
  const { t } = useTranslation();
  const auth = useStore(authStore);
  const listBags = useStore(authStoreListBags);
  const selectedChainUID = useStore(savedStore, (s) => s.chainUID);
  // const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    if (auth.authUser) {
      const shouldRedirectGdpr =
        auth.authUser.accepted_dpa === false ||
        auth.authUser.accepted_toh === false;
      if (shouldRedirectGdpr) {
        const isAnyHost = auth.authUser.chains.some((uc) => uc.is_chain_admin);

        if (isAnyHost && shouldRedirectGdpr) router.replace("/(auth)/gdpr");
      }
    }

    // if no chain selected
    if (!selectedChainUID && auth.authStatus == AuthStatus.LoggedIn) {
      router.replace("/(auth)/select-chain");
    }
  }, [selectedChainUID, auth.authStatus]);

  useQuery({
    queryKey: [
      "auth",
      "user-chains",
      auth.authUser?.uid,
      auth.authUser?.chains?.join(","),
    ],
    async queryFn() {
      if (!auth.authUser?.chains.length) {
        return [];
      }

      const promises = auth.authUser.chains
        .filter((c) => c.is_approved)
        .map((c) => chainGet(c.chain_uid).then((res) => res.data));
      return await Promise.all(promises);
    },
    networkMode: "offlineFirst",
  });
  const bagTabBadge = useMemo(() => {
    const currentAuthUserUID = auth.authUser?.uid;
    if (!listBags || !currentAuthUserUID) return 0;
    return listBags.reduce((v, b, i) => {
      if (b.bag.user_uid !== currentAuthUserUID) return v;
      if (b.isTooOld.isBagTooOldMe) return v + 1;
      return v;
    }, 0);
  }, [auth.authUser?.uid, listBags]);

  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        tabBarBackground: () => (
          <Box className="absolute inset-0 bg-background-100">
            <ThemeBackground
              theme={auth.currentChain?.theme || ""}
              className="absolute w-full"
              style={{ top: -14, height: 14 }}
            >
              <Text
                size="xs"
                bold
                className="text-center text-white"
                numberOfLines={1}
              >
                {auth.currentChain?.name || t("selectALoop")}
              </Text>
            </ThemeBackground>
          </Box>
        ),
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          lazy: false,
          headerShown: false,
          title: t("rules"),
          tabBarIcon: ({ color }) => (
            <BookOpen size={28} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          lazy: false,
          headerShown: false,
          title: t("route"),
          tabBarIcon: ({ color }) => <Route size={28} color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="bags"
        options={{
          lazy: false,
          headerShown: false,
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
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MessageCircle size={28} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: t("info"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <UserCircle2 size={28} color={color as any} />
          ),
        }}
      />
    </Tabs>
  );
}
