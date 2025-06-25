import ChatChannelCreateEdit from "@/components/custom/chat/ChatChannelsCreateEdit";
import { Box } from "@/components/ui/box";
import { chatStore } from "@/store/chat";
import { useStore } from "@tanstack/react-store";

export default function ChatCreate() {
  const { editChannel } = useStore(chatStore);

  if (!editChannel) return <Box />;
  return (
    <ChatChannelCreateEdit
      currentChatChannel={editChannel.channel}
      fallbackChainUID={editChannel.fallbackChainUID}
    />
  );
}
