import BagPatch from "@/components/custom/bags/BagPatch";
import { authStore } from "@/store/auth";
import { useStore } from "@tanstack/react-store";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BagEdit() {
  const { bagId: bagIdStr }: { bagId: string } = useLocalSearchParams();
  const bags = useStore(authStore, (s) => s.currentBags);

  return useCallback(() => {
    const bagId = parseInt(bagIdStr);
    const bag = bags?.find((b) => b.id == bagId);
    return bag ? (
      <SafeAreaView
        edges={{ bottom: "off", top: "additive" }}
        style={{ flex: 1, backgroundColor: "#ffffff" }}
      >
        <BagPatch bag={bag} />
      </SafeAreaView>
    ) : null;
  }, [bags, bagIdStr])();
}
