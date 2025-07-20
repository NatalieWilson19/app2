import ProviderFactory from "@/utils/ProviderFactory";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const storage =
  Platform.OS == "web"
    ? {
        get: (k: string) => localStorage.getItem(k) || "",
        set: (k: string, v: string) => localStorage.setItem(k, v),
      }
    : {
        get: (k: string) => SecureStore.getItem(k),
        set: (k: string, v: string) => SecureStore.setItem(k, v),
      };

export interface Saved {
  userUID: string;
  token: string;
  chainUID: string;
}

function GetSaved(): Saved {
  return {
    userUID: storage.get("user_uid") || "",
    token: storage.get("token") || "",
    chainUID: storage.get("chain_uid") || "",
  };
}

export const [SavedStoreProvider, SavedStoreContext] = ProviderFactory(() => {
  const [saved, setSaved] = useState<Saved>(GetSaved);

  useEffect(() => {
    storage.set("user_uid", saved.userUID || "");
    storage.set("token", saved.token || "");
    storage.set("chain_uid", saved.chainUID || "");
  }, [saved]);

  function reset() {
    setSaved({
      userUID: "",
      token: "",
      chainUID: "",
    });
  }

  return {
    // state
    saved,
    setSaved,

    // fn
    reset,
  };
});
