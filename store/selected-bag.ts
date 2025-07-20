import { useState } from "react";
import { ListBag } from "./auth";
import ProviderFactory from "@/utils/ProviderFactory";

export const [SelectedBagStoreProvider, SelectedBagStoreContext] =
  ProviderFactory(() => {
    const [selectedBagStore, setSelectedBagStore] = useState<null | ListBag>(
      null,
    );

    return { selectedBagStore, setSelectedBagStore };
  });
