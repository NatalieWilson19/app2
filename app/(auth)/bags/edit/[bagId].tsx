import BagPatch from "@/components/custom/bags/BagPatch";
import { AuthStoreContext } from "@/store/auth";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BagEdit() {
  const { bagId: bagIdStr }: { bagId: string } = useLocalSearchParams();
  const { currentBags: bags } = useContext(AuthStoreContext);

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
