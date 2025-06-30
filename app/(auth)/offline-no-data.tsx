import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { AuthStoreContext } from "@/store/auth";
import { AuthStatus } from "@/types/auth_status";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { LucideServerOff } from "lucide-react-native";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ActivityIndicator } from "react-native";

export default function OfflineNoData() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { authStatus, currentChain } = useContext(AuthStoreContext);

  function onPressRefresh() {
    setIsLoading(true);
    queryClient
      .invalidateQueries({ refetchType: "all" })
      .then(() => {
        if (authStatus === AuthStatus.LoggedIn) {
          if (currentChain) {
            console.info("back to home");
            router.replace("/(auth)/(tabs)/(index)");
          } else {
            console.info("back to select-chain");
            router.replace("/(auth)/select-chain");
          }
        } else if (authStatus === AuthStatus.LoggedOut) {
          console.info("back to select-chain");
          router.replace("/(auth)/select-chain");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <SafeAreaView className="absolute inset-0 flex-1">
      <Box className="relative flex-grow items-center justify-center gap-4">
        <Text className="text-2xl font-bold">{t("offline")}</Text>
        <Icon as={LucideServerOff} className="h-28 w-28 text-typography-600" />
        <Box className="absolute bottom-0 gap-8">
          {isLoading ? <ActivityIndicator size="large" /> : null}
          <Button
            onPress={onPressRefresh}
            size="xl"
            className="mb-10"
            isDisabled={isLoading}
          >
            <ButtonText>{t("refresh")}</ButtonText>
          </Button>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
