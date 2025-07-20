import ChatChannelCreateEdit from "@/components/custom/chat/ChatChannelsCreateEdit";
import { Box } from "@/components/ui/box";
import { ChatStoreContext } from "@/store/chat";
import { useContext } from "react";

export default function ChatEdit() {
  const { editChannel } = useContext(ChatStoreContext);

  if (!editChannel) return <Box />;
  return (
    <ChatChannelCreateEdit
      currentChatChannel={editChannel.channel}
      fallbackChainUID={editChannel.fallbackChainUID}
    />
  );
}
