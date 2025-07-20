import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function ModalsLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={{}}>
      <Stack.Screen
        name="index"
        options={{ title: t("chat"), headerBackVisible: false }}
      />
      <Stack.Screen
        name="channel-create"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="channel-edit"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="types"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          title: t("imSelectChatApp"),
        }}
      />
    </Stack>
  );
}
