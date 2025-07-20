import { useTranslation } from "react-i18next";
import { Button, ButtonText } from "../ui/button";
import { SavedStoreContext } from "@/store/saved";
import axios from "@/api/axios";
import { logout } from "@/api/login";
import { AuthStoreContext } from "@/store/auth";
import { Box } from "../ui/box";
import { Alert } from "react-native";
import { OneSignalStoreContext } from "@/store/onesignal";
import { OneSignal } from "react-native-onesignal";
import { ChatStoreContext } from "@/store/chat";
import { router } from "expo-router";
import { useContext } from "react";

export default function LogoutLink() {
  const { t } = useTranslation();
  const { reset: resetSaved } = useContext(SavedStoreContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(OneSignalStoreContext);
  const { resetAuth } = useContext(AuthStoreContext);
  const { reset: resetChat } = useContext(ChatStoreContext);

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

      resetSaved();
      resetAuth();
      resetChat();

      if (isLoggedIn) {
        OneSignal.logout();
        setIsLoggedIn(false);
      }
      router.replace("/onboarding/login");
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
