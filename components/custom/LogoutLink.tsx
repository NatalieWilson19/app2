import { useTranslation } from "react-i18next";
import { Button, ButtonText } from "../ui/button";
import { savedStore } from "@/store/saved";
import axios from "@/api/axios";
import { logout } from "@/api/login";
import { authStore } from "@/store/auth";
import { Box } from "../ui/box";
import { Alert } from "react-native";
import { oneSignalStore } from "@/store/onesignal";
import { OneSignal } from "react-native-onesignal";
import { chatStore } from "@/store/chat";
import { AuthStatus } from "@/types/auth_status";

export default function LogoutLink() {
  const { t } = useTranslation();

  function openLogoutDialog() {
    Alert.alert(t("logout"), t("areYouSureYouWantToLogout"), [
      {
        text: t("logout"),
        style: "destructive",
        onPress() {
          onLogout();
        },
      },
      {
        text: t("cancel"),
        style: "cancel",
      },
    ]);
  }

  function onLogout() {
    logout().finally(() => {
      axios.defaults.auth = undefined;
      savedStore.setState(() => ({
        userUID: "",
        token: "",
        chainUID: "",
      }));
      authStore.setState(() => ({
        authStatus: AuthStatus.LoggedOut,
        authUser: null,
        currentChain: null,
        currentChainUsers: null,
        currentBags: null,
        currentBulky: null,
        currentChainRoute: null,
      }));
      // chatStore.state.conn?.close();
      chatStore.setState((s) => ({
        ...s,
        appType: null,
        chatUrl: "",
        state: {},
        // connStatus: ChatConnStatus.Loading,
        // conn: null,
        // chatAuth: null,
      }));
      if (oneSignalStore.state.isLoggedIn) {
        OneSignal.logout();
        oneSignalStore.setState((s) => ({ ...s, isLoggedIn: false }));
      }
    });
  }

  return (
    <Box className="p-6">
      <Button
        onPress={openLogoutDialog}
        size="xl"
        action="negative"
        className="grow"
      >
        <ButtonText>{t("logout")}</ButtonText>
      </Button>
    </Box>
  );
}
