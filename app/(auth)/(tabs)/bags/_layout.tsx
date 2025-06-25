import { Text } from "@/components/ui/text";
import { authStoreAuthUserRoles } from "@/store/auth";
import { useStore } from "@tanstack/react-store";
import { Link, Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function BagsStackLayout() {
  const { t } = useTranslation();
  const authUserRoles = useStore(authStoreAuthUserRoles);
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen
        name="index"
        options={{
          title: t("bags"),
          headerRight: () =>
            authUserRoles.isHost ? (
              <Link href="/(auth)/bags/create" className="px-2">
                <Text size="xl" className="text-primary-500">
                  {t("create")}
                </Text>
              </Link>
            ) : undefined,
        }}
      />
    </Stack>
  );
}
