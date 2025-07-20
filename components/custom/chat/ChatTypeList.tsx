import { useContext, useMemo } from "react";
import ChatTypeEdit from "./ChatTypeEdit";
import { useTranslation } from "react-i18next";
import { AuthStoreContext } from "@/store/auth";
import { ChatStoreContext } from "@/store/chat";
import { messageInApp, messagingApps } from "@/constants/MessagingApps";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ExternalPathString, Link } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { MessageCircleQuestionIcon } from "lucide-react-native";
import { Card } from "@/components/ui/card";

export default function ChatTypeList(props: { onPressEnterInApp: () => void }) {
  const { t } = useTranslation();
  const { authStoreAuthUserRoles: authUserRoles } =
    useContext(AuthStoreContext);
  const { appType, chatUrl, chatInAppDisabled } = useContext(ChatStoreContext);

  const currentChatApp = useMemo(() => {
    switch (appType) {
      case "signal":
        return messagingApps[0];
      case "whatsapp":
        return messagingApps[2];
      case "telegram":
        return messagingApps[3];
      default:
        return null;
    }
  }, [appType]);

  return (
    <Box className="flex-1">
      {authUserRoles.isHost ? <ChatTypeEdit /> : null}
      {!currentChatApp && chatInAppDisabled ? (
        <VStack className="items-center gap-4 py-5">
          <Icon
            as={MessageCircleQuestionIcon}
            className="h-24 w-24 text-typography-300"
          />
          <Text className="text-center text-xl">
            {authUserRoles.isHost
              ? t("imChatChannelDisabled")
              : t("imAskHostToSelectAChatApp")}
          </Text>
        </VStack>
      ) : (
        <Box
          className={`mb-8 flex grow items-center justify-around gap-2 p-2 ${authUserRoles.isHost ? "flex-row" : ""}`}
        >
          {currentChatApp ? (
            <Card className="min-w-40 items-center gap-2 rounded-lg bg-background-0 px-3 py-4">
              <currentChatApp.source
                width={48}
                height={48}
                color={currentChatApp.bgColor}
              />
              <Text className="text-center text-lg">
                {currentChatApp.title}
              </Text>
              <Link href={chatUrl as ExternalPathString} asChild>
                <Button
                  style={{ backgroundColor: currentChatApp.bgColor }}
                  className="rounded-pill"
                  size="xl"
                >
                  <ButtonText style={{ color: currentChatApp.fgColor }}>
                    {t("join")}
                  </ButtonText>
                </Button>
              </Link>
            </Card>
          ) : null}
          {chatInAppDisabled !== true ? (
            <Card className="min-w-40 items-center gap-2 rounded-lg bg-background-0 px-3 py-4">
              <messageInApp.source
                width={48}
                height={48}
                color={messageInApp.bgColor}
              />
              <Text className="text-center text-lg">{messageInApp.title}</Text>
              <Link replace href="/(auth)/(tabs)/chat/in-app" asChild>
                <Button
                  style={{ backgroundColor: messageInApp.bgColor }}
                  className="rounded-pill"
                  size="xl"
                >
                  <ButtonText style={{ color: messageInApp.fgColor }}>
                    {t("enter")}
                  </ButtonText>
                </Button>
              </Link>
            </Card>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
