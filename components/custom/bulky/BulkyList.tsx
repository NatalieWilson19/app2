import { BulkyItem } from "@/api/typex2";
import { VStack } from "@/components/ui/vstack";
import { useCallback, useContext, useMemo, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { Alert } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useStore } from "@nanostores/react";
import { router } from "expo-router";
import { bulkyItemRemove } from "@/api/bulky";
import { useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import BulkyListItem from "./BulkyListItem";
import BulkySelectedModal from "./BulkySelectedModal";
import { AuthStoreContext } from "@/store/auth";

export default function BulkyList(props: { bulkyList: BulkyItem[] }) {
  const [selected, setSelected] = useState<BulkyItem | null>(null);
  const { showActionSheetWithOptions } = useActionSheet();
  const { authUser, authStoreAuthUserRoles } = useContext(AuthStoreContext);
  const { isHost } = authStoreAuthUserRoles;
  const queryClient = useQueryClient();
  const cols = useMemo(() => {
    const col1: BulkyItem[] = [];
    let col1mass = 0;
    const col2: BulkyItem[] = [];
    let col2mass = 0;
    props.bulkyList
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .forEach((bulky, i) => {
        if (col1mass > col2mass) {
          col2.push(bulky);
          col2mass += bulky.image_url ? 2 : 1;
        } else {
          col1.push(bulky);
          col1mass += bulky.image_url ? 2 : 1;
        }
      });
    return [col1, col2];
  }, [props.bulkyList]);

  function bulkyOptionsHandler(bulky: BulkyItem) {
    if (!(bulky?.user_uid === authUser?.uid || isHost)) return;

    const options = [t("cancel"), t("edit"), t("delete")];

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          // edit
          router.push(`/(auth)/bulky/edit/${bulky.id}/`);
        } else if (buttonIndex === 2) {
          // delete
          Alert.alert(
            t("deleteBulkyItem"),
            t("areYouSureYouWantToDeleteThisBulkyItem"),
            [
              {
                text: t("delete"),
                style: "destructive",
                onPress() {
                  bulkyItemRemove(bulky.chain_uid, bulky.user_uid, bulky.id);
                  queryClient.invalidateQueries({
                    queryKey: ["auth", "chain-bags", bulky.chain_uid],
                    exact: true,
                  });
                },
              },
              {
                text: t("cancel"),
                style: "cancel",
              },
            ],
          );
        }
      },
    );
  }
  const renderSelectedModal = useCallback(() => {
    if (!selected) return null;
    return <BulkySelectedModal selected={selected} setSelected={setSelected} />;
  }, [selected]);
  return (
    <>
      <HStack className="pb-6 pt-1">
        {cols.map((list, i) => (
          <VStack key={i} className="w-1/2">
            {list.map((bulky) => {
              const isEditable = bulky.user_uid === authUser?.uid || isHost;
              return (
                <BulkyListItem
                  bulky={bulky}
                  key={bulky.id}
                  setSelected={() => setSelected(bulky)}
                  isEditable={isEditable}
                  onOpenOptions={() => bulkyOptionsHandler(bulky)}
                />
              );
            })}
          </VStack>
        ))}
      </HStack>
      {renderSelectedModal()}
    </>
  );
}
