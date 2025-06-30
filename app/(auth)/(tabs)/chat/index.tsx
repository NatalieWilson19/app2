import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Redirect } from "expo-router";
import { ChatStoreContext } from "@/store/chat";
import { useContext } from "react";

export default function ChatChange() {
  const { chatInAppDisabled } = useContext(ChatStoreContext);
  if (chatInAppDisabled === false) {
    return <Redirect href="/(auth)/(tabs)/chat/in-app" />;
  } else if (chatInAppDisabled === true) {
    return <Redirect href="/(auth)/(tabs)/chat/types" />;
  }
  return (
    <Box>
      <Text>Redirecting...</Text>
    </Box>
  );
}
