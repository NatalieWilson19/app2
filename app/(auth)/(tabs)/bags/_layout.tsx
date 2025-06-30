import { Text } from "@/components/ui/text";
import { AuthStoreContext } from "@/store/auth";
import { useStore } from "@nanostores/react";
import { Link, Stack } from "expo-router";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function BagsStackLayout() {
  const { t } = useTranslation();
  const { authStoreAuthUserRoles: authUserRoles } =
    useContext(AuthStoreContext);
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
