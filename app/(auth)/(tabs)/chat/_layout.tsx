import { chatTypeGet } from "@/api/chat_type";
import { AppType, ChatStoreContext } from "@/store/chat";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthStoreContext } from "@/store/auth";
import { useContext } from "react";

export default function ChatStackLayout() {
  const { t } = useTranslation();
  const { currentChain } = useContext(AuthStoreContext);
  const { setAppType, setChatUrl, setChatInAppDisabled } =
    useContext(ChatStoreContext);

  useQuery({
    queryKey: ["auth", "chat-type", currentChain?.uid],
    queryFn() {
      return chatTypeGet(currentChain!.uid).then((res) => {
        setAppType(res.data.chat_type as AppType);
        setChatUrl(res.data.chat_url);
        setChatInAppDisabled(res.data.chat_in_app_disabled);
        return null;
      });
    },
    enabled: Boolean(currentChain),
  });

  return (
    <Stack screenOptions={{}}>
      <Stack.Screen
        name="index"
        options={{
          title: t("chat"),
        }}
      />
      <Stack.Screen
        name="in-app"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="types"
        options={{
          title: t("chat"),
        }}
      />
    </Stack>
  );
}
