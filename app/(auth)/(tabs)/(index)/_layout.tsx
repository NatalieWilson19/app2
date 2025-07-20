import { Text } from "@/components/ui/text";
import { AuthStoreContext } from "@/store/auth";
import { Link, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCallback, useContext } from "react";

export default function RulesStackLayout() {
  const { authStoreAuthUserRoles } = useContext(AuthStoreContext);
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          title: t("howDoesItWork"),
          headerRight: authStoreAuthUserRoles.isHost
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
