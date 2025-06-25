import { Text } from "@/components/ui/text";
import { authStoreAuthUserRoles } from "@/store/auth";
import { useStore } from "@tanstack/react-store";
import { Link, Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function RulesStackLayout() {
  const isHost = useStore(authStoreAuthUserRoles, (s) => s.isHost);
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          title: t("howDoesItWork"),
          headerRight: isHost
            ? () => (
                <Link asChild push href="/(auth)/rules/change">
                  <Text>{t("edit")}</Text>
                </Link>
              )
            : undefined,
        }}
      />
    </Stack>
  );
}
