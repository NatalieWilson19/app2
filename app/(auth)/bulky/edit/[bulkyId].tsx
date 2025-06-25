import BulkyPatch from "@/components/custom/bulky/BulkyPatch";
import { authStore } from "@/store/auth";
import { useStore } from "@tanstack/react-store";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function BulkyEdit() {
  const { bulkyId: bulkyIdStr }: { bulkyId: string } = useLocalSearchParams();
  const bulkyList = useStore(authStore, (s) => s.currentBulky);

  return useCallback(() => {
    const bulkyId = parseInt(bulkyIdStr);
    const bulky = bulkyList?.find((b) => b.id == bulkyId);
      if (!bulkyId) return null;

    return bulky ? <BulkyPatch BulkyItem={bulky} /> : null;
  }, [bulkyList, bulkyIdStr])();
}
