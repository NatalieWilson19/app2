import BulkyPatch from "@/components/custom/bulky/BulkyPatch";
import { AuthStoreContext } from "@/store/auth";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useContext } from "react";

export default function BulkyEdit() {
  const { bulkyId: bulkyIdStr }: { bulkyId: string } = useLocalSearchParams();
  const { currentBulky: bulkyList } = useContext(AuthStoreContext);

  return useCallback(() => {
    const bulkyId = parseInt(bulkyIdStr);
    const bulky = bulkyList?.find((b) => b.id == bulkyId);
    if (!bulkyId) return null;

    return bulky ? <BulkyPatch BulkyItem={bulky} /> : null;
  }, [bulkyList, bulkyIdStr])();
}
