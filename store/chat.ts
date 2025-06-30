import { UID } from "@/api/types";
import { ChatChannel } from "@/api/typex2";
import ProviderFactory from "@/utils/ProviderFactory";
import { useState } from "react";

export enum ChatConnStatus {
  Loading,
  LoggedIn,
  Error,
}

export type AppType = "off" | "signal" | "whatsapp" | "telegram";

export type MmState = "loading" | "error" | "success";

export type EditChannel = {
  channel: null | ChatChannel;
  fallbackChainUID: UID;
};

export const [ChatStoreProvider, ChatStoreContext] = ProviderFactory(() => {
  const [appType, setAppType] = useState<AppType | null>(null);
  const [chatUrl, setChatUrl] = useState("");
  const [chatInAppDisabled, setChatInAppDisabled] = useState<boolean | null>(
    null,
  );
  const [editChannel, setEditChannel] = useState<EditChannel | null>(null);

  function reset() {
    setAppType(null);
    setChatUrl("");
    setChatInAppDisabled(null);
    setEditChannel(null);
  }

  return {
    // state
    appType,
    setAppType,
    chatUrl,
    setChatUrl,
    chatInAppDisabled,
    setChatInAppDisabled,
    editChannel,
    setEditChannel,

    // fn
    reset,
  };
});
