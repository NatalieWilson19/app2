import ProviderFactory from "@/utils/ProviderFactory";
import { useState } from "react";

export const [OneSignalStoreProvider, OneSignalStoreContext] = ProviderFactory(
  () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return { isInitialized, setIsInitialized, isLoggedIn, setIsLoggedIn };
  },
);
